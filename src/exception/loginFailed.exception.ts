import { StatusCodes } from "http-status-codes";
import { Exception } from "./base.exception";

export class LoginFailedException extends Exception {
    constructor(message?: string, status?: StatusCodes) {
        const s = status || StatusCodes.UNAUTHORIZED;
        const m = message || "아이디 또는 비밀번호가 정확하지 않습니다.";

        super(m, s);

        this.status = s;
        this.message = m;
    }
}