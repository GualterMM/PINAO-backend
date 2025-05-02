import { Application, NextFunction, Request, RequestHandler, Response } from "express";
import { ServerResponse } from "../lib/ServerResponse";
import { ErrorCode } from "../lib/Exceptions";

/**
 * Middleware used for error handling when an unknown route is called.
 * Use this as the LAST middleware, since it's designed for being a "catch-all" error handler and it doesn't use the `next()` function.
 * @param req Express' `Request`
 * @param res Express' `Response`
 * @param next Express' `NextFunction`
 */
// export function UnimplementedRouteHandler(err: any, req: Request, res: Response, next: NextFunction): any {
//   return ServerResponse.Error.NotImplemented(req, res, { endpoint: req.url, method: req.method });
// }

export function UnimplementedRouteHandler(app: Application) {
  const middleware: RequestHandler = (req, res, next) => {
    ServerResponse.Error.NotImplemented(req, res,
      {
        endpoint: req.url,
        method: req.method
      },
      "",
      ErrorCode.ROUTE_NOT_IMPLEMENTED
    );
  };

  app.use(middleware);
}