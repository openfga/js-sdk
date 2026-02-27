import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import { Configuration } from "./configuration";
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
  // eslint-disable-next-line no-control-regex
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
  $response: AxiosResponse<T>
};

export type PromiseResult<T extends ObjectOrVoid> = Promise<CallResult<T>>;

/**
 * Returns true if this error is returned from axios
 * source: https://github.com/axios/axios/blob/21a5ad34c4a5956d81d338059ac0dd34a19ed094/lib/helpers/isAxiosError.js#L12
 * @param err
 */
function isAxiosError(err: any): boolean {
  return err && typeof err === "object" && err.isAxiosError === true;
}
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
function parseRetryAfterHeader(headers: Record<string, string | string[] | undefined>): number | undefined {
  // Find the retry-after header regardless of case
  const retryAfterHeaderNameLower = SdkConstants.RetryAfterHeaderName.toLowerCase();
  const retryAfterKey = Object.keys(headers).find(key =>
    key.toLowerCase() === retryAfterHeaderNameLower
  );

  const retryAfterHeader = retryAfterKey ? headers[retryAfterKey] : undefined;

  if (!retryAfterHeader) {
    return undefined;
  }

  const retryAfterHeaderValue = Array.isArray(retryAfterHeader) ? retryAfterHeader[0] : retryAfterHeader;

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

interface WrappedAxiosResponse<R> {
  response?: AxiosResponse<R>;
  retries: number;
}

function checkIfRetryableError(
  err: any,
  iterationCount: number,
  maxRetry: number
): { retryable: boolean; error?: Error } {
  if (!isAxiosError(err)) {
    return { retryable: false, error: new FgaError(err) };
  }

  const status = (err as any)?.response?.status;
  const isNetworkError = !status;

  if (isNetworkError) {
    if (iterationCount > maxRetry) {
      return { retryable: false, error: new FgaError(err) };
    }
    return { retryable: true };
  }

  if (status === 400 || status === 422) {
    return { retryable: false, error: new FgaApiValidationError(err) };
  } else if (status === 401 || status === 403) {
    return { retryable: false, error: new FgaApiAuthenticationError(err) };
  } else if (status === 404) {
    return { retryable: false, error: new FgaApiNotFoundError(err) };
  } else if (status === 429 || (status >= 500 && status !== 501)) {
    if (iterationCount > maxRetry) {
      if (status === 429) {
        return { retryable: false, error: new FgaApiRateLimitExceededError(err) };
      } else {
        return { retryable: false, error: new FgaApiInternalError(err) };
      }
    }
    return { retryable: true };
  } else {
    return { retryable: false, error: new FgaApiError(err) };
  }
}

export async function attemptHttpRequest<B, R>(
  request: AxiosRequestConfig<B>,
  config: {
    maxRetry: number;
    minWaitInMs: number;
  },
  axiosInstance: AxiosInstance,
  telemetryConfig?: {
    telemetry?: TelemetryConfiguration;
    userAgent?: string;
  },
): Promise<WrappedAxiosResponse<R> | undefined> {
  let iterationCount = 0;
  do {
    iterationCount++;

    // Track HTTP request duration for this specific call
    const httpRequestStart = performance.now();
    let response: AxiosResponse<R> | undefined;
    let httpRequestError: any;

    try {
      response = await axiosInstance(request);
    } catch (err: any) {
      httpRequestError = err;
    }

    // Calculate duration for this individual HTTP call
    const httpRequestDuration = Math.round(performance.now() - httpRequestStart);

    // Emit per-HTTP-request metric if telemetry is configured
    if (telemetryConfig?.telemetry?.metrics?.histogramHttpRequestDuration) {
      const httpAttrs: Record<string, string | number> = {};

      // Build attributes from the request
      if (request.url) {
        try {
          const parsedUrl = new URL(request.url);
          httpAttrs[TelemetryAttribute.HttpHost] = parsedUrl.hostname;
          httpAttrs[TelemetryAttribute.UrlScheme] = parsedUrl.protocol.replace(":", "");
          httpAttrs[TelemetryAttribute.UrlFull] = request.url;
        } catch {
          // URL parsing failed, still include the raw URL
          httpAttrs[TelemetryAttribute.UrlFull] = request.url;
        }
      }
      if (request.method) {
        httpAttrs[TelemetryAttribute.HttpRequestMethod] = request.method.toUpperCase();
      }
      if (telemetryConfig.userAgent) {
        httpAttrs[TelemetryAttribute.UserAgentOriginal] = telemetryConfig.userAgent;
      }

      // Add response status code if available
      const responseStatus = response?.status || httpRequestError?.response?.status;
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

    // Handle successful response
    if (response && !httpRequestError) {
      return {
        response: response,
        retries: iterationCount - 1,
      };
    }

    // Handle error
    if (httpRequestError) {
      const { retryable, error } = checkIfRetryableError(httpRequestError, iterationCount, config.maxRetry);

      if (!retryable) {
        throw error;
      }

      const status = httpRequestError?.response?.status;
      let retryDelayMs: number | undefined;

      if ((status &&
        (status === 429 || (status >= 500 && status !== 501))) &&
        httpRequestError.response?.headers) {
        retryDelayMs = parseRetryAfterHeader(httpRequestError.response.headers);
      }
      if (!retryDelayMs) {
        retryDelayMs = calculateExponentialBackoffWithJitter(iterationCount, config.minWaitInMs);
      }

      await new Promise(r => setTimeout(r, Math.min(retryDelayMs, SdkConstants.RetryHeaderMaxAllowableDurationInSec * 1000)));
    }
  } while (iterationCount < config.maxRetry + 1);
}

/**
 * creates an axios request function
 */
export const createRequestFunction = function (axiosArgs: RequestArgs, axiosInstance: AxiosInstance, configuration: Configuration, credentials: Credentials, methodAttributes: Record<string, string | number> = {}) {
  configuration.isValid();

  const retryParams = axiosArgs.options?.retryParams ? axiosArgs.options?.retryParams : configuration.retryParams;
  const maxRetry: number = retryParams?.maxRetry ?? 0;
  const minWaitInMs: number = retryParams?.minWaitInMs ?? 0;

  const start = performance.now();

  return async (axios: AxiosInstance = axiosInstance): PromiseResult<any> => {
    await setBearerAuthToObject(axiosArgs.options.headers, credentials!);

    const url = configuration.getBasePath() + axiosArgs.url;

    const axiosRequestArgs = { ...axiosArgs.options, url: url };
    const wrappedResponse = await attemptHttpRequest(axiosRequestArgs, {
      maxRetry,
      minWaitInMs,
    }, axios, {
      telemetry: configuration.telemetry,
      userAgent: configuration.baseOptions?.headers?.["User-Agent"],
    });
    const response = wrappedResponse?.response;
    const data = typeof response?.data === "undefined" ? {} : response?.data;
    const result: CallResult<any> = { ...data };
    setNotEnumerableProperty(result, "$response", response);

    let attributes: StringIndexable = {};

    attributes = TelemetryAttributes.fromRequest({
      userAgent: configuration.baseOptions?.headers["User-Agent"],
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
  /** Any other axios request config properties (e.g. timeout, auth). */
  [key: string]: unknown;
}

/**
 * Builds the axios RequestArgs for an arbitrary API call.
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
  const requestOptions: RequestBuilderOptions = { method: request.method, ...options };
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
 * creates an axios streaming request function that returns the raw response stream
 * for incremental parsing (used by streamedListObjects)
 */
export const createStreamingRequestFunction = function (axiosArgs: RequestArgs, axiosInstance: AxiosInstance, configuration: Configuration, credentials: Credentials, methodAttributes: Record<string, string | number> = {}) {
  configuration.isValid();

  const retryParams = axiosArgs.options?.retryParams ? axiosArgs.options?.retryParams : configuration.retryParams;
  const maxRetry: number = retryParams ? retryParams.maxRetry : 0;
  const minWaitInMs: number = retryParams ? retryParams.minWaitInMs : 0;

  const start = performance.now();

  return async (axios: AxiosInstance = axiosInstance): Promise<any> => {
    await setBearerAuthToObject(axiosArgs.options.headers, credentials!);

    const url = configuration.getBasePath() + axiosArgs.url;

    const axiosRequestArgs = { ...axiosArgs.options, responseType: "stream", url: url };
    const wrappedResponse = await attemptHttpRequest(axiosRequestArgs, {
      maxRetry,
      minWaitInMs,
    }, axios);
    const response = wrappedResponse?.response;

    const result: any = response?.data; // raw stream

    let attributes: StringIndexable = {};

    attributes = TelemetryAttributes.fromRequest({
      userAgent: configuration.baseOptions?.headers["User-Agent"],
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