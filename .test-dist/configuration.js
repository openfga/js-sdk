"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
exports.GetDefaultRetryParams = GetDefaultRetryParams;
const types_1 = require("./credentials/types");
const errors_1 = require("./errors");
const validation_1 = require("./validation");
const configuration_1 = require("./telemetry/configuration");
const constants_1 = __importDefault(require("./constants"));
// default maximum number of retry
const DEFAULT_MAX_RETRY = constants_1.default.DefaultMaxRetry;
// default minimum wait period in retry - but will backoff exponentially
const DEFAULT_MIN_WAIT_MS = constants_1.default.DefaultMinWaitInMs;
const DEFAULT_USER_AGENT = constants_1.default.UserAgent;
function GetDefaultRetryParams(maxRetry = DEFAULT_MAX_RETRY, minWaitInMs = DEFAULT_MIN_WAIT_MS) {
    return {
        maxRetry: maxRetry,
        minWaitInMs: minWaitInMs,
    };
}
class Configuration {
    constructor(params = {}) {
        /**
         * provide scheme (e.g. `https`)
         *
         * @type {string}
         * @memberof Configuration
         * @deprecated
         */
        this.apiScheme = "https";
        /**
         * Returns the API base path (apiScheme+apiHost)
         */
        this.getBasePath = () => {
            if (this.apiUrl) {
                return this.apiUrl;
            }
            else {
                return `${this.apiScheme}://${this.apiHost}`;
            }
        };
        this.apiScheme = params.apiScheme || this.apiScheme;
        this.apiHost = params.apiHost;
        this.apiUrl = params.apiUrl;
        const credentialParams = params.credentials;
        if (credentialParams) {
            switch (credentialParams?.method) {
                case types_1.CredentialsMethod.ApiToken:
                    this.credentials = {
                        method: credentialParams.method,
                        config: {
                            token: credentialParams.config.token,
                            headerName: "Authorization",
                            headerValuePrefix: "Bearer",
                        }
                    };
                    break;
                case types_1.CredentialsMethod.ClientCredentials:
                    this.credentials = {
                        method: types_1.CredentialsMethod.ClientCredentials,
                        config: credentialParams.config
                    };
                    break;
                case types_1.CredentialsMethod.None:
                default:
                    this.credentials = { method: types_1.CredentialsMethod.None };
                    break;
            }
        }
        const baseOptions = params.baseOptions || {};
        baseOptions.headers = baseOptions.headers || {};
        if (typeof process === "object" && process.versions?.node && !baseOptions.headers["User-Agent"]) {
            baseOptions.headers["User-Agent"] = DEFAULT_USER_AGENT;
        }
        this.baseOptions = baseOptions;
        this.retryParams = Object.assign(GetDefaultRetryParams(), params.retryParams);
        this.telemetry = new configuration_1.TelemetryConfiguration(params?.telemetry?.metrics);
    }
    /**
     *
     * @return {boolean}
     * @throws {FgaValidationError}
     */
    isValid() {
        if (!this.apiUrl && !this.apiHost) {
            (0, validation_1.assertParamExists)("Configuration", "apiUrl", this.apiUrl);
        }
        if (!(0, validation_1.isWellFormedUriString)(this.getBasePath())) {
            throw new errors_1.FgaValidationError(this.apiUrl ?
                `Configuration.apiUrl (${this.apiUrl}) is not a valid URI (${this.getBasePath()})` :
                `Configuration.apiScheme (${this.apiScheme}) and Configuration.apiHost (${this.apiHost}) do not form a valid URI (${this.getBasePath()})`);
        }
        if (this.retryParams?.maxRetry && this.retryParams.maxRetry > constants_1.default.RetryMaxAllowedNumber) {
            throw new errors_1.FgaValidationError("Configuration.retryParams.maxRetry exceeds maximum allowed limit of 15");
        }
        this.telemetry.ensureValid();
        return true;
    }
}
exports.Configuration = Configuration;
/**
 * Defines the version of the SDK
 *
 * @private
 * @type {string}
 * @memberof Configuration
 */
Configuration.sdkVersion = constants_1.default.SdkVersion;
//# sourceMappingURL=configuration.js.map