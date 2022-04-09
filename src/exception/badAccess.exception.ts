import { StatusCodes } from "http-status-codes";
import { Exception } from "./base.exception";

export class BadAccessException extends Exception {
    constructor(message?: string, status?: StatusCodes) {
        const m = message || "권한이 부족합니다.";
        const s = status || StatusCodes.UNAUTHORIZED;


        super(m, s);

        this.message = m;
        this.status = s
    }
}