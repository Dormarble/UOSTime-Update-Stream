import { parseStringPromise } from 'xml2js';
import { InternalServerException } from '../exception/internal.exception';

export function getFullDeptName(keyword) {
  switch (keyword) {
    case '건공':
      return '건축공학과';
    case '국관':
      return '국제관계학과';
    case '기공':
      return '기계정보공학과';
    case '사복':
      return '사회복지학과';
    case '스과':
      return '스포츠과학과';
    case '전전':
    case '전컴':
    case '전전컴':
      return '전자전기컴퓨터공학부';
    case '중문':
      return '중국어문화학과';
    case '도공':
      return '도시공학과';
    case '도사':
      return '도시사회학과';
    case '도행':
      return '도시행정학과';
    case '컴과':
      return '컴퓨터과학부';
    case '화공':
      return '화학공학과';
    case '환공':
      return '환경공학부';
    case '환원':
      return '환경원예학과';
    case '환조':
      return '환경조각학과';
    default:
      return keyword;
  }
}

interface BuildingName {
  short: string,
  long: string,
}

const BUILDING_CODE_MAP: { [index: string]: BuildingName } = {
  '1': { short: '전농관', long: '전농관' },
  '2': { short: '1공학관', long: '제1공학관' },
  '3': { short: '건공관', long: '건설공학관' },
  '4': { short: '창공관', long: '창공관' },
  '5': { short: '인문학관', long: '인문학관' },
  '6': { short: '배봉관', long: '배봉관' },
  '7': { short: '본부', long: '대학본부' },
  '8': { short: '자과관', long: '자연과학관' },
  '9': { short: '음악관', long: '음악관' },
  '10': { short: '경농관', long: '경농관' },
  '11': { short: '2공학관', long: '제2공학관' },
  '12': { short: '학관', long: '학생회관' },
  '13': { short: '언무관', long: '언무관' },
  '14': { short: '과기관', long: '과학기술관' },
  '15': { short: '21세기관', long: '21세기관' },
  '16': { short: '조형관', long: '조형관' },
  '17': { short: '체육관', long: '체육관' },
  '18': { short: '자작마루', long: '자작마루' },
  '19': { short: '정기관', long: '정보기술관' },
  '20': { short: '법학관', long: '법학관' },
  '21': { short: '중도', long: '중앙도서관' },
  '22': { short: '생활관', long: '생활관' },
  '23': { short: '건축구조실험동', long: '건축구조실험동' },
  '24': { short: '토목구조실험실', long: '토목구조실험실' },
  '25': { short: '미디어관', long: '미디어관' },
  '26': { short: '(구)온실', long: '(구)자동화온실' },
  '27': { short: '대강당', long: '대강당' },
  '28': { short: '대운동장', long: '대운동장' },
  '29': { short: '박물관', long: '박물관' },
  '30': { short: '분교', long: '서울시민대학분교' },
  '31': { short: '중랑분교', long: '서울시민대학중랑분교' },
  '32': { short: '웰니스', long: '웰니스센터' },
  '33': { short: '미래관', long: '미래관' },
  '34': { short: '국제학사', long: '국제학사' },
  '35': { short: '음악관', long: '음악관' },
  '36': { short: '어린이집', long: '서울시립대학교직장어린이집' },
  '37': { short: '백기관', long: '100주년 기념관' },
  '41': { short: '테니스장', long: '실외 테니스장' },
};

export function convertTimeCodeAndRoom(timeCodeRoom: string) {
  const timeCode = [
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
  ];

  let classRoomList = '';

  const day2Code: { [key: string]: number } = {
    월: 0,
    화: 1,
    수: 2,
    목: 3,
    금: 4,
    토: 5,
  };

  const matchRoomCheck = timeCodeRoom.match(/\d{3}\/\d{1,3}/gi);
  const matchSpaceCheck = timeCodeRoom.match(/\/[가-힣]+[\s]/gi);

  if (matchRoomCheck) {
    matchRoomCheck.forEach((item) => {
      timeCodeRoom = timeCodeRoom.replace(item, item.split('/').join('~'));
    });
  }

  if (matchSpaceCheck) {
    matchSpaceCheck.forEach((item) => {
      timeCodeRoom = timeCodeRoom.replace(item, item.slice(0, -1));
    });
  }

  const timeRoom = timeCodeRoom.split(/[/\s]/);

  const result: TimePlace = {
    day: '',
    time: new Array<string>(),
    building: '',
    room: new Array<string>(),
  };

  timeRoom.forEach((element, i) => {
    // 짝수 -> 시간, 홀수 -> 건물번호
    if (i % 2 == 0) {
      result.day = element.charAt(0); //월, 화, 수 ...
      result.time = element.slice(1).split(','); // 6교시, 7교시 ...
    } else {
      const tmp = element.split(/[-]/);

      result.building = tmp[0];
      if (tmp[1] !== undefined) {
        if (tmp[1].slice(-1) == ',') {
          result.room.push(tmp[1].slice(0, -1));
        } else {
          result.room.push(tmp[1]);
        }
      }
      // 비트맵에 시간대 체크
      result.time.forEach(function (v, t_i) {
        const target = parseInt(v) - 1;
        const day = day2Code[result.day];

        timeCode[day] =
          timeCode[day].substr(0, target) +
          '1' +
          timeCode[day].substr(target + 1);

        let building = '';

        if (result.building === '') {
          building =
            result.building.slice(-1) == ','
              ? result.building.slice(0, -1)
              : result.building;
        } else {
          building = getShortBuildingNameByCode(result.building);
        }

        classRoomList += building + result.room + '|';
      });
    }
  });

  const returnTimeCodeRoom = {
    lectureTimeCode: timeCode,
    classroom: classRoomList,
  };

  return returnTimeCodeRoom;
}

export async function parseXmlAsync(xml: string): Promise<any> {
  try {
    // parse XML and populate the 'root'
    const { root } = await parseStringPromise(xml);
    return root;
  } catch (error) {
    console.error(error);
    throw new InternalServerException('xml 변환 중 오류가 발생했습니다.');
  }
}

function getShortBuildingNameByCode(buildingCode: string): string {
  return BUILDING_CODE_MAP[buildingCode]?.short || buildingCode;
}

interface TimePlace {
  day: string;
  time: string[];
  building: string;
  room: string[];
}
