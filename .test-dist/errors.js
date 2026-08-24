"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FgaRequiredParamError = exports.FgaValidationError = exports.FgaApiAuthenticationError = exports.FgaApiInternalError = exports.FgaApiRateLimitExceededError = exports.FgaApiNotFoundError = exports.FgaApiValidationError = exports.FgaApiError = exports.FgaError = void 0;
/**
 *
 * @export
 * @class FgaError
 * @extends {Error}
 */
class FgaError extends Error {
    constructor(err, msg) {
        super(msg ?? (typeof err === "string"
            ? err
            : `FGA Error${err?.message ? `: ${err.message}` : ""}`));
        this.name = "FgaError";
        if (err?.stack) {
            this.stack = err.stack;
        }
    }
}
exports.FgaError = FgaError;
function getRequestMetadataFromPath(path) {
    // This function works because all paths start with /stores/{storeId}/{type}
    let splitPath = (path || "").split("/");
    if (splitPath.length < 4) {
        splitPath = [];
    }
    const storeId = splitPath[2] || "";
    const endpointCategory = splitPath[3] || "";
    return { storeId, endpointCategory };
}
const cFGARequestId = "fga-request-id";
function getResponseHeaders(err) {
    return err.response
        ? Object.fromEntries(Object.entries(err.response.headers).map(([k, v]) => [
            k.toLowerCase(), v,
        ]))
        : {};
}
function parseRequestData(data) {
    if (typeof data !== "string") {
        return data;
    }
    try {
        return JSON.parse(data);
    }
    catch {
        try {
            const params = new URLSearchParams(data);
            const parsedParams = Object.fromEntries(params.entries());
            return Object.keys(parsedParams).length > 0 ? parsedParams : undefined;
        }
        catch {
            return undefined;
        }
    }
}
function getAuthenticationErrorMessage(err) {
    const statusText = err instanceof FgaApiError ? err.statusText : err.response?.statusText;
    return `FGA Authentication Error.${statusText ? ` ${statusText}` : ""}`;
}
/**
 *
 * @export
 * @class FgaApiError
 * @extends { FgaError }
 */
class FgaApiError extends FgaError {
    constructor(err, msg) {
        super(msg ? msg : err);
        this.name = "FgaApiError";
        this.statusCode = err.response?.status;
        this.statusText = err.response?.statusText;
        this.requestData = err.config?.data;
        this.requestURL = err.config?.url;
        this.method = err.config?.method;
        const { storeId, endpointCategory } = getRequestMetadataFromPath(err.request?.path);
        this.storeId = storeId;
        this.endpointCategory = endpointCategory;
        this.apiErrorMessage = err.response?.data?.message;
        this.responseData = err.response?.data;
        this.responseHeader = err.response?.headers;
        const errResponseHeaders = getResponseHeaders(err);
        this.requestId = errResponseHeaders[cFGARequestId];
        if (err?.stack) {
            this.stack = err.stack;
        }
    }
}
exports.FgaApiError = FgaApiError;
/**
 *
 * @export
 * @class FgaApiValidationError
 * @extends { FgaApiError }
 */
class FgaApiValidationError extends FgaApiError {
    constructor(err, msg) {
        // If there is a better error message, use it instead of the default error
        super(err);
        this.name = "FgaApiValidationError";
        this.apiErrorCode = err.response?.data?.code;
        const { endpointCategory } = getRequestMetadataFromPath(err.request?.path);
        this.message = msg
            ? msg
            : err.response?.data?.message
                ? `FGA API Validation Error: ${err.config?.method} ${endpointCategory} : Error ${err.response?.data?.message}`
                : err.message;
    }
}
exports.FgaApiValidationError = FgaApiValidationError;
/**
 *
 * @export
 * @class FgaApiNotFoundError
 * @extends { FgaApiError }
 */
class FgaApiNotFoundError extends FgaApiError {
    constructor(err, msg) {
        // If there is a better error message, use it instead of the default error
        super(err);
        this.name = "FgaApiNotFoundError";
        this.apiErrorCode = err.response?.data?.code;
        this.message = msg
            ? msg
            : err.response?.data?.message
                ? `FGA API NotFound Error: ${err.config?.method} : Error ${err.response?.data?.message}`
                : err.message;
    }
}
exports.FgaApiNotFoundError = FgaApiNotFoundError;
const cXRateLimit = "x-ratelimit-limit";
const cXRateLimitReset = "x-ratelimit-reset";
/**
 *
 * @export
 * @class FgaApiRateLimitExceededError
 * @extends { FgaApiError }
 */
class FgaApiRateLimitExceededError extends FgaApiError {
    constructor(err, msg) {
        super(err);
        this.name = "FgaApiRateLimitExceededError";
        this.apiErrorCode = err.response?.data?.code;
        this.message = msg
            ? msg
            : `FGA API Rate Limit Error for ${this.method} ${this.endpointCategory}`;
    }
}
exports.FgaApiRateLimitExceededError = FgaApiRateLimitExceededError;
/**
 *
 * @export
 * @class FgaApiInternalError
 * @extends { FgaApiError }
 */
class FgaApiInternalError extends FgaApiError {
    constructor(err, msg) {
        // If there is a better error message, use it instead of the default error
        super(err);
        this.name = "FgaApiInternalError";
        const { endpointCategory } = getRequestMetadataFromPath(err.request?.path);
        this.apiErrorCode = err.response?.data?.code;
        this.message = msg
            ? msg
            : err.response?.data?.message
                ? `FGA API Internal Error: ${err.config?.method} ${endpointCategory} : Error ${err.response?.data?.message}`
                : err.message;
    }
}
exports.FgaApiInternalError = FgaApiInternalError;
/**
 *
 * @export
 * @class FgaApiAuthenticationError
 * @extends { FgaApiError }
 */
class FgaApiAuthenticationError extends FgaApiError {
    constructor(err, context) {
        super(err, getAuthenticationErrorMessage(err));
        this.name = "FgaApiAuthenticationError";
        if (err instanceof FgaApiError) {
            this.statusCode = err.statusCode;
            this.statusText = err.statusText;
            this.requestURL = err.requestURL;
            this.method = err.method;
            this.responseData = err.responseData;
            this.responseHeader = err.responseHeader;
            this.requestId = err.requestId;
            this.apiErrorCode = err.responseData?.code;
            const data = parseRequestData(err.requestData);
            this.clientId = context?.clientId ?? data?.client_id;
            this.audience = context?.audience ?? data?.audience;
            this.grantType = context?.grantType ?? data?.grant_type;
            if (err?.stack) {
                this.stack = err.stack;
            }
            return;
        }
        this.statusCode = err.response?.status;
        this.statusText = err.response?.statusText;
        this.requestURL = err.config?.url;
        this.method = err.config?.method;
        this.responseData = err.response?.data;
        this.responseHeader = err.response?.headers;
        this.apiErrorCode = err.response?.data?.code;
        const errResponseHeaders = getResponseHeaders(err);
        this.requestId = errResponseHeaders[cFGARequestId];
        const data = parseRequestData(err.config?.data);
        this.clientId = context?.clientId ?? data?.client_id;
        this.audience = context?.audience ?? data?.audience;
        this.grantType = context?.grantType ?? data?.grant_type;
        if (err?.stack) {
            this.stack = err.stack;
        }
    }
}
exports.FgaApiAuthenticationError = FgaApiAuthenticationError;
/**
 *
 * @export
 * @class FgaValidationError
 * @extends { FgaError }
 */
class FgaValidationError extends FgaError {
    constructor(field, msg) {
        super(msg);
        this.field = field;
        this.name = "FgaValidationError";
    }
}
exports.FgaValidationError = FgaValidationError;
/**
 *
 * @export
 * @class FgaRequiredParamError
 * @extends { FgaValidationError }
 */
class FgaRequiredParamError extends FgaValidationError {
    constructor(functionName, field, msg) {
        super(field, msg);
        this.functionName = functionName;
        this.name = "FgaRequiredParamError";
    }
}
exports.FgaRequiredParamError = FgaRequiredParamError;
//# sourceMappingURL=errors.js.map