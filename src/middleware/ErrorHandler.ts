import { NextFunction, Request, Response } from "express";
import { Logger } from "../lib/Logger";
import { ServerResponse } from "../lib/ServerResponse";
import { BusinessLogicError, CriticalError, ErrorCode } from "../lib/Exceptions";

const NOT_FOUND_ERRORS = [
  ErrorCode.WEBSOCKET_SESSION_NOT_FOUND,
];

export function ErrorHandler(err: any, req: Request, res: Response, next: NextFunction): any {
  if (err instanceof SyntaxError && 'body' in err) {
    Logger.http(`ERROR: ${err.message}`);
    return ServerResponse.Error.BadRequest(req, res, { stack: err.stack ?? "" }, err.message);
  }

  if (err instanceof BusinessLogicError) {
    Logger.http(`ERROR: ${err.message}`);

    if(NOT_FOUND_ERRORS.includes(err.errorCode)){
      return ServerResponse.Error.NotFound(req, res, { stack: err.stack ?? "" }, err.message, err.errorCode, err.errorType);
    }

    return ServerResponse.Error.BadRequest(req, res, { stack: err.stack ?? "" }, err.message, err.errorCode, err.errorType);
  }

  if (err instanceof CriticalError) {
    Logger.error(`ERROR: ${err.message}`);
    return ServerResponse.Error.InternalServerError(req, res, { stack: err.stack ?? "" }, err.message, err.errorCode, err.errorType);
  }

  // Only call next() if no response has been sent
  next(err);
}