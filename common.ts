import { Configuration, RetryParams } from "./configuration";
import SdkConstants from "./constants";
import type { Credentials } from "./credentials";
import {
  FgaApiError,
  FgaApiInternalError,
  FgaApiAuthenticationError,
  FgaApiNotFoundError,
  FgaApiRateLimitExceededError,
  FgaApiValidationError,
  FgaError,
  FgaValidationError,
  HttpErrorContext,
} from "./errors";
import { setNotEnumerableProperty } from "./utils";
import { TelemetryAttribute, TelemetryAttributes } from "./telemetry/attributes";
import { TelemetryConfiguration } from "./telemetry/configuration";
import { TelemetryHistograms } from "./telemetry/histograms";

/**
 *
 * @export
 */
export const DUMMY_BASE_URL = `https://${SdkConstants.SampleBaseDomain}`;

/**
 *
 * @export
 * @interface RequestArgs
 */
export interface RequestArgs {
  url: string;
  options: any;
}

/**
 * SDK-owned response type, replacing AxiosResponse.
 * @export
 */
export interface FgaResponse<T> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
}

/**
 * Configuration for the HTTP client used by the SDK.
 * @export
 */
export interface HttpClient {
  fetch: typeof globalThis.fetch;
  defaultHeaders?: Record<string, string>;
  defaultTimeout?: number;
}

/**
 * Default HttpClient using the global fetch.
 * Used as fallback when no custom HttpClient is provided.
 */
export const globalHttpClient: HttpClient = {
  fetch: globalThis.fetch.bind(globalThis),
  defaultTimeout: 10000,
};

/**
 *
 * @export
 */
export const setBearerAuthToObject = async function (object: any, credentials: Credentials) {
  const accessTokenHeader = await credentials.getAccessTokenHeader();
  if (accessTokenHeader && !object[accessTokenHeader.name]) {
    object[accessTokenHeader.name] = accessTokenHeader.value;
  }
};

/**
 *
 * @export
 */
export const setSearchParams = function (url: URL, ...objects: any[]) {
  const searchParams = new URLSearchParams(url.search);
  for (const object of objects) {
    for (const key in object) {
      if (Array.isArray(object[key])) {
        searchParams.delete(key);
        for (const item of object[key]) {
          searchParams.append(key, item);
        }
      } else {
        searchParams.set(key, object[key]);
      }
    }
  }
  url.search = searchParams.toString();
};

/**
 * Check if the given MIME is a JSON MIME.
 * JSON MIME examples:
 *   application/json
 *   application/json; charset=UTF8
 *   APPLICATION/JSON
 *   application/vnd.company+json
 * @param mime - MIME (Multipurpose Internet Mail Extensions)
 * @return True if the given MIME is JSON, false otherwise.
 */
const isJsonMime = (mime: string): boolean => {

  const jsonMime = new RegExp("^(application/json|[^;/ \t]+/[^;/ \t]+[+]json)[ \t]*(;.*)?$", "i");
  return mime !== null && (jsonMime.test(mime) || mime.toLowerCase() === "application/json-patch+json");
};

/**
 *
 * @export
 */
export const serializeDataIfNeeded = function (value: any, requestOptions: any) {
  const nonString = typeof value !== "string";
  const needsSerialization = nonString
    ? isJsonMime(requestOptions.headers["Content-Type"])
    : nonString;
  return needsSerialization
    ? JSON.stringify(value !== undefined ? value : {})
    : (value || "");
};

/**
 *
 * @export
 */
export const toPathString = function (url: URL) {
  return url.pathname + url.search + url.hash;
};

type ObjectOrVoid = object | void;

interface StringIndexable {
  [key: string]: any;
}

export type CallResult<T extends ObjectOrVoid> = T & {
  $response: FgaResponse<T>
};

export type PromiseResult<T extends ObjectOrVoid> = Promise<CallResult<T>>;

function calculateExponentialBackoffWithJitter(retryAttempt: number, minWaitInMs: number): number {
  const minDelayMs = Math.ceil(2 ** retryAttempt * minWaitInMs);
  const maxDelayMs = Math.ceil(2 ** (retryAttempt + 1) * minWaitInMs);
  const randomDelayMs = Math.floor(Math.random() * (maxDelayMs - minDelayMs) + minDelayMs);
  return Math.min(randomDelayMs, SdkConstants.MaxBackoffTimeInSec * 1000);
}

/**
 * Validates if a retry delay is within acceptable bounds
 * @param delayMs - Delay in milliseconds
 * @returns True if delay is between {@link SdkConstants.DefaultMinWaitInMs}ms and {@link SdkConstants.RetryHeaderMaxAllowableDurationInSec}s
 */
function isValidRetryDelay(delayMs: number): boolean {
  return delayMs >= SdkConstants.DefaultMinWaitInMs && delayMs <= SdkConstants.RetryHeaderMaxAllowableDurationInSec * 1000;
}

/**
 * Parses the Retry-After header and returns delay in milliseconds
 * @param headers - HTTP response headers
 * @returns Delay in milliseconds if valid, undefined otherwise
 */
function parseRetryAfterHeader(headers: Record<string, string>): number | undefined {
  // Find the retry-after header regardless of case
  const retryAfterHeaderNameLower = SdkConstants.RetryAfterHeaderName.toLowerCase();
  const retryAfterKey = Object.keys(headers).find(key =>
    key.toLowerCase() === retryAfterHeaderNameLower
  );

  const retryAfterHeaderValue = retryAfterKey ? headers[retryAfterKey] : undefined;

  if (!retryAfterHeaderValue) {
    return undefined;
  }

  // Try to parse as integer (seconds)
  const retryAfterSeconds = parseInt(retryAfterHeaderValue, 10);
  if (!isNaN(retryAfterSeconds)) {
    const retryAfterMs = retryAfterSeconds * 1000;
    if (isValidRetryDelay(retryAfterMs)) {
      return retryAfterMs;
    }
    return undefined;
  }

  // Try to parse as HTTP date
  try {
    const retryAfterDate = new Date(retryAfterHeaderValue);
    const currentDate = new Date();
    const retryDelayMs = retryAfterDate.getTime() - currentDate.getTime();

    if (isValidRetryDelay(retryDelayMs)) {
      return retryDelayMs;
    }
  } catch (e) {
    // Invalid date format
  }

  return undefined;
}

/**
 * Convert a fetch Headers object to a plain Record<string, string>.
 */
function headersToRecord(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

interface WrappedResponse<R> {
  response?: FgaResponse<R>;
  retries: number;
}

function checkIfRetryableError(
  errCtx: HttpErrorContext,
  iterationCount: number,
  maxRetry: number
): { retryable: boolean; error?: Error } {
  const status = errCtx.status;

  // Network error — no status code
  if (!status) {
    if (iterationCount > maxRetry) {
      return { retryable: false, error: new FgaError(undefined, `Network error for ${errCtx.requestMethod} ${errCtx.requestUrl}`) };
    }
    return { retryable: true };
  }

  if (status === 400 || status === 422) {
    return { retryable: false, error: new FgaApiValidationError(errCtx) };
  } else if (status === 401 || status === 403) {
    return { retryable: false, error: new FgaApiAuthenticationError(errCtx) };
  } else if (status === 404) {
    return { retryable: false, error: new FgaApiNotFoundError(errCtx) };
  } else if (status === 429 || (status >= 500 && status !== 501)) {
    if (iterationCount > maxRetry) {
      if (status === 429) {
        return { retryable: false, error: new FgaApiRateLimitExceededError(errCtx) };
      } else {
        return { retryable: false, error: new FgaApiInternalError(errCtx) };
      }
    }
    return { retryable: true };
  } else {
    return { retryable: false, error: new FgaApiError(errCtx) };
  }
}

/**
 * Request configuration for attemptHttpRequest.
 */
interface FetchRequestConfig {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  data?: any;
  responseType?: string;
  timeout?: number;
}

export async function attemptHttpRequest<B, R>(
  request: FetchRequestConfig,
  config: {
    maxRetry: number;
    minWaitInMs: number;
  },
  httpClient: HttpClient,
  telemetryConfig?: {
    telemetry?: TelemetryConfiguration;
    userAgent?: string;
  },
): Promise<WrappedResponse<R> | undefined> {
  let iterationCount = 0;
  do {
    iterationCount++;

    const httpRequestStart = performance.now();
    let fgaResponse: FgaResponse<R> | undefined;
    let httpRequestError: any;

    try {
      // Merge headers with case-insensitive override: per-request headers
      // take precedence over default headers regardless of casing.
      const fetchHeaders: Record<string, string> = {};
      if (httpClient.defaultHeaders) {
        for (const [k, v] of Object.entries(httpClient.defaultHeaders)) {
          fetchHeaders[k.toLowerCase()] = v;
        }
      }
      if (request.headers) {
        for (const [k, v] of Object.entries(request.headers)) {
          fetchHeaders[k.toLowerCase()] = v;
        }
      }

      const timeoutMs = request.timeout ?? httpClient.defaultTimeout ?? 10000;
      let signal: AbortSignal | undefined;
      if (typeof AbortSignal !== "undefined" && typeof (AbortSignal as any).timeout === "function") {
        // Use native AbortSignal.timeout when available.
        signal = (AbortSignal as any).timeout(timeoutMs);
      } else if (typeof AbortController !== "undefined") {
        // Fallback for environments without AbortSignal.timeout.
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeoutMs);
        signal = controller.signal;
      }
      const fetchInit: RequestInit = {
        method: request.method || "GET",
        headers: fetchHeaders,
        signal,
      };

      if (request.data !== undefined) {
        if (typeof request.data === "string") {
          fetchInit.body = request.data;
        } else {
          const contentTypeHeader = Object.entries(fetchHeaders).find(
            ([name]) => name.toLowerCase() === "content-type",
          )?.[1];

          const contentType = contentTypeHeader?.split(";")[0].trim().toLowerCase();

          if (contentType === "application/x-www-form-urlencoded") {
            if (request.data instanceof URLSearchParams) {
              fetchInit.body = request.data.toString();
            } else {
              const formParams = new URLSearchParams();
              for (const [key, value] of Object.entries(request.data as Record<string, any>)) {
                if (value === undefined || value === null) continue;
                formParams.append(key, String(value));
              }
              fetchInit.body = formParams.toString();
            }
          } else if (
            contentType === "application/json" ||
            contentType === "text/json" ||
            (contentType?.endsWith("+json") ?? false)
          ) {
            fetchInit.body = JSON.stringify(request.data);
          } else {
            // Default to JSON serialization to preserve existing behavior.
            fetchInit.body = JSON.stringify(request.data);
          }
        }
      }

      const response = await httpClient.fetch(request.url, fetchInit);
      const responseHeaders = headersToRecord(response.headers);

      if (!response.ok) {
        // Non-2xx status — build error context for retry/error handling
        // Read body as text first to avoid consuming the stream with response.json().
        let responseData: any;
        try {
          const rawBody = await response.text();
          try {
            responseData = JSON.parse(rawBody);
          } catch {
            responseData = rawBody;
          }
        } catch {
          responseData = undefined;
        }

        const errCtx: HttpErrorContext = {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          data: responseData,
          requestUrl: request.url,
          requestMethod: request.method,
          requestData: request.data,
        };

        // Emit per-HTTP-request metric before checking retry
        emitHttpRequestMetric(telemetryConfig, request, response.status, httpRequestStart);

        const { retryable, error } = checkIfRetryableError(errCtx, iterationCount, config.maxRetry);

        if (!retryable) {
          throw error;
        }

        // Calculate retry delay
        let retryDelayMs: number | undefined;
        const status = response.status;
        if (status === 429 || (status >= 500 && status !== 501)) {
          retryDelayMs = parseRetryAfterHeader(responseHeaders);
        }
        if (!retryDelayMs) {
          retryDelayMs = calculateExponentialBackoffWithJitter(iterationCount, config.minWaitInMs);
        }

        await new Promise(r => setTimeout(r, Math.min(retryDelayMs, SdkConstants.RetryHeaderMaxAllowableDurationInSec * 1000)));
        continue;
      }

      // Success path
      if (request.responseType === "stream") {
        // For streaming, return the body as-is without parsing
        fgaResponse = {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          data: response.body as any,
        };
      } else {
        let data: any;
        const contentType = response.headers.get("content-type") || "";
        if (response.status === 204 || response.headers.get("content-length") === "0") {
          data = undefined;
        } else if (isJsonMime(contentType)) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        fgaResponse = {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          data,
        };
      }
    } catch (err: any) {
      // Network errors, timeouts, or already-classified FGA errors
      if (err instanceof FgaError) {
        throw err;
      }

      httpRequestError = err;
    }

    // Calculate duration for this individual HTTP call
    const httpRequestDuration = Math.round(performance.now() - httpRequestStart);

    // Emit per-HTTP-request metric if telemetry is configured
    emitHttpRequestMetric(telemetryConfig, request, fgaResponse?.status ?? httpRequestError?.response?.status, httpRequestStart);

    // Handle successful response
    if (fgaResponse && !httpRequestError) {
      return {
        response: fgaResponse,
        retries: iterationCount - 1,
      };
    }

    // Handle network/timeout error
    if (httpRequestError) {
      // Only retry network-level errors (TypeError from fetch, DOMException for abort).
      // Other errors (programming errors, unexpected throws) should propagate immediately.
      const isNetworkError = httpRequestError instanceof TypeError ||
        (httpRequestError?.name === "AbortError") ||
        (httpRequestError?.name === "TimeoutError");

      if (!isNetworkError) {
        throw new FgaError(httpRequestError);
      }

      const errCtx: HttpErrorContext = {
        requestUrl: request.url,
        requestMethod: request.method,
        requestData: request.data,
      };

      const { retryable, error } = checkIfRetryableError(errCtx, iterationCount, config.maxRetry);

      if (!retryable) {
        throw error;
      }

      const retryDelayMs = calculateExponentialBackoffWithJitter(iterationCount, config.minWaitInMs);
      await new Promise(r => setTimeout(r, Math.min(retryDelayMs, SdkConstants.RetryHeaderMaxAllowableDurationInSec * 1000)));
    }
  } while (iterationCount < config.maxRetry + 1);
}

function emitHttpRequestMetric(
  telemetryConfig: { telemetry?: TelemetryConfiguration; userAgent?: string } | undefined,
  request: FetchRequestConfig,
  responseStatus: number | undefined,
  httpRequestStart: number
) {
  if (!telemetryConfig?.telemetry?.metrics?.histogramHttpRequestDuration) return;

  const httpRequestDuration = Math.round(performance.now() - httpRequestStart);
  const httpAttrs: Record<string, string | number> = {};

  if (request.url) {
    try {
      const parsedUrl = new URL(request.url);
      httpAttrs[TelemetryAttribute.HttpHost] = parsedUrl.hostname;
      httpAttrs[TelemetryAttribute.UrlScheme] = parsedUrl.protocol.replace(":", "");
      httpAttrs[TelemetryAttribute.UrlFull] = request.url;
    } catch {
      httpAttrs[TelemetryAttribute.UrlFull] = request.url;
    }
  }
  if (request.method) {
    httpAttrs[TelemetryAttribute.HttpRequestMethod] = request.method.toUpperCase();
  }
  if (telemetryConfig.userAgent) {
    httpAttrs[TelemetryAttribute.UserAgentOriginal] = telemetryConfig.userAgent;
  }
  if (responseStatus != null) {
    httpAttrs[TelemetryAttribute.HttpResponseStatusCode] = responseStatus;
  }

  telemetryConfig.telemetry.recorder.histogram(
    TelemetryHistograms.httpRequestDuration,
    httpRequestDuration,
    TelemetryAttributes.prepare(
      httpAttrs,
      telemetryConfig.telemetry.metrics.histogramHttpRequestDuration.attributes
    )
  );
}

/**
 * creates a fetch request function
 */
export const createRequestFunction = function (axiosArgs: RequestArgs, httpClient: HttpClient, configuration: Configuration, credentials: Credentials, methodAttributes: Record<string, string | number> = {}) {
  configuration.isValid();

  const retryParams = axiosArgs.options?.retryParams ? axiosArgs.options?.retryParams : configuration.retryParams;
  const maxRetry: number = retryParams?.maxRetry ?? 0;
  const minWaitInMs: number = retryParams?.minWaitInMs ?? 0;

  const start = performance.now();

  return async (client: HttpClient = httpClient): PromiseResult<any> => {
    await setBearerAuthToObject(axiosArgs.options.headers, credentials!);

    const url = configuration.getBasePath() + axiosArgs.url;

    const fetchRequestConfig: FetchRequestConfig = {
      url,
      method: axiosArgs.options.method,
      headers: axiosArgs.options.headers,
      data: axiosArgs.options.data,
      timeout: axiosArgs.options.timeout,
    };

    const wrappedResponse = await attemptHttpRequest(fetchRequestConfig, {
      maxRetry,
      minWaitInMs,
    }, client, {
      telemetry: configuration.telemetry,
      userAgent: configuration.baseOptions?.headers?.["User-Agent"],
    });
    const response = wrappedResponse?.response;
    const data = typeof response?.data === "undefined" ? {} : response?.data;
    const result: CallResult<any> = { ...data };
    setNotEnumerableProperty(result, "$response", response);

    let attributes: StringIndexable = {};

    attributes = TelemetryAttributes.fromRequest({
      userAgent: configuration.baseOptions?.headers?.["User-Agent"],
      httpMethod: axiosArgs.options?.method,
      url,
      resendCount: wrappedResponse?.retries,
      start: start,
      credentials: credentials,
      attributes: methodAttributes,
    });

    attributes = TelemetryAttributes.fromResponse({
      response,
      attributes,
    });

    // only if hisogramQueryDuration set AND if response header contains fga-query-duration-ms
    const serverRequestDuration = attributes[TelemetryAttribute.HttpServerRequestDuration];
    if (configuration.telemetry?.metrics?.histogramQueryDuration && typeof serverRequestDuration !== "undefined") {
      configuration.telemetry.recorder.histogram(
        TelemetryHistograms.queryDuration,
        parseInt(attributes[TelemetryAttribute.HttpServerRequestDuration] as string, 10),
        TelemetryAttributes.prepare(
          attributes,
          configuration.telemetry.metrics.histogramQueryDuration.attributes
        )
      );
    }

    if (configuration.telemetry?.metrics?.histogramRequestDuration) {
      configuration.telemetry.recorder.histogram(
        TelemetryHistograms.requestDuration,
        attributes[TelemetryAttribute.HttpClientRequestDuration],
        TelemetryAttributes.prepare(
          attributes,
          configuration.telemetry.metrics.histogramRequestDuration.attributes
        )
      );
    }

    return result;
  };
};

/**
 * HTTP methods supported by executeApiRequest
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Request parameters for executeApiRequest
 */
export interface RequestBuilderParams {
  /**
   * Operation name for telemetry and logging (e.g., "CustomCheck", "CustomEndpoint").
   * Used for observability when calling new or experimental endpoints.
   */
  operationName: string;
  /** HTTP method */
  method: HttpMethod;
  /**
   * API path with optional template parameters.
   * Template parameters should be in the format {param_name} and will be replaced
   * with URL-encoded values from pathParams.
   * Example: '/stores/{store_id}/custom-endpoint'
   */
  path: string;
  /**
   * Path parameters to replace template variables in the path.
   * Values will be URL-encoded automatically.
   * Example: { store_id: "abc123" } will replace {store_id} in the path.
   */
  pathParams?: Record<string, string>;
  /** Optional request body for POST/PUT/PATCH requests */
  body?: unknown;
  /** Optional query parameters */
  queryParams?: Record<string, unknown>;
  /** Optional custom request headers */
  headers?: Record<string, string>;
}

/**
 * Options for RequestBuilder — typically the merge of configuration.baseOptions and per-call overrides.
 * SDK-enforced headers (Accept, Content-Type for JSON bodies) always take precedence over these.
 */
export interface RequestBuilderOptions {
  /** Custom request headers. */
  headers?: Record<string, string>;
  /** Extra query parameters appended to the URL. */
  query?: Record<string, unknown>;
  /** Request timeout in milliseconds. */
  timeout?: number;
  /** Retry configuration for this request. */
  retryParams?: RetryParams;
}

/**
 * Internal request options used inside RequestBuilder.
 * Extends the public options with fields set by the SDK itself.
 */
interface InternalRequestOptions extends RequestBuilderOptions {
  method?: string;
  data?: string;
}

/**
 * Builds the RequestArgs for an arbitrary API call.
 *
 * @param request - The request parameters
 * @param options - Request options (merge configuration.baseOptions and per-call overrides before passing)
 * @throws { FgaError }
 */
export function RequestBuilder(request: RequestBuilderParams, options: RequestBuilderOptions = {}): RequestArgs {
  // Build path by replacing template parameters with URL-encoded values
  let requestPathTemplate = request.path;
  if (request.pathParams) {
    for (const [key, value] of Object.entries(request.pathParams)) {
      requestPathTemplate = requestPathTemplate.split(`{${key}}`).join(encodeURIComponent(value));
    }
  }

  // Validate that all path parameters have been replaced
  const openBrace = requestPathTemplate.indexOf("{");
  if (openBrace !== -1) {
    const closeBrace = requestPathTemplate.indexOf("}", openBrace + 1);
    if (closeBrace !== -1) {
      const paramName = requestPathTemplate.slice(openBrace + 1, closeBrace);
      throw new FgaValidationError(paramName, `Path parameter '${paramName}' was not provided for path: ${request.path}`);
    }
  }

  const requestUrl = new URL(requestPathTemplate, DUMMY_BASE_URL);
  const requestOptions: InternalRequestOptions = { method: request.method, ...options };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryParams = {} as any;

  if (request.queryParams) {
    for (const [key, value] of Object.entries(request.queryParams)) {
      if (typeof value == "undefined") {
        continue;
      }

      // Convert Date objects in query parameters to ISO strings
      // to allow Dates passed in to be accepted by readChanges.
      if (value instanceof Date) {
        queryParams[key] = value.toISOString();
      } else {
        queryParams[key] = value;
      }
    }
  }

  setSearchParams(requestUrl, queryParams, options.query);
  // For now - we always enforce Accept and content-type headers
  requestOptions.headers = { ...request.headers, ...options.headers };
  requestOptions.headers["Accept"] = "application/json";
  if (request.body !== undefined && (request.method === "POST" || request.method === "PUT" || request.method === "PATCH")) {
    requestOptions.headers["Content-Type"] = "application/json";
  }

  if (request.body !== undefined) {
    requestOptions.data = serializeDataIfNeeded(request.body, requestOptions);
  }

  return {
    url: toPathString(requestUrl),
    options: requestOptions,
  };
}

/**
 * creates a streaming request function that returns the raw response stream
 * for incremental parsing (used by streamedListObjects)
 */
export const createStreamingRequestFunction = function (axiosArgs: RequestArgs, httpClient: HttpClient, configuration: Configuration, credentials: Credentials, methodAttributes: Record<string, string | number> = {}) {
  configuration.isValid();

  const retryParams = axiosArgs.options?.retryParams ? axiosArgs.options?.retryParams : configuration.retryParams;
  const maxRetry: number = retryParams ? retryParams.maxRetry : 0;
  const minWaitInMs: number = retryParams ? retryParams.minWaitInMs : 0;

  const start = performance.now();

  return async (client: HttpClient = httpClient): Promise<any> => {
    await setBearerAuthToObject(axiosArgs.options.headers, credentials!);

    const url = configuration.getBasePath() + axiosArgs.url;

    const fetchRequestConfig: FetchRequestConfig = {
      url,
      method: axiosArgs.options.method,
      headers: axiosArgs.options.headers,
      data: axiosArgs.options.data,
      responseType: "stream",
      timeout: axiosArgs.options.timeout,
    };

    const wrappedResponse = await attemptHttpRequest(fetchRequestConfig, {
      maxRetry,
      minWaitInMs,
    }, client, {
      telemetry: configuration.telemetry,
      userAgent: configuration.baseOptions?.headers?.["User-Agent"],
    });
    const response = wrappedResponse?.response;

    const result: any = response?.data; // raw ReadableStream

    let attributes: StringIndexable = {};

    attributes = TelemetryAttributes.fromRequest({
      userAgent: configuration.baseOptions?.headers?.["User-Agent"],
      httpMethod: axiosArgs.options?.method,
      url,
      resendCount: wrappedResponse?.retries,
      start: start,
      credentials: credentials,
      attributes: methodAttributes,
    });

    attributes = TelemetryAttributes.fromResponse({
      response,
      attributes,
    });

    const serverRequestDuration = attributes[TelemetryAttribute.HttpServerRequestDuration];
    if (configuration.telemetry?.metrics?.histogramQueryDuration && typeof serverRequestDuration !== "undefined") {
      configuration.telemetry.recorder.histogram(
        TelemetryHistograms.queryDuration,
        parseInt(attributes[TelemetryAttribute.HttpServerRequestDuration] as string, 10),
        TelemetryAttributes.prepare(
          attributes,
          configuration.telemetry.metrics.histogramQueryDuration.attributes
        )
      );
    }

    if (configuration.telemetry?.metrics?.histogramRequestDuration) {
      configuration.telemetry.recorder.histogram(
        TelemetryHistograms.requestDuration,
        attributes[TelemetryAttribute.HttpClientRequestDuration],
        TelemetryAttributes.prepare(
          attributes,
          configuration.telemetry.metrics.histogramRequestDuration.attributes
        )
      );
    }

    return result;
  };
};
