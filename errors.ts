import {
  ErrorCode,
  InternalErrorCode,
  NotFoundErrorCode,
} from "./apiModel";

/**
 * Context extracted from a failed HTTP request/response,
 * used to construct SDK error classes without coupling to any HTTP library.
 */
export interface HttpErrorContext {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  data?: any;
  requestUrl?: string;
  requestMethod?: string;
  requestData?: any;
}

/**
 *
 * @export
 * @class FgaError
 * @extends {Error}
 */
export class FgaError extends Error {
  name = "FgaError";

  constructor(err?: Error | string | unknown, msg?: string) {
    super(
      msg ?? (typeof err === "string"
        ? err
        : `FGA Error${(err as Error)?.message ? `: ${(err as Error).message}` : ""}`
      )
    );
    if ((err as Error)?.stack) {
      this.stack = (err as Error).stack;
    }
  }
}

function getRequestMetadataFromPath(path?: string): {
  storeId: string;
  endpointCategory: string;
} {
  // This function works because all paths start with /stores/{storeId}/{type}

  let splitPath: string[] = (path || "").split("/");
  if (splitPath.length < 4) {
    splitPath = [];
  }
  const storeId = splitPath[2] || "";
  const endpointCategory = splitPath[3] || "";

  return { storeId, endpointCategory };
}

const cFGARequestId = "fga-request-id";

function normalizeHeaders(headers?: Record<string, string>): Record<string, string> {
  if (!headers) return {};
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
  );
}

/**
 *
 * @export
 * @class FgaApiError
 * @extends { FgaError }
 */
export class FgaApiError extends FgaError {
  name = "FgaApiError";
  public statusCode?: number;
  public statusText?: string;
  public method?: string;
  public requestURL?: string;
  public storeId?: string;
  public endpointCategory?: string;
  public apiErrorMessage?: string;
  public requestData?: any;
  public responseData?: any;
  public responseHeader?: Record<string, string>;
  public requestId?: string;

  constructor(err: HttpErrorContext | Error, msg?: string) {
    super(msg ? msg : (err instanceof Error ? err : undefined));
    if (err instanceof Error) {
      if (err.stack) this.stack = err.stack;
      return;
    }
    this.statusCode = err.status;
    this.statusText = err.statusText;
    this.requestData = err.requestData;
    this.requestURL = err.requestUrl;
    this.method = err.requestMethod;
    const { storeId, endpointCategory } = getRequestMetadataFromPath(
      err.requestUrl ? new URL(err.requestUrl, "http://localhost").pathname : undefined
    );
    this.storeId = storeId;
    this.endpointCategory = endpointCategory;
    this.apiErrorMessage = err.data?.message;
    this.responseData = err.data;
    const normalizedHeaders = normalizeHeaders(err.headers);
    this.responseHeader = normalizedHeaders;
    this.requestId = normalizedHeaders[cFGARequestId];
  }
}

/**
 *
 * @export
 * @class FgaApiValidationError
 * @extends { FgaApiError }
 */
export class FgaApiValidationError extends FgaApiError {
  name = "FgaApiValidationError";
  public apiErrorCode: ErrorCode;
  constructor(err: HttpErrorContext, msg?: string) {
    // If there is a better error message, use it instead of the default error
    super(err);
    this.apiErrorCode = err.data?.code;
    const { endpointCategory } = getRequestMetadataFromPath(
      err.requestUrl ? new URL(err.requestUrl, "http://localhost").pathname : undefined
    );
    this.message = msg
      ? msg
      : err.data?.message
        ? `FGA API Validation Error: ${err.requestMethod} ${endpointCategory} : Error ${err.data.message}`
        : this.message;
  }
}

/**
 *
 * @export
 * @class FgaApiNotFoundError
 * @extends { FgaApiError }
 */
export class FgaApiNotFoundError extends FgaApiError {
  name = "FgaApiNotFoundError";
  public apiErrorCode: NotFoundErrorCode;
  constructor(err: HttpErrorContext, msg?: string) {
    // If there is a better error message, use it instead of the default error
    super(err);
    this.apiErrorCode = err.data?.code;
    this.message = msg
      ? msg
      : err.data?.message
        ? `FGA API NotFound Error: ${err.requestMethod} : Error ${err.data.message}`
        : this.message;
  }
}

const cXRateLimit = "x-ratelimit-limit";
const cXRateLimitReset = "x-ratelimit-reset";
/**
 *
 * @export
 * @class FgaApiRateLimitExceededError
 * @extends { FgaApiError }
 */
export class FgaApiRateLimitExceededError extends FgaApiError {
  name = "FgaApiRateLimitExceededError";
  public apiErrorCode?: string;

  constructor(err: HttpErrorContext, msg?: string) {
    super(err);
    this.apiErrorCode = err.data?.code;

    this.message = msg
      ? msg
      : `FGA API Rate Limit Error for ${this.method} ${this.endpointCategory}`;
  }
}

/**
 *
 * @export
 * @class FgaApiInternalError
 * @extends { FgaApiError }
 */
export class FgaApiInternalError extends FgaApiError {
  name = "FgaApiInternalError";
  public apiErrorCode: InternalErrorCode;

  constructor(err: HttpErrorContext, msg?: string) {
    // If there is a better error message, use it instead of the default error
    super(err);
    const { endpointCategory } = getRequestMetadataFromPath(
      err.requestUrl ? new URL(err.requestUrl, "http://localhost").pathname : undefined
    );
    this.apiErrorCode = err.data?.code;

    this.message = msg
      ? msg
      : err.data?.message
        ? `FGA API Internal Error: ${err.requestMethod} ${endpointCategory} : Error ${err.data.message}`
        : this.message;
  }
}

/**
 *
 * @export
 * @class FgaApiAuthenticationError
 * @extends { FgaApiError }
 */
export class FgaApiAuthenticationError extends FgaApiError {
  name = "FgaApiAuthenticationError";
  public clientId?: string;
  public audience?: string;
  public grantType?: string;
  public apiErrorCode?: string;

  constructor(err: HttpErrorContext) {
    super(err);
    this.message = `FGA Authentication Error.${err.statusText ? ` ${err.statusText}` : ""}`;
    this.apiErrorCode = err.data?.code;

    let data: any;
    try {
      data = typeof err.requestData === "string" ? JSON.parse(err.requestData) : (err.requestData || {});
    } catch {
      /* do nothing */
    }
    this.clientId = data?.client_id;
    this.audience = data?.audience;
    this.grantType = data?.grant_type;
  }
}

/**
 *
 * @export
 * @class FgaValidationError
 * @extends { FgaError }
 */
export class FgaValidationError extends FgaError {
  name = "FgaValidationError";
  constructor(public field: string, msg?: string) {
    super(msg);
  }
}

/**
 *
 * @export
 * @class FgaRequiredParamError
 * @extends { FgaValidationError }
 */
export class FgaRequiredParamError extends FgaValidationError {
  name = "FgaRequiredParamError";
  constructor(public functionName: string, field: string, msg?: string) {
    super(field, msg);
  }
}
