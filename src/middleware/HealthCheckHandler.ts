import { NextFunction, Request, Response } from "express";
import { ServerResponse } from "../lib/ServerResponse";
import packageJson from "../../package.json";

/**
 * Middleware used for error handling when an unknown route is called.
 * Use this as the LAST middleware, since it's designed for being a "catch-all" error handler and it doesn't use the `next()` function.
 * @param req Express' `Request`
 * @param res Express' `Response`
 * @param next Express' `NextFunction`
 */
export function HealthCheckHandler(req: Request, res: Response, next: NextFunction) {
  return ServerResponse.Success.OK(req, res, { 
    name: packageJson.name,
    description: packageJson.description,
    author: packageJson.author,
    version: packageJson.version,
   });
}