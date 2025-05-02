import { NextFunction, Request, Response } from "express";
import { Logger } from "../lib/Logger";
import { ServerResponse } from "../lib/ServerResponse";
import { BusinessLogicError, CriticalError } from "../lib/Exceptions";

export function ErrorHandler(err: any, req: Request, res: Response, next: NextFunction): any {
  if (err instanceof SyntaxError && 'body' in err) {
    Logger.http(`ERROR: ${err.message}`);
    return ServerResponse.Error.BadRequest(req, res, { stack: err.stack ?? "" }, err.message);
  }

  if (err instanceof BusinessLogicError) {
    Logger.http(`ERROR: ${err.message}`);
    return ServerResponse.Error.BadRequest(req, res, { stack: err.stack ?? "" }, err.message);
  }

  if (err instanceof CriticalError) {
    Logger.error(`ERROR: ${err.message}`);
    return ServerResponse.Error.InternalServerError(req, res, { stack: err.stack ?? "" }, err.message);
  }

  // Only call next() if no response has been sent
  next(err);
}