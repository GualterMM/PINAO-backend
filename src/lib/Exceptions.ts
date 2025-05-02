interface BaseErrorParams {
  errorMessage?: string;
  errorCode?: ErrorCode;
  errorType?: string;
  errorPayload?: object;
}

export enum ErrorCode {
  UNSPECIFIED_ERROR = "UNSPECIFIED_ERROR",
  ROUTE_NOT_IMPLEMENTED = "ROUTE_NOT_IMPLEMENTED",
  WEBSOCKET_SESSION_NOT_FOUND = "WEBSOCKET_SESSION_NOT_FOUND"
}

export class BaseError extends Error {
  public errorMessage: string;
  public errorCode: ErrorCode;
  public errorType: string;
  public errorPayload: object;

  constructor(params: BaseErrorParams) {
    super(params.errorMessage);
    this.errorMessage = params.errorMessage ?? "";
    this.errorCode = params.errorCode ?? ErrorCode.UNSPECIFIED_ERROR;
    this.errorType = params.errorType ?? "";
    this.errorPayload = params.errorPayload ?? {};
  }
}

export class BusinessLogicError extends BaseError {
  constructor(params: BaseErrorParams){
    super({
      errorMessage: params.errorMessage,
      errorCode: params.errorCode,
      errorType: "BLOC",
      errorPayload: params.errorPayload
    })
  }
}

export class CriticalError extends BaseError {
  constructor(params: BaseErrorParams){
    super({
      errorMessage: params.errorMessage,
      errorCode: params.errorCode,
      errorType: "CRIT",
      errorPayload: params.errorPayload
    })
  }
}