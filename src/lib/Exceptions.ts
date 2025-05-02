interface BaseErrorParams {
  errorMessage?: string;
  errorCode?: string;
  errorPayload?: object;
}

export class BaseError extends Error {
  public errorMessage: string;
  public errorCode: string;
  public errorPayload: object;

  constructor(params: BaseErrorParams) {
    super(params.errorMessage);
    this.errorMessage = params.errorMessage ?? "";
    this.errorCode = params.errorCode ?? "ERROR_CODE_UNSPECIFIED",
    this.errorPayload = params.errorPayload ?? {};
  }
}

export class BusinessLogicError extends BaseError {
  constructor(params: BaseErrorParams){
    super({
      errorMessage: params.errorMessage,
      errorCode: `BLOC_${params.errorCode}`,
      errorPayload: params.errorPayload
    })
  }
}

export class CriticalError extends BaseError {
  constructor(params: BaseErrorParams){
    super({
      errorMessage: params.errorMessage,
      errorCode: `CRIT_${params.errorCode}`,
      errorPayload: params.errorPayload
    })
  }
}