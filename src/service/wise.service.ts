import "reflect-metadata";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { parseString } from "xml2js";
import iconv from "iconv-lite";
import { injectable } from "inversify";
import { LectureInfo } from "../model/lectureInfo.model";
import { convertTimeCodeAndRoom, parseXmlAsync } from "../util/convert.util";
import Timeout from "await-timeout";
@injectable()
export class WiseService {
    private wiseApiKey: string;    

    constructor() {
        this.wiseApiKey = process.env.uosWiseApiKeyPrimary || process.env.uosWiseApiKeySecondary || process.env.uosWiseApiKeyTertiay;
    }

    public async loadAllLectures(year: number, term: string): Promise<LectureInfo[]> {
        const deptList = await this.loadAllDept();

        const convAxiosConfig = this.getConvLectureAxiosConfig(year, term, deptList);
        const lectureAxiosConfig = convAxiosConfig
        
        const axiosConfigBatch: AxiosRequestConfig[][] = [];
        while(lectureAxiosConfig.length > 0) {
            axiosConfigBatch.push(lectureAxiosConfig.splice(0, 10));
        }
        
        const promise2D: Promise<AxiosResponse<any>>[][] = []
        for(let i=0; i<axiosConfigBatch.length; i++) {
            const batch = axiosConfigBatch[i];
            const requestPromise = batch.map(axiosConfig => axios.request(axiosConfig));
            promise2D.push(requestPromise);
            await Timeout.set(500);
        }

        const lecturePromise = (await Promise.all(promise2D))
                                    .reduce((acc, val) => acc.concat(val), []);

        const binaryLectures = await axios.all(lecturePromise);
        const data = await Promise.all(binaryLectures
                        .map(async binary => {
                            const decodedXml = iconv.decode(binary.data,'EUC-KR');
                            const data = await parseXmlAsync(decodedXml);

                            return data;
                        }));

        const lectureList: LectureInfo[] = data
            .map(data => {
                if(data.mainlist[0] && data.mainlist[0] !== "")
                    return data.mainlist[0].list;
                else
                    return [];
            })
            .reduce((acc, val) => acc.concat(val), [])
            .map(rawLecture => this.makeLectureInfo(rawLecture));
        
        return this.removeDup(lectureList);
    }

    private async loadAllDept(): Promise<Dept[]> {
        const deptAxiosConfig = this.getDeptAxiosConfig();
        const rawdeptList: any[] = await axios.request(deptAxiosConfig)
                .then(res => {
                    const decodedXml = iconv.decode(res.data,'EUC-KR');
                    return new Promise<any>((resolve, reject) => {
                        parseString(decodedXml, (err, result) => {
                            if(err) {
                                console.error(err);
                                throw new Error("xml 변환 중 오류가 발생했습니다.");
                            }
                            resolve(result.root.subDeptList[0].list);
                        });
                    });
                });
        const deptList = rawdeptList.map(rawDept => new Dept(rawDept));

        return deptList;
    }

    private getDeptAxiosConfig(): AxiosRequestConfig {
        const queryParams = {
            apiKey: this.wiseApiKey,
            openYn: "Y"
        }

        const axiosConfig = this.getAxiosConfig(process.env.uosWiseApiDeptURL, queryParams);

        return axiosConfig;
    }

    private getConvLectureAxiosConfig(year: number, term: string, deptList: Dept[]): AxiosRequestConfig[] {
        const axiosConfig = deptList.map(dept => {
            const queryParams = {
                apiKey: this.wiseApiKey,
                year: year,
                term: term,
                deptDiv: dept.deptDiv,
                dept: dept.upDept,
                subDept: dept.dept
            }
            const axiosConfig = this.getAxiosConfig(process.env.uosWiseApiConvergenceLectureURL, queryParams);
            console.info(`Calling ${dept.deptNm} Convergence Lectures...`);
            
            return axiosConfig;
        });

        return axiosConfig;
    }


    private getAxiosConfig(apiPath: string, parameter: any): AxiosRequestConfig {
        let requestURL: string = `${process.env.uosWiseApiURI}${apiPath}?`;

        Object.keys(parameter).forEach(key => {
            requestURL += `${key}=${parameter[key]}&`;
        })

        requestURL = requestURL.substring(0, requestURL.length-1);
        
        const requestConfig: AxiosRequestConfig = {
            method: 'GET',
            url: requestURL,
            responseType: 'arraybuffer'
        }

        return requestConfig;
    }

    private makeLectureInfo(rawLecture: any): LectureInfo {

      const parsedClassNm = convertTimeCodeAndRoom(rawLecture.class_nm[0]);
      const key = (
        rawLecture.year[0]
        + rawLecture.term[0]
        + rawLecture.subject_no[0]
        + rawLecture.class_div[0]
      ) as string
      const lectureInfo: LectureInfo = {
        _id: key,
        key,
        year: rawLecture.year[0] as string,
        term: rawLecture.term[0] as string,
        subject_div: rawLecture.subject_div[0] as string,
        subject_div2: rawLecture.subject_div2[0] as string,
        subject_no: rawLecture.subject_no[0] as string,
        class_div: rawLecture.class_div[0] as string,
        subject_nm: rawLecture.subject_nm[0] as string,
        sub_dept: rawLecture.sub_dept[0] as string,
        day_night_nm: rawLecture.day_night_nm[0] as string,
        shyr: rawLecture.shyr[0] as number,
        credit: rawLecture.credit[0] as number,
        class_nm: rawLecture.class_nm[0] as string,
        prof_nm: rawLecture.prof_nm[0] as string,
        class_type: rawLecture.class_type[0] as string,
        etc_permit_yn: rawLecture.etc_permit_yn[0] || 'N' as string,
        sec_permit_yn: rawLecture.sec_permit_yn[0] || 'N' as string,
        tlsn_limit_count: rawLecture.tlsn_limit_count[0] as number,
        tlsn_count: rawLecture.tlsn_count[0] as number,
        classroom: parsedClassNm.classroom as string,
        lec_cd: parsedClassNm.lectureTimeCode as string[],
        use_flag: "Y" as string,
      };
      
      lectureInfo['_id'] = lectureInfo['key'];

      return lectureInfo;
    }

    private removeDup(lectures: LectureInfo[]): LectureInfo[] {
      const key = '_id';
      const filtered = lectures.filter(
        (s => o => 
            (k => !s.has(k) && s.add(k))
            (o[key])
        )
        (new Set)
      );
      return filtered;
    }
}

class Dept {
    public printOrder: string;
    public dept: string;
    public deptCodeNm: string;
    public deptNm: string;
    public upNm: string;
    public upDept: string;
    public deptDiv: string;
    public college: string;
    public collegeNm: string;

    constructor(rawDept: any) {
        this.printOrder = rawDept.prt_ord[0];
        this.dept = rawDept.dept[0];
        this.deptCodeNm = rawDept.dept_code_nm[0];
        this.deptNm = rawDept.dept_nm[0];
        this.upNm = rawDept.up_nm[0];
        this.upDept = rawDept.up_dept[0];
        this.deptDiv = rawDept.dept_div[0];
        this.college = rawDept.colg[0];
        this.collegeNm = rawDept.colg_nm[0];
    }
}
