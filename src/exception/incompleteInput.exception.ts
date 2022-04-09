import { StatusCodes } from "http-status-codes";
import { Exception } from "./base.exception";

export class IncompleteInputException extends Exception {
    constructor(message?: string, status?: StatusCodes) {
        const s = status || StatusCodes.BAD_REQUEST;
        const m = message || "필수 항목이 필요합니다.";

        super(m, s);
        
        this.status = s;
        this.message = m;
    }
}