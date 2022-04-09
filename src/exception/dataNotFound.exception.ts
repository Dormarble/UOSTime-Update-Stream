import { StatusCodes } from "http-status-codes";
import { Exception } from "./base.exception";

export class DataNotFoundException extends Exception {
    constructor(message?: string, status?: StatusCodes) {
        const s = status || StatusCodes.NOT_FOUND;
        const m = message || "요청하신 데이터를 찾을 수 없습니다.";

        super(m, s);

        this.status = s;
        this.message = m;
    }
}