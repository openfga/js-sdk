"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStreamingRequestFunction = exports.createRequestFunction = exports.toPathString = exports.serializeDataIfNeeded = exports.setSearchParams = exports.setBearerAuthToObject = exports.DUMMY_BASE_URL = void 0;
exports.attemptHttpRequest = attemptHttpRequest;
exports.RequestBuilder = RequestBuilder;
const constants_1 = __importDefault(require("./constants"));
const errors_1 = require("./errors");
const utils_1 = require("./utils");
const attributes_1 = require("./telemetry/attributes");
const histograms_1 = require("./telemetry/histograms");
/**
 *
 * @export
 */
exports.DUMMY_BASE_URL = `https://${constants_1.default.SampleBaseDomain}`;
/**
 *
 * @export
 */
const setBearerAuthToObject = async function (object, credentials) {
    const accessTokenHeader = await credentials.getAccessTokenHeader();
    if (accessTokenHeader && !object[accessTokenHeader.name]) {
        object[accessTokenHeader.name] = accessTokenHeader.value;
    }
};
exports.setBearerAuthToObject = setBearerAuthToObject;
/**
 *
 * @export
 */
const setSearchParams = function (url, ...objects) {
    const searchParams = new URLSearchParams(url.search);
    for (const object of objects) {
        for (const key in object) {
            if (Array.isArray(object[key])) {
                searchParams.delete(key);
                for (const item of object[key]) {
                    searchParams.append(key, item);
                }
            }
            else {
                searchParams.set(key, object[key]);
            }
        }
    }
    url.search = searchParams.toString();
};
exports.setSearchParams = setSearchParams;
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
const isJsonMime = (mime) => {
    const jsonMime = new RegExp("^(application/json|[^;/ \t]+/[^;/ \t]+[+]json)[ \t]*(;.*)?$", "i");
    return mime !== null && (jsonMime.test(mime) || mime.toLowerCase() === "application/json-patch+json");
};
/**
 *
 * @export
 */
const serializeDataIfNeeded = function (value, requestOptions) {
    const nonString = typeof value !== "string";
    const needsSerialization = nonString
        ? isJsonMime(requestOptions.headers["Content-Type"])
        : nonString;
    return needsSerialization
        ? JSON.stringify(value !== undefined ? value : {})
        : (value || "");
};
exports.serializeDataIfNeeded = serializeDataIfNeeded;
/**
 *
 * @export
 */
const toPathString = function (url) {
    return url.pathname + url.search + url.hash;
};
exports.toPathString = toPathString;
/**
 * Returns true if this error is returned from axios
 * source: https://github.com/axios/axios/blob/21a5ad34c4a5956d81d338059ac0dd34a19ed094/lib/helpers/isAxiosError.js#L12
 * @param err
 */
function isAxiosError(err) {
    return err && typeof err === "object" && err.isAxiosError === true;
}
function calculateExponentialBackoffWithJitter(retryAttempt, minWaitInMs) {
    const minDelayMs = Math.ceil(2 ** retryAttempt * minWaitInMs);
    const maxDelayMs = Math.ceil(2 ** (retryAttempt + 1) * minWaitInMs);
    const randomDelayMs = Math.floor(Math.random() * (maxDelayMs - minDelayMs) + minDelayMs);
    return Math.min(randomDelayMs, constants_1.default.MaxBackoffTimeInSec * 1000);
}
/**
 * Validates if a retry delay is within acceptable bounds
 * @param delayMs - Delay in milliseconds
 * @returns True if delay is between {@link SdkConstants.DefaultMinWaitInMs}ms and {@link SdkConstants.RetryHeaderMaxAllowableDurationInSec}s
 */
function isValidRetryDelay(delayMs) {
    return delayMs >= constants_1.default.DefaultMinWaitInMs && delayMs <= constants_1.default.RetryHeaderMaxAllowableDurationInSec * 1000;
}
/**
 * Parses the Retry-After header and returns delay in milliseconds
 * @param headers - HTTP response headers
 * @returns Delay in milliseconds if valid, undefined otherwise
 */
function parseRetryAfterHeader(headers) {
    // Find the retry-after header regardless of case
    const retryAfterHeaderNameLower = constants_1.default.RetryAfterHeaderName.toLowerCase();
    const retryAfterKey = Object.keys(headers).find(key => key.toLowerCase() === retryAfterHeaderNameLower);
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
    }
    catch (e) {
        // Invalid date format
    }
    return undefined;
}
function checkIfRetryableError(err, iterationCount, maxRetry) {
    if (!isAxiosError(err)) {
        return { retryable: false, error: new errors_1.FgaError(err) };
    }
    const status = err?.response?.status;
    const isNetworkError = !status;
    if (isNetworkError) {
        if (iterationCount > maxRetry) {
            return { retryable: false, error: new errors_1.FgaError(err) };
        }
        return { retryable: true };
    }
    if (status === 400 || status === 422) {
        return { retryable: false, error: new errors_1.FgaApiValidationError(err) };
    }
    else if (status === 401 || status === 403) {
        return { retryable: false, error: new errors_1.FgaApiAuthenticationError(err) };
    }
    else if (status === 404) {
        return { retryable: false, error: new errors_1.FgaApiNotFoundError(err) };
    }
    else if (status === 429 || (status >= 500 && status !== 501)) {
        if (iterationCount > maxRetry) {
            if (status === 429) {
                return { retryable: false, error: new errors_1.FgaApiRateLimitExceededError(err) };
            }
            else {
                return { retryable: false, error: new errors_1.FgaApiInternalError(err) };
            }
        }
        return { retryable: true };
    }
    else {
        return { retryable: false, error: new errors_1.FgaApiError(err) };
    }
}
async function attemptHttpRequest(request, config, axiosInstance, telemetryConfig) {
    let iterationCount = 0;
    do {
        iterationCount++;
        // Track HTTP request duration for this specific call
        const httpRequestStart = performance.now();
        let response;
        let httpRequestError;
        try {
            response = await axiosInstance(request);
        }
        catch (err) {
            httpRequestError = err;
        }
        // Calculate duration for this individual HTTP call
        const httpRequestDuration = Math.round(performance.now() - httpRequestStart);
        // Emit per-HTTP-request metric if telemetry is configured
        if (telemetryConfig?.telemetry?.metrics?.histogramHttpRequestDuration) {
            const httpAttrs = {};
            // Build attributes from the request
            if (request.url) {
                try {
                    const parsedUrl = new URL(request.url);
                    httpAttrs[attributes_1.TelemetryAttribute.HttpHost] = parsedUrl.hostname;
                    httpAttrs[attributes_1.TelemetryAttribute.UrlScheme] = parsedUrl.protocol.replace(":", "");
                    httpAttrs[attributes_1.TelemetryAttribute.UrlFull] = request.url;
                }
                catch {
                    // URL parsing failed, still include the raw URL
                    httpAttrs[attributes_1.TelemetryAttribute.UrlFull] = request.url;
                }
            }
            if (request.method) {
                httpAttrs[attributes_1.TelemetryAttribute.HttpRequestMethod] = request.method.toUpperCase();
            }
            if (telemetryConfig.userAgent) {
                httpAttrs[attributes_1.TelemetryAttribute.UserAgentOriginal] = telemetryConfig.userAgent;
            }
            // Add response status code if available
            const responseStatus = response?.status || httpRequestError?.response?.status;
            if (responseStatus != null) {
                httpAttrs[attributes_1.TelemetryAttribute.HttpResponseStatusCode] = responseStatus;
            }
            telemetryConfig.telemetry.recorder.histogram(histograms_1.TelemetryHistograms.httpRequestDuration, httpRequestDuration, attributes_1.TelemetryAttributes.prepare(httpAttrs, telemetryConfig.telemetry.metrics.histogramHttpRequestDuration.attributes));
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
            let retryDelayMs;
            if ((status &&
                (status === 429 || (status >= 500 && status !== 501))) &&
                httpRequestError.response?.headers) {
                retryDelayMs = parseRetryAfterHeader(httpRequestError.response.headers);
            }
            if (!retryDelayMs) {
                retryDelayMs = calculateExponentialBackoffWithJitter(iterationCount, config.minWaitInMs);
            }
            await new Promise(r => setTimeout(r, Math.min(retryDelayMs, constants_1.default.RetryHeaderMaxAllowableDurationInSec * 1000)));
        }
    } while (iterationCount < config.maxRetry + 1);
}
/**
 * creates an axios request function
 */
const createRequestFunction = function (axiosArgs, axiosInstance, configuration, credentials, methodAttributes = {}) {
    configuration.isValid();
    const retryParams = axiosArgs.options?.retryParams ? axiosArgs.options?.retryParams : configuration.retryParams;
    const maxRetry = retryParams?.maxRetry ?? 0;
    const minWaitInMs = retryParams?.minWaitInMs ?? 0;
    const start = performance.now();
    return async (axios = axiosInstance) => {
        await (0, exports.setBearerAuthToObject)(axiosArgs.options.headers, credentials);
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
        const result = { ...data };
        (0, utils_1.setNotEnumerableProperty)(result, "$response", response);
        let attributes = {};
        attributes = attributes_1.TelemetryAttributes.fromRequest({
            userAgent: configuration.baseOptions?.headers["User-Agent"],
            httpMethod: axiosArgs.options?.method,
            url,
            resendCount: wrappedResponse?.retries,
            start: start,
            credentials: credentials,
            attributes: methodAttributes,
        });
        attributes = attributes_1.TelemetryAttributes.fromResponse({
            response,
            attributes,
        });
        // only if hisogramQueryDuration set AND if response header contains fga-query-duration-ms
        const serverRequestDuration = attributes[attributes_1.TelemetryAttribute.HttpServerRequestDuration];
        if (configuration.telemetry?.metrics?.histogramQueryDuration && typeof serverRequestDuration !== "undefined") {
            configuration.telemetry.recorder.histogram(histograms_1.TelemetryHistograms.queryDuration, parseInt(attributes[attributes_1.TelemetryAttribute.HttpServerRequestDuration], 10), attributes_1.TelemetryAttributes.prepare(attributes, configuration.telemetry.metrics.histogramQueryDuration.attributes));
        }
        if (configuration.telemetry?.metrics?.histogramRequestDuration) {
            configuration.telemetry.recorder.histogram(histograms_1.TelemetryHistograms.requestDuration, attributes[attributes_1.TelemetryAttribute.HttpClientRequestDuration], attributes_1.TelemetryAttributes.prepare(attributes, configuration.telemetry.metrics.histogramRequestDuration.attributes));
        }
        return result;
    };
};
exports.createRequestFunction = createRequestFunction;
/**
 * Builds the axios RequestArgs for an arbitrary API call.
 *
 * @param request - The request parameters
 * @param options - Request options (merge configuration.baseOptions and per-call overrides before passing)
 * @throws { FgaError }
 */
function RequestBuilder(request, options = {}) {
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
            throw new errors_1.FgaValidationError(paramName, `Path parameter '${paramName}' was not provided for path: ${request.path}`);
        }
    }
    const requestUrl = new URL(requestPathTemplate, exports.DUMMY_BASE_URL);
    const requestOptions = { method: request.method, ...options };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryParams = {};
    if (request.queryParams) {
        for (const [key, value] of Object.entries(request.queryParams)) {
            if (typeof value == "undefined") {
                continue;
            }
            // Convert Date objects in query parameters to ISO strings
            // to allow Dates passed in to be accepted by readChanges.
            if (value instanceof Date) {
                queryParams[key] = value.toISOString();
            }
            else {
                queryParams[key] = value;
            }
        }
    }
    (0, exports.setSearchParams)(requestUrl, queryParams, options.query);
    // For now - we always enforce Accept and content-type headers
    requestOptions.headers = { ...request.headers, ...options.headers };
    requestOptions.headers["Accept"] = "application/json";
    if (request.body !== undefined && (request.method === "POST" || request.method === "PUT" || request.method === "PATCH")) {
        requestOptions.headers["Content-Type"] = "application/json";
    }
    if (request.body !== undefined) {
        requestOptions.data = (0, exports.serializeDataIfNeeded)(request.body, requestOptions);
    }
    return {
        url: (0, exports.toPathString)(requestUrl),
        options: requestOptions,
    };
}
/**
 * creates an axios streaming request function that returns the raw response stream
 * for incremental parsing (used by streamedListObjects)
 */
const createStreamingRequestFunction = function (axiosArgs, axiosInstance, configuration, credentials, methodAttributes = {}) {
    configuration.isValid();
    const retryParams = axiosArgs.options?.retryParams ? axiosArgs.options?.retryParams : configuration.retryParams;
    const maxRetry = retryParams ? retryParams.maxRetry : 0;
    const minWaitInMs = retryParams ? retryParams.minWaitInMs : 0;
    const start = performance.now();
    return async (axios = axiosInstance) => {
        await (0, exports.setBearerAuthToObject)(axiosArgs.options.headers, credentials);
        const url = configuration.getBasePath() + axiosArgs.url;
        const axiosRequestArgs = { ...axiosArgs.options, responseType: "stream", url: url };
        const wrappedResponse = await attemptHttpRequest(axiosRequestArgs, {
            maxRetry,
            minWaitInMs,
        }, axios);
        const response = wrappedResponse?.response;
        const result = response?.data; // raw stream
        let attributes = {};
        attributes = attributes_1.TelemetryAttributes.fromRequest({
            userAgent: configuration.baseOptions?.headers["User-Agent"],
            httpMethod: axiosArgs.options?.method,
            url,
            resendCount: wrappedResponse?.retries,
            start: start,
            credentials: credentials,
            attributes: methodAttributes,
        });
        attributes = attributes_1.TelemetryAttributes.fromResponse({
            response,
            attributes,
        });
        const serverRequestDuration = attributes[attributes_1.TelemetryAttribute.HttpServerRequestDuration];
        if (configuration.telemetry?.metrics?.histogramQueryDuration && typeof serverRequestDuration !== "undefined") {
            configuration.telemetry.recorder.histogram(histograms_1.TelemetryHistograms.queryDuration, parseInt(attributes[attributes_1.TelemetryAttribute.HttpServerRequestDuration], 10), attributes_1.TelemetryAttributes.prepare(attributes, configuration.telemetry.metrics.histogramQueryDuration.attributes));
        }
        if (configuration.telemetry?.metrics?.histogramRequestDuration) {
            configuration.telemetry.recorder.histogram(histograms_1.TelemetryHistograms.requestDuration, attributes[attributes_1.TelemetryAttribute.HttpClientRequestDuration], attributes_1.TelemetryAttributes.prepare(attributes, configuration.telemetry.metrics.histogramRequestDuration.attributes));
        }
        return result;
    };
};
exports.createStreamingRequestFunction = createStreamingRequestFunction;
//# sourceMappingURL=common.js.map