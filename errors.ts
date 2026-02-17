import { AxiosError, AxiosHeaderValue, Method } from "axios";
import {
  ErrorCode,
  InternalErrorCode,
  NotFoundErrorCode,
} from "./apiModel";

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
      msg || typeof err === "string"
        ? (err as string)
        : `FGA Error${(err as Error)?.message ? `: ${(err as Error).message}` : ""}`
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

function getResponseHeaders(err: AxiosError): any {
  return err.response
    ? Object.fromEntries(
      Object.entries(err.response.headers).map(([k, v]) => [
        k.toLowerCase(), v,
      ])
    )
    : {};
}

function parseRequestData(data: unknown): any {
  if (typeof data !== "string") {
    return data;
  }

  try {
    return JSON.parse(data);
  } catch {
    try {
      const params = new URLSearchParams(data);
      const parsedParams = Object.fromEntries(params.entries());
      return Object.keys(parsedParams).length > 0 ? parsedParams : undefined;
    } catch {
      return undefined;
    }
  }
}

function getAuthenticationErrorMessage(err: AxiosError | FgaApiError): string {
  const statusText = err instanceof FgaApiError ? err.statusText : err.response?.statusText;
  return `FGA Authentication Error.${statusText ? ` ${statusText}` : ""}`;
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
  public method?: Method;
  public requestURL?: string;
  public storeId?: string;
  public endpointCategory?: string;
  public apiErrorMessage?: string;
  public requestData?: any;
  public responseData?: any;
  public responseHeader?: Record<string, AxiosHeaderValue | undefined>;
  public requestId?: string;

  constructor(err: AxiosError, msg?: string) {
    super(msg ? msg : err);
    this.statusCode = err.response?.status;
    this.statusText = err.response?.statusText;
    this.requestData = err.config?.data;
    this.requestURL = err.config?.url;
    this.method = err.config?.method as Method;
    const { storeId, endpointCategory } = getRequestMetadataFromPath(
      err.request?.path
    );
    this.storeId = storeId;
    this.endpointCategory = endpointCategory;
    this.apiErrorMessage = (err.response?.data as any)?.message;
    this.responseData = err.response?.data;
    this.responseHeader = err.response?.headers;
    const errResponseHeaders = getResponseHeaders(err);
    this.requestId = errResponseHeaders[cFGARequestId];

    if ((err as Error)?.stack) {
      this.stack = (err as Error).stack;
    }
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
  constructor(err: AxiosError, msg?: string) {
    // If there is a better error message, use it instead of the default error
    super(err);
    this.apiErrorCode = (err.response?.data as any)?.code;
    const { endpointCategory } = getRequestMetadataFromPath(err.request?.path);
    this.message = msg
      ? msg
      : (err.response?.data as any)?.message
        ? `FGA API Validation Error: ${err.config?.method} ${endpointCategory} : Error ${(err.response?.data as any)?.message}`
        : (err as Error).message;
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
  constructor(err: AxiosError, msg?: string) {
    // If there is a better error message, use it instead of the default error
    super(err);
    this.apiErrorCode = (err.response?.data as any)?.code;
    this.message = msg
      ? msg
      : (err.response?.data as any)?.message
        ? `FGA API NotFound Error: ${err.config?.method} : Error ${(err.response?.data as any)?.message}`
        : (err as Error).message;
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

  constructor(err: AxiosError, msg?: string) {
    super(err);
    this.apiErrorCode = (err.response?.data as any)?.code;

    const { endpointCategory } = getRequestMetadataFromPath(err.request?.path);
    const errResponseHeaders = getResponseHeaders(err);
    this.message = msg
      ? msg
      : `FGA API Rate Limit Error for ${this.method} ${endpointCategory}`;
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

  constructor(err: AxiosError, msg?: string) {
    // If there is a better error message, use it instead of the default error
    super(err);
    const { endpointCategory } = getRequestMetadataFromPath(err.request?.path);
    this.apiErrorCode = (err.response?.data as any)?.code;

    this.message = msg
      ? msg
      : (err.response?.data as any)?.message
        ? `FGA API Internal Error: ${err.config?.method} ${endpointCategory} : Error ${(err.response?.data as any)?.message}`
        : (err as Error).message;
  }
}

/**
 *
 * @export
 * @class FgaApiAuthenticationError
 * @extends { FgaApiError }
 */
export class FgaApiAuthenticationError extends FgaError {
  name = "FgaApiAuthenticationError";
  public statusCode?: number;
  public statusText?: string;
  public method?: Method;
  public requestURL?: string;
  public clientId?: string;
  public audience?: string;
  public grantType?: string;
  public responseData?: any;
  public responseHeader?: any;
  public requestId?: string;
  public apiErrorCode?: string;

  constructor(err: AxiosError | FgaApiError, context?: {
    clientId?: string;
    audience?: string;
    grantType?: string;
  }) {
    super(getAuthenticationErrorMessage(err));

    if (err instanceof FgaApiError) {
      this.statusCode = err.statusCode;
      this.statusText = err.statusText;
      this.requestURL = err.requestURL;
      this.method = err.method as Method;
      this.responseData = err.responseData;
      this.responseHeader = err.responseHeader;
      this.requestId = err.requestId;
      this.apiErrorCode = (err.responseData as any)?.code;

      const data: any = parseRequestData(err.requestData);

      this.clientId = context?.clientId ?? data?.client_id;
      this.audience = context?.audience ?? data?.audience;
      this.grantType = context?.grantType ?? data?.grant_type;

      if ((err as Error)?.stack) {
        this.stack = (err as Error).stack;
      }
      return;
    }

    this.statusCode = err.response?.status;
    this.statusText = err.response?.statusText;
    this.requestURL = err.config?.url;
    this.method = err.config?.method as Method;
    this.responseData = err.response?.data;
    this.responseHeader = err.response?.headers;
    this.apiErrorCode = (err.response?.data as any)?.code;

    const errResponseHeaders = getResponseHeaders(err);
    this.requestId = errResponseHeaders[cFGARequestId];

    const data: any = parseRequestData(err.config?.data);
    this.clientId = context?.clientId ?? data?.client_id;
    this.audience = context?.audience ?? data?.audience;
    this.grantType = context?.grantType ?? data?.grant_type;
    if ((err as Error)?.stack) {
      this.stack = (err as Error).stack;
    }
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
