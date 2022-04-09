export interface LectureInfo {
  _id: string;
  key: string;
  sub_dept: string;
  subject_div: string;
  subject_div2: string;
  subject_no: string;
  class_div: string;
  subject_nm: string;
  shyr: number;
  credit: number;
  prof_nm: string;
  day_night_nm: string;
  class_type: string;
  class_nm: string;
  tlsn_count: number;
  tlsn_limit_count: number;
  etc_permit_yn: string;
  sec_permit_yn: string;
  year: string;
  term: string;
  classroom: string;
  lec_cd: string[];
  use_flag: string;
}
