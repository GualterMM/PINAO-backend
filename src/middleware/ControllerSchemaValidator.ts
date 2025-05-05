import { NextFunction, Request, Response } from "express";
import Joi, { ObjectSchema } from "joi";

import { ServerResponse } from "../lib/ServerResponse";
import { ErrorCode } from "src/lib/Exceptions";

interface ValidationSchemas {
  body?: ObjectSchema;
  params?: ObjectSchema;
  query?: ObjectSchema;
  headers?: ObjectSchema;
}

export class ControllerValidator {
  public static ValidateController = (schemas: ValidationSchemas) => 
  (req: Request, res: Response, next: NextFunction) => {
    const options = { abortEarly: false, allowUnknown: true, stripUnknown: true}
    let errors: Record<string, any> = {};

    // Validate request body
    if (schemas.body) {
      const { error, value } = schemas.body.validate(req.body, options);

      if(error){
        errors.body = error.details.map((err) => err.message);
      } else {
        req.body = value;
      }
    }

    // Validate request URL parameters
    if (schemas.params) {
      const { error, value } = schemas.params.validate(req.params, options);

      if(error){
        errors.params = error.details.map((err) => err.message);
      } else {
        req.params = value;
      }
    }

    // Validates request URL query
    if (schemas.query) {
      const { error, value } = schemas.query.validate(req.query, options);

      if(error){
        errors.query = error.details.map((err) => err.message);
      } else {
        req.query = value;
      }
    }

    // Validates request headers
    if (schemas.headers) {
      const { error, value } = schemas.headers.validate(req.headers, options);

      if(error){
        errors.headers = error.details.map((err) => err.message);
      } else {
        req.headers = value;
      }
    }

    if(Object.keys(errors).length > 0) {
      return ServerResponse.Error.BadRequest(req, res, errors, "Validation error", ErrorCode.VALIDATION_ERROR);
    }

    next();
  }
}