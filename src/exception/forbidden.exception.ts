import { StatusCodes } from "http-status-codes";
import { Exception } from "./base.exception";

export class ForbiddenException extends Exception {
    constructor(message?: string, status?: StatusCodes) {
        const s = status || StatusCodes.FORBIDDEN;
        const m = message || "권한이 없습니다.";

        super(m, s);

        this.status = s;
        this.message = m;
    }
}