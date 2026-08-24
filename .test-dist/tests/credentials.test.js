"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nock_1 = __importDefault(require("nock"));
const jose = __importStar(require("jose"));
const node_test_1 = require("node:test");
const credentials_1 = require("../credentials");
const configuration_1 = require("../telemetry/configuration");
const constants_1 = __importDefault(require("../constants"));
const default_config_1 = require("./helpers/default-config");
const errors_1 = require("../errors");
const expect_1 = require("./helpers/expect");
(0, node_test_1.describe)("Credentials", () => {
    const mockTelemetryConfig = new configuration_1.TelemetryConfiguration({});
    (0, node_test_1.describe)("Refreshing access token", () => {
        (0, node_test_1.test)("should use default scheme and token endpoint path when apiTokenIssuer has no scheme and no path", async () => {
            const apiTokenIssuer = "issuer.fga.example";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedPath = `/${credentials_1.DEFAULT_TOKEN_ENDPOINT_PATH}`;
            (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .reply(200, {
                access_token: "test-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                },
            }, undefined, mockTelemetryConfig);
            await credentials.getAccessTokenHeader();
        });
        (0, node_test_1.test)("should use default token endpoint path when apiTokenIssuer has root path and no scheme", async () => {
            const apiTokenIssuer = "https://issuer.fga.example/";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedPath = `/${credentials_1.DEFAULT_TOKEN_ENDPOINT_PATH}`;
            (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .reply(200, {
                access_token: "test-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                },
            }, undefined, mockTelemetryConfig);
            await credentials.getAccessTokenHeader();
        });
        (0, node_test_1.test)("should preserve custom token endpoint path when provided", async () => {
            const apiTokenIssuer = "https://issuer.fga.example/some_endpoint";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedPath = "/some_endpoint";
            (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .reply(200, {
                access_token: "test-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                },
            }, undefined, mockTelemetryConfig);
            await credentials.getAccessTokenHeader();
        });
        (0, node_test_1.test)("should preserve custom token endpoint path with nested path when provided", async () => {
            const apiTokenIssuer = "https://issuer.fga.example/api/v1/oauth/token";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedPath = "/api/v1/oauth/token";
            (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .reply(200, {
                access_token: "test-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                },
            }, undefined, mockTelemetryConfig);
            await credentials.getAccessTokenHeader();
        });
        (0, node_test_1.test)("should add https:// prefix when apiTokenIssuer has no scheme", async () => {
            const apiTokenIssuer = "issuer.fga.example/some_endpoint";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedPath = "/some_endpoint";
            (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .reply(200, {
                access_token: "test-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                },
            }, undefined, mockTelemetryConfig);
            await credentials.getAccessTokenHeader();
        });
        (0, node_test_1.test)("should preserve http:// scheme when provided", async () => {
            const apiTokenIssuer = "http://issuer.fga.example/some_endpoint";
            const expectedBaseUrl = "http://issuer.fga.example";
            const expectedPath = "/some_endpoint";
            (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .reply(200, {
                access_token: "test-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                },
            }, undefined, mockTelemetryConfig);
            await credentials.getAccessTokenHeader();
        });
        (0, node_test_1.test)("should use default path when apiTokenIssuer has https:// scheme but no path", async () => {
            const apiTokenIssuer = "https://issuer.fga.example";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedPath = `/${credentials_1.DEFAULT_TOKEN_ENDPOINT_PATH}`;
            (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .reply(200, {
                access_token: "test-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                },
            }, undefined, mockTelemetryConfig);
            await credentials.getAccessTokenHeader();
        });
        (0, node_test_1.test)("should preserve custom path with query parameters", async () => {
            const apiTokenIssuer = "https://issuer.fga.example/some_endpoint?param=value";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedPath = "/some_endpoint";
            const queryParams = { param: "value" };
            (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .query(queryParams)
                .reply(200, {
                access_token: "test-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                },
            }, undefined, mockTelemetryConfig);
            await credentials.getAccessTokenHeader();
        });
        (0, node_test_1.test)("should preserve custom path with port number", async () => {
            const apiTokenIssuer = "https://issuer.fga.example:8080/some_endpoint";
            const expectedBaseUrl = "https://issuer.fga.example:8080";
            const expectedPath = "/some_endpoint";
            (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .reply(200, {
                access_token: "test-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                },
            }, undefined, mockTelemetryConfig);
            await credentials.getAccessTokenHeader();
        });
        (0, node_test_1.test)("should use default path when path has multiple trailing slashes", async () => {
            const apiTokenIssuer = "https://issuer.fga.example///";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedPath = `/${credentials_1.DEFAULT_TOKEN_ENDPOINT_PATH}`;
            (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .reply(200, {
                access_token: "test-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                },
            }, undefined, mockTelemetryConfig);
            await credentials.getAccessTokenHeader();
        });
        (0, node_test_1.test)("should use default path when path only consists of slashes", async () => {
            const apiTokenIssuer = "https://issuer.fga.example//";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedPath = `/${credentials_1.DEFAULT_TOKEN_ENDPOINT_PATH}`;
            (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .reply(200, {
                access_token: "test-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                },
            }, undefined, mockTelemetryConfig);
            await credentials.getAccessTokenHeader();
        });
        (0, node_test_1.test)("should preserve custom path with consecutive/trailing slashes", async () => {
            const apiTokenIssuer = "https://issuer.fga.example/oauth//token///";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedPath = "/oauth//token///";
            (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .reply(200, {
                access_token: "test-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                },
            }, undefined, mockTelemetryConfig);
            await credentials.getAccessTokenHeader();
        });
        for (const { description, apiTokenIssuer } of [
            {
                description: "malformed url",
                apiTokenIssuer: "not a valid url::::",
            },
            {
                description: "empty string",
                apiTokenIssuer: "",
            },
            {
                description: "whitespace-only issuer",
                apiTokenIssuer: "   ",
            },
        ]) {
            (0, node_test_1.test)(`should throw FgaValidationError when ${description}`, () => {
                (0, expect_1.expect)(() => new credentials_1.Credentials({
                    method: credentials_1.CredentialsMethod.ClientCredentials,
                    config: {
                        apiTokenIssuer,
                        apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                        clientId: default_config_1.OPENFGA_CLIENT_ID,
                        clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                    },
                }, undefined, mockTelemetryConfig)).toThrow(errors_1.FgaValidationError);
            });
        }
        (0, node_test_1.test)("should normalize audience from apiTokenIssuer when using PrivateKeyJWT client credentials with HTTPS scheme", async () => {
            const apiTokenIssuer = "https://issuer.fga.example/some_endpoint";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedAudience = "https://issuer.fga.example/some_endpoint/";
            (0, nock_1.default)(expectedBaseUrl)
                .post("/some_endpoint", (body) => {
                const params = new URLSearchParams(body);
                const clientAssertion = params.get("client_assertion");
                const decoded = jose.decodeJwt(clientAssertion);
                (0, expect_1.expect)(decoded.aud).toBe(`${expectedAudience}`);
                return true;
            })
                .reply(200, {
                access_token: "test-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientAssertionSigningKey: default_config_1.OPENFGA_CLIENT_ASSERTION_SIGNING_KEY,
                },
            }, undefined, mockTelemetryConfig);
            await credentials.getAccessTokenHeader();
        });
        (0, node_test_1.test)("should normalize audience from apiTokenIssuer when using PrivateKeyJWT client credentials with HTTP scheme", async () => {
            const apiTokenIssuer = "http://issuer.fga.example/some_endpoint";
            const expectedBaseUrl = "http://issuer.fga.example";
            const expectedAudience = "http://issuer.fga.example/some_endpoint/";
            (0, nock_1.default)(expectedBaseUrl)
                .post("/some_endpoint", (body) => {
                const params = new URLSearchParams(body);
                const clientAssertion = params.get("client_assertion");
                const decoded = jose.decodeJwt(clientAssertion);
                (0, expect_1.expect)(decoded.aud).toBe(`${expectedAudience}`);
                return true;
            })
                .reply(200, {
                access_token: "test-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientAssertionSigningKey: default_config_1.OPENFGA_CLIENT_ASSERTION_SIGNING_KEY,
                },
            }, undefined, mockTelemetryConfig);
            await credentials.getAccessTokenHeader();
        });
        (0, node_test_1.test)("should normalize audience from apiTokenIssuer when using PrivateKeyJWT client credentials with no scheme", async () => {
            const apiTokenIssuer = "issuer.fga.example/some_endpoint";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedAudience = "https://issuer.fga.example/some_endpoint/";
            (0, nock_1.default)(expectedBaseUrl)
                .post("/some_endpoint", (body) => {
                const params = new URLSearchParams(body);
                const clientAssertion = params.get("client_assertion");
                const decoded = jose.decodeJwt(clientAssertion);
                (0, expect_1.expect)(decoded.aud).toBe(`${expectedAudience}`);
                return true;
            })
                .reply(200, {
                access_token: "test-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientAssertionSigningKey: default_config_1.OPENFGA_CLIENT_ASSERTION_SIGNING_KEY,
                },
            }, undefined, mockTelemetryConfig);
            await credentials.getAccessTokenHeader();
        });
        (0, node_test_1.test)("should throw a real FgaApiAuthenticationError instance when token refresh fails", async () => {
            const apiTokenIssuer = "issuer.fga.example";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedPath = `/${credentials_1.DEFAULT_TOKEN_ENDPOINT_PATH}`;
            // We do this to skip the wait time between retries
            const setTimeoutSpy = node_test_1.mock.method(global, "setTimeout", ((callback) => {
                callback();
                return {};
            }));
            const scope = (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .times(4)
                .reply(500, {
                code: "internal_error",
                message: "token exchange failed",
            });
            try {
                const credentials = new credentials_1.Credentials({
                    method: credentials_1.CredentialsMethod.ClientCredentials,
                    config: {
                        apiTokenIssuer,
                        apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                        clientId: default_config_1.OPENFGA_CLIENT_ID,
                        clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                    },
                }, undefined, mockTelemetryConfig);
                let error;
                try {
                    await credentials.getAccessTokenHeader();
                }
                catch (err) {
                    error = err;
                }
                (0, expect_1.expect)(error).toBeInstanceOf(errors_1.FgaApiAuthenticationError);
                const authenticationError = error;
                (0, expect_1.expect)(authenticationError.statusCode).toBe(500);
                (0, expect_1.expect)(authenticationError.clientId).toBe(default_config_1.OPENFGA_CLIENT_ID);
                (0, expect_1.expect)(authenticationError.audience).toBe(default_config_1.OPENFGA_API_AUDIENCE);
                (0, expect_1.expect)(authenticationError.grantType).toBe(credentials_1.CredentialsMethod.ClientCredentials);
                (0, expect_1.expect)(scope.isDone()).toBe(true);
            }
            finally {
                setTimeoutSpy.mock.restore();
            }
        });
        (0, node_test_1.test)("should preserve auth context when token endpoint returns 401", async () => {
            const apiTokenIssuer = "issuer.fga.example";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedPath = `/${credentials_1.DEFAULT_TOKEN_ENDPOINT_PATH}`;
            const scope = (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .reply(401, {
                code: "unauthorized",
                message: "invalid client credentials",
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                },
            }, undefined, mockTelemetryConfig);
            let error;
            try {
                await credentials.getAccessTokenHeader();
            }
            catch (err) {
                error = err;
            }
            (0, expect_1.expect)(error).toBeInstanceOf(errors_1.FgaApiAuthenticationError);
            const authenticationError = error;
            (0, expect_1.expect)(authenticationError.statusCode).toBe(401);
            (0, expect_1.expect)(authenticationError.clientId).toBe(default_config_1.OPENFGA_CLIENT_ID);
            (0, expect_1.expect)(authenticationError.audience).toBe(default_config_1.OPENFGA_API_AUDIENCE);
            (0, expect_1.expect)(authenticationError.grantType).toBe(credentials_1.CredentialsMethod.ClientCredentials);
            (0, expect_1.expect)(scope.isDone()).toBe(true);
        });
        (0, node_test_1.test)("should send a single token request for concurrent access token reads", async () => {
            const apiTokenIssuer = "issuer.fga.example";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedPath = `/${credentials_1.DEFAULT_TOKEN_ENDPOINT_PATH}`;
            (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .once()
                .delay(20)
                .reply(200, {
                access_token: "shared-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                },
            }, undefined, mockTelemetryConfig);
            const headers = await Promise.all(Array.from({ length: 5 }, () => credentials.getAccessTokenHeader()));
            headers.forEach(header => {
                (0, expect_1.expect)(header?.value).toBe("Bearer shared-token");
            });
        });
        (0, node_test_1.test)("should clear shared refresh promise after failure and retry on the next call", async () => {
            const apiTokenIssuer = "issuer.fga.example";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedPath = `/${credentials_1.DEFAULT_TOKEN_ENDPOINT_PATH}`;
            (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .once()
                .reply(404, {
                code: "not_found",
                message: "token exchange failed",
            })
                .post(expectedPath)
                .once()
                .reply(200, {
                access_token: "recovered-token",
                expires_in: 300,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                },
            }, undefined, mockTelemetryConfig);
            const results = await Promise.allSettled(Array.from({ length: 5 }, () => credentials.getAccessTokenHeader()));
            const rejected = results.filter((result) => result.status === "rejected");
            (0, expect_1.expect)(rejected).toHaveLength(5);
            (0, expect_1.expect)(rejected[0].reason).toBe(rejected[1].reason);
            (0, expect_1.expect)(rejected[1].reason).toBe(rejected[2].reason);
            (0, expect_1.expect)(rejected[2].reason).toBe(rejected[3].reason);
            (0, expect_1.expect)(rejected[3].reason).toBe(rejected[4].reason);
            const header = await credentials.getAccessTokenHeader();
            (0, expect_1.expect)(header?.value).toBe("Bearer recovered-token");
        });
        (0, node_test_1.test)("should refresh cached token when it is close to expiration", async () => {
            const apiTokenIssuer = "issuer.fga.example";
            const expectedBaseUrl = "https://issuer.fga.example";
            const expectedPath = `/${credentials_1.DEFAULT_TOKEN_ENDPOINT_PATH}`;
            const randomSpy = node_test_1.mock.method(Math, "random", () => 0);
            const shortLivedTokenInSec = Math.max(1, constants_1.default.TokenExpiryThresholdBufferInSec - 1);
            (0, nock_1.default)(expectedBaseUrl)
                .post(expectedPath)
                .reply(200, {
                access_token: "short-lived-token",
                expires_in: shortLivedTokenInSec,
            })
                .post(expectedPath)
                .reply(200, {
                access_token: "refreshed-token",
                expires_in: 3600,
            });
            const credentials = new credentials_1.Credentials({
                method: credentials_1.CredentialsMethod.ClientCredentials,
                config: {
                    apiTokenIssuer,
                    apiAudience: default_config_1.OPENFGA_API_AUDIENCE,
                    clientId: default_config_1.OPENFGA_CLIENT_ID,
                    clientSecret: default_config_1.OPENFGA_CLIENT_SECRET,
                },
            }, undefined, mockTelemetryConfig);
            try {
                const header1 = await credentials.getAccessTokenHeader();
                const header2 = await credentials.getAccessTokenHeader();
                (0, expect_1.expect)(header1?.value).toBe("Bearer short-lived-token");
                (0, expect_1.expect)(header2?.value).toBe("Bearer refreshed-token");
            }
            finally {
                randomSpy.mock.restore();
            }
        });
    });
});
//# sourceMappingURL=credentials.test.js.map