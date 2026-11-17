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

const REDACTED_PLACEHOLDER = "[REDACTED]";

const FORM_URLENCODED_CONTENT_TYPE = "application/x-www-form-urlencoded";

// Form fields that are safe to retain verbatim. The SDK only sends form-encoded data for the
// OAuth2 client credentials exchange, so this is an allow-list: any field that is not listed
// here (client_secret, client_assertion, custom claims, ...) is redacted. Failing closed means
// a credential can never leak by omission. Kept in sync with the .NET and Java SDKs.
const ALLOWED_TOKEN_REQUEST_FIELDS: ReadonlySet<string> = new Set(["grant_type", "client_id", "audience", "scope"]);

function getRequestContentType(config?: AxiosError["config"]): string | undefined {
  const headers = config?.headers as Record<string, unknown> & { get?: (name: string) => unknown } | undefined;
  if (!headers) {
    return undefined;
  }
  const contentType = typeof headers.get === "function"
    ? headers.get("Content-Type")
    : headers["Content-Type"] ?? headers["content-type"];
  return typeof contentType === "string" ? contentType : undefined;
}

function decodeFormComponent(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

function redactTokenRequestData(data: unknown): unknown {
  if (typeof data === "string") {
    // This handles data such as: client_id=some-id&client_secret=some-secret
    // Allowed fields are preserved byte-for-byte (ordering and encoding included); every
    // other field, including one without a value, becomes field=[REDACTED].
    return data
      .split("&")
      .map((pair) => {
        if (!pair) {
          return pair;
        }
        const separatorIndex = pair.indexOf("=");
        const encodedKey = separatorIndex < 0 ? pair : pair.slice(0, separatorIndex);
        return ALLOWED_TOKEN_REQUEST_FIELDS.has(decodeFormComponent(encodedKey))
          ? pair
          : `${encodedKey}=${REDACTED_PLACEHOLDER}`;
      })
      .join("&");
  }
  if (typeof data === "object" && data !== null) {
    // This handles data that has not been serialized yet, such as: { "client_secret": "..." }
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      redacted[key] = ALLOWED_TOKEN_REQUEST_FIELDS.has(key) ? value : REDACTED_PLACEHOLDER;
    }
    return redacted;
  }
  // A credential-bearing request of an unknown shape: fail closed.
  return undefined;
}

// Returns request data that is safe to retain on an error - and therefore safe for callers to
// log, serialize or forward to error-monitoring services. Credentials are only ever sent in the
// form-encoded body of the OAuth2 client credentials exchange: every field of it that is not
// explicitly allow-listed is redacted. The JSON bodies of OpenFGA API requests carry no
// credentials and are kept as-is. Data whose content type cannot be determined is dropped
// rather than risk retaining a credential.
function redactRequestData(config?: AxiosError["config"]): unknown {
  const data = config?.data;
  if (data === undefined || data === null) {
    return data;
  }
  const contentType = getRequestContentType(config);
  if (!contentType) {
    return undefined;
  }
  return contentType.toLowerCase().startsWith(FORM_URLENCODED_CONTENT_TYPE)
    ? redactTokenRequestData(data)
    : data;
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
    this.requestData = redactRequestData(err.config);
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
export class FgaApiAuthenticationError extends FgaApiError {
  name = "FgaApiAuthenticationError";
  public clientId?: string;
  public audience?: string;
  public grantType?: string;
  public apiErrorCode?: string;

  constructor(err: AxiosError | FgaApiError, context?: {
    clientId?: string;
    audience?: string;
    grantType?: string;
  }) {
    super(err as AxiosError, getAuthenticationErrorMessage(err));

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

    const data: any = parseRequestData(this.requestData);
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
