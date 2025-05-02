import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Interface for specifying the response status.
 */
interface ResponseStatusParams {
  success?: boolean;
  statusCode?: number;
  timestamp?: Date;
  errorMessage?: string;
  errorCode?: string;
  errorPayload?: object;
}

/**
 * Class used to define a base response status for each server response.
 */
class ResponseStatus {
  public success: boolean;
  public statusCode: number;
  public timestamp: Date;
  public errorMessage: string;
  public errorCode: string;
  public errorPayload: object;

  constructor(params: ResponseStatusParams) {
    this.success = params.success ?? false;
    this.statusCode = params.statusCode ?? 500;
    this.timestamp = params.timestamp ?? new Date();
    this.errorMessage = params.errorMessage ?? "";
    this.errorCode = params.errorCode ?? "";
    this.errorPayload = params.errorPayload ?? {};
  }
}

/**
 * Class used for providing default server responses containign detailed request and response information.
 */
export class ServerResponse {
  /**
   * Creates a default successful server response (on the 200 HTTP code range).
   * @param res Express' `Response`
   * @param responseStatusParams Parameters used for the response status
   * @param payload The actual payload for the response body
   * @returns 
   */
  private static MakeSuccessResponse(res: Response, responseStatusParams: ResponseStatusParams, payload?: object) {
    const responseStatus = new ResponseStatus({ ...responseStatusParams, success: true });
    return res.status(responseStatusParams.statusCode ?? 200).json({ responseStatus, payload: payload ?? {} });
  }

  /**
   * Creates a default failed server response (on the 400-500 HTTP code range).
   * @param res Express' `Response`
   * @param responseStatusParams Parameters used for the response status
   * @param payload The error payload, for debugging
   * @returns 
   */
  private static MakeErrorResponse(res: Response, responseStatusParams: ResponseStatusParams, payload?: object, message?: string) {
    const responseStatus = new ResponseStatus({
      ...responseStatusParams,
      success: false,
      errorPayload: payload ?? {},
      errorMessage: responseStatusParams.errorMessage ?? (message ?? "") ,
    });
    return res.status(responseStatusParams.statusCode ?? 500).json({ responseStatus });
  }

  /**
   * Static class used to wrap all successful server responses
   */
  static Success = class {
    static OK(req: Request, res: Response, payload?: object) {
      return ServerResponse.MakeSuccessResponse(res, { statusCode: StatusCodes.OK }, payload);
    }

    static Created(req: Request, res: Response, payload?: object) {
      return ServerResponse.MakeSuccessResponse(res, { statusCode: StatusCodes.CREATED }, payload);
    }

    static NoContent(req: Request, res: Response, payload?: object) {
      return ServerResponse.MakeSuccessResponse(res, { statusCode: StatusCodes.NO_CONTENT }, payload);
    }
  }

  /**
   * Static class used to wrap all failed server responses
   */
  static Error = class {
    static BadRequest(req: Request, res: Response, payload?: object, message?: string) {
      return ServerResponse.MakeErrorResponse(res, { statusCode: StatusCodes.BAD_REQUEST }, payload, message);
    }

    static Unauthorized(req: Request, res: Response, payload?: object, message?: string) {
      return ServerResponse.MakeErrorResponse(res, { statusCode: StatusCodes.UNAUTHORIZED }, payload, message);
    }

    static Forbidden(req: Request, res: Response, payload?: object, message?: string) {
      return ServerResponse.MakeErrorResponse(res, { statusCode: StatusCodes.FORBIDDEN }, payload, message);
    }

    static NotFound(req: Request, res: Response, payload?: object, message?: string) {
      return ServerResponse.MakeErrorResponse(res, { statusCode: StatusCodes.NOT_FOUND }, payload, message);
    }

    static Conflict(req: Request, res: Response, payload?: object, message?: string) {
      return ServerResponse.MakeErrorResponse(res, { statusCode: StatusCodes.CONFLICT }, payload, message);
    }

    static Gone(req: Request, res: Response, payload?: object, message?: string) {
      return ServerResponse.MakeErrorResponse(res, { statusCode: StatusCodes.GONE }, payload, message);
    }

    static InternalServerError(req: Request, res: Response, payload?: object, message?: string) {
      return ServerResponse.MakeErrorResponse(res, { statusCode: StatusCodes.INTERNAL_SERVER_ERROR }, payload, message);
    }

    static NotImplemented(req: Request, res: Response, payload?: object, message?: string) {
      return ServerResponse.MakeErrorResponse(res,
        {
          errorMessage: "The requested endpoint is not available on the server",
          statusCode: StatusCodes.NOT_IMPLEMENTED
        },
        payload, message);
    }

    static ServiceUnavailable(req: Request, res: Response, payload?: object, message?: string) {
      return ServerResponse.MakeErrorResponse(res, { statusCode: StatusCodes.SERVICE_UNAVAILABLE }, payload);
    }
  }

}
