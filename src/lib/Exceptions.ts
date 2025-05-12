interface BaseErrorParams {
  errorMessage?: string;
  errorCode?: ErrorCode;
  errorType?: string;
  errorPayload?: object;
}

export enum ErrorCode {
  UNSPECIFIED_ERROR = "UNSPECIFIED_ERROR",
  PARSE_ERROR = "PARSE_ERROR",
  ROUTE_NOT_IMPLEMENTED = "ROUTE_NOT_IMPLEMENTED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  WEBSOCKET_SESSION_NOT_FOUND = "WEBSOCKET_SESSION_NOT_FOUND",
  WEBSOCKET_JSON_PARSE_ERROR = "WEBSOCKET_JSON_PARSE_ERROR",

  GAME_LOGIC_SESSION_NOT_FOUND = "GAME_LOGIC_SESSION_NOT_FOUND",
  GAME_LOGIC_SABOTAGE_QUEUE_FULL = "GAME_LOGIC_SABOTAGE_QUEUE_FULL",
  GAME_LOGIC_INVALID_SABOTAGE = "GAME_LOGIC_INVALID_SABOTAGE",
  GAME_LOGIC_PLAYER_IN_GRACE_PERIOD = "GAME_LOGIC_INVALID_SABOTAGE",
  GAME_LOGIC_SESSION_ENDED = "GAME_LOGIC_SESSION_ENDED",
  GAME_LOGIC_SESSION_NOT_ACTIVE = "GAME_LOGIC_SESSION_NOT_ACTIVE"
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