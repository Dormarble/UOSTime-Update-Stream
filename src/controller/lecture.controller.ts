import "reflect-metadata";
import { inject } from "inversify";
import { controller, httpGet, queryParam, BaseHttpController, httpPatch } from "inversify-express-utils";
import { TYPES } from "../config/types.config";
import { LectureService } from "../service/lecture.service";
import { StatusCodes } from "http-status-codes";

@controller("/api/lecture")
class LectureController extends BaseHttpController {
    private lectureService: LectureService;
    
    constructor(@inject(TYPES.LectureService) lectureService: LectureService) {
        super();
        this.lectureService = lectureService;
    }

    /**
     # 강의 업데이트
     ### PATCH /api/lecture
     * @queryParam year 
     * @queryParam term 
     */
    @httpPatch("/")
    public async update(@queryParam("year") year: number, @queryParam("term") term: string) {
        const req = this.httpContext.request;
        const res = this.httpContext.response;

        // await this.lectureService.update(year, term);
        await this.lectureService.update(2022, 'A10');

        res.status(StatusCodes.OK);
    }
}