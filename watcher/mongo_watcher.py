from numbers import Number

import rx
import os
from rx import operators as op
import dotenv
import certifi

from pymongo import MongoClient

UPDATE_SQL = 'UPDATE LECTURE SET {set_clause} WHERE {where_condition}'


def oplog_to_update_plan(oplog):
    documentKey = oplog['documentKey']['_id']
    return {
        'operation': oplog['operationType'],
        'documentKey': documentKey,
        'update_description': oplog['updateDescription']['updatedFields']
    }


def dict_to_str(d: dict):
    s = ''
    for k, v in d.items():
        typed_v = v if isinstance(v, Number) else f"'{v}'"
        s += f"{k}={typed_v}"

    return s


def build_sql():
    def _build_sql(source):
        def subscribe(observer, scheduler=None):
            def on_next(plan):

                sql = UPDATE_SQL.format(
                    set_clause=dict_to_str(plan['update_description']),
                    where_condition=dict_to_str({'key': plan['documentKey']})
                )

                observer.on_next(sql)
            return source.subscribe(
                on_next,
                observer.on_error,
                observer.on_completed,
                scheduler
            )
        return rx.create(subscribe)
    return _build_sql


def main():
    dotenv.load_dotenv(verbose=True)
    mongo_url = os.getenv('mongodb')
    mongo_database = os.getenv('databaseName')

    client = MongoClient(
        host=mongo_url,
        tlsCAFile=certifi.where())

    db = client.get_database(mongo_database)

    rx.from_iterable(db.get_collection('lectureinfos').watch())\
        .pipe(
            op.map(oplog_to_update_plan),
            build_sql(),
        )\
        .subscribe(print)


if __name__ == '__main__':
    main()
