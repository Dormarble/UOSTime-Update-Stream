import { StatusCodes } from "http-status-codes";
import { Exception } from "./base.exception";

export class InternalServerException extends Exception {
    constructor(message?: string, status?: StatusCodes) {
        const s = status || StatusCodes.INTERNAL_SERVER_ERROR;
        const m = message || "서버 내부 오류가 발생했습니다.";

        super(m, s);

        this.status = s;
        this.message = m;
    }
}