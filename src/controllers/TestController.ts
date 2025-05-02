import { NextFunction, Request, Response } from "express";
import { ServerResponse } from "../lib/ServerResponse";

export class TestController {
  constructor() {
    this.autoBind(this);
  }

  private autoBind(obj: any) {
    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(obj))) {
      const val = obj[key];
      if (typeof val === 'function' && key !== 'constructor') {
        obj[key] = val.bind(obj);
      }
    }
  }

  async GetPing(req: Request, res: Response, next: NextFunction) {
    try {
      return ServerResponse.Success.OK(req, res, { response: "OK" });
    } catch (error) {
      next(error);
    }
  }
}