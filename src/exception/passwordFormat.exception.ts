import { StatusCodes } from "http-status-codes";
import { Exception } from "./base.exception";

export class InputFormatException extends Exception {
    constructor(message?: string, status?: StatusCodes) {
        const s = status || StatusCodes.BAD_REQUEST;
        const m = message || "형식에 맞지 않는 입력입니다.";

        super(m, s);
        
        this.message = m;
        this.status = s;
    }
}