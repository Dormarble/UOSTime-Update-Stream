import "reflect-metadata";
import { inject, injectable } from "inversify";
import { TYPES } from "../config/types.config";
import { WiseService } from "./wise.service";
import { checkInput } from "../util/formatChecker.util";
import { LectureInfo } from "../model/lectureInfo.model";
import mongoClient from "../util/mongo.db";

const TMP_LECTUREINFO_COL = 'tmplectureinfos';
const LECTUREINFO_COL = 'lectureinfos';
const CAPPED_COL_SIZE = 10 * 1024 * 1024;

@injectable()
export class LectureService {
  private wiseService: WiseService;

  constructor(@inject(TYPES.WiseService) wiseService: WiseService) {
      this.wiseService = wiseService;
  }

  public async update(year: number, term: string): Promise<void> {
    checkInput(year, term);

    const tmpLectures = await this.wiseService.loadAllLectures(year, term);

    const client = await mongoClient.connect()
    const db = client.db(process.env.databaseName)

    const isExistTmpCol = await db.listCollections({name: TMP_LECTUREINFO_COL}).hasNext();
    if (isExistTmpCol) {
      db.dropCollection(TMP_LECTUREINFO_COL);
    }

    const tmpCollection = await db.createCollection<LectureInfo>(TMP_LECTUREINFO_COL, {capped: true, size: CAPPED_COL_SIZE});
    await tmpCollection.insertMany(tmpLectures);

    const result = await db.collection(LECTUREINFO_COL).aggregate([
      {
          $match: {
              year: String(year),
              term,
          }
      },
      {
          $lookup: {
              from: TMP_LECTUREINFO_COL,
              localField: 'key',
              foreignField: 'key',
              as: 'nlecture',
          }
      },
      {
          $match: {'nlecture': {$ne: []}}
      },
      {
          $addFields: { nlecture: { $first: '$nlecture'} }
      },
      {
          $project: {
              key: 1,
              old: {
                  lec_cd: '$lec_cd',
                  subject_nm: '$subject_nm',
                  sub_dept: '$sub_dept',
                  day_night_nm: '$day_night_nm',
                  shyr: '$shyr',
                  credit: '$credit',
                  class_nm: '$class_nm',
                  prof_nm: '$prof_nm',
                  class_type: '$class_type',
                  etc_permit_yn: '$etc_permit_yn',
                  sec_permit_yn: '$sec_permit_yn',
                  tlsn_limit_count: '$tlsn_limit_count',
                  tlsn_count: '$tlsn_count',
                  classroom: '$classroom',
              },
              new: {
                  lec_cd: '$nlecture.lec_cd',
                  subject_nm: '$nlecture.subject_nm',
                  sub_dept: '$nlecture.sub_dept',
                  day_night_nm: '$nlecture.day_night_nm',
                  shyr: '$nlecture.shyr',
                  credit: '$nlecture.credit',
                  class_nm: '$nlecture.class_nm',
                  prof_nm: '$nlecture.prof_nm',
                  class_type: '$nlecture.class_type',
                  etc_permit_yn: '$nlecture.etc_permit_yn',
                  sec_permit_yn: '$nlecture.sec_permit_yn',
                  tlsn_limit_count: '$nlecture.tlsn_limit_count',
                  tlsn_count: '$nlecture.tlsn_count',
                  classroom: '$nlecture.classroom',  
              }
          }
      },
      {
          $addFields: {
              cmp: {
                  $cmp: ['$old', '$new']
              }
          },
      },
      {
          $match: { cmp: {$ne: 0} }
      },
    ]).toArray();

    const promises = result.map((doc) => {
      return db.collection(LECTUREINFO_COL).updateOne({_id: doc._id}, 
      {
          $set: {
              lec_cd: doc.new.lec_cd,
              subject_nm: doc.new.subject_nm,
              sub_dept: doc.new.sub_dept,
              day_night_nm: doc.new.day_night_nm,
              shyr: doc.new.shyr,
              credit: doc.new.credit,
              class_nm: doc.new.class_nm,
              prof_nm: doc.new.prof_nm,
              class_type: doc.new.class_type,
              etc_permit_yn: doc.new.etc_permit_yn,
              sec_permit_yn: doc.new.sec_permit_yn,
              tlsn_limit_count: doc.new.tlsn_limit_count,
              tlsn_count: doc.new.tlsn_count,
              classroom: doc.new.classroom,
          }
      })
    })
    await Promise.all(promises);
    
    await db.dropCollection(TMP_LECTUREINFO_COL);
  }
}