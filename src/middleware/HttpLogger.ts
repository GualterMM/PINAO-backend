import { Request, Response, NextFunction } from "express";
import { Logger } from "../lib/Logger";
import { randomUUID } from "crypto";

/**
 * Logger middleware that uses the `Logger` class to print HTTP exchanges to the console.
 * @param req Express' `Request`
 * @param res Express' `Response`
 * @param next Express' `NextFunction`
 */
export function HttpLogger(req: Request, res: Response, next: NextFunction) {
  const exchangeId = randomUUID(); // For identifying specific request/response exchanges
  const { method, url, ip, headers, body } = req;

  // Overriding res.send to obtain response body
  const originalSend = res.send;
  let responseBody: any;

  res.send = function (body?: any): Response {
    responseBody = body;

    return originalSend.call(this, body);
  };

  // Request logging
  Logger.http(`(ID: ${exchangeId}) REQUEST: ${method} ${url} (${ip})`);
  Logger.http(`(ID: ${exchangeId}) REQUEST HEADERS: ${JSON.stringify(headers)}`);
  Logger.http(`(ID: ${exchangeId}) REQUEST BODY: ${JSON.stringify(body, null, 2)}`);

  // Response Logging
  const startTime = Date.now();
  res.on('finish', () => {
    const { statusCode, statusMessage } = res;
    const resHeaders = res.getHeaders();
    const duration = Date.now() - startTime;

    Logger.http(`(ID: ${exchangeId}) RESPONSE: ${method} ${statusCode} ${statusMessage}`);
    Logger.http(`(ID: ${exchangeId}) RESPONSE HEADERS: ${JSON.stringify(resHeaders)}`);
    Logger.http(`(ID: ${exchangeId}) RESPONSE BODY: ${JSON.stringify(responseBody, null, 2)}`);
    Logger.http(`(ID: ${exchangeId}) RESPONSE TIME: ${duration}ms`);
  });

  next();
}