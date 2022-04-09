import { StatusCodes } from "http-status-codes";

export class Exception extends Error {
    public status: StatusCodes;
    public message: string;

    constructor(message?: string, status?: number) {
      super(message);
      this.status = status || StatusCodes.BAD_REQUEST;
      this.message = message;
    }
  }