"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nock_1 = __importDefault(require("nock"));
const node_test_1 = require("node:test");
const index_1 = require("../index");
const configuration_1 = require("../configuration");
const default_config_1 = require("./helpers/default-config");
const nocks_1 = require("./helpers/nocks");
const expect_1 = require("./helpers/expect");
const nocks = (0, nocks_1.getNocks)(nock_1.default);
(0, node_test_1.describe)("OpenFGA SDK", function () {
    (0, node_test_1.describe)("initializing the sdk", () => {
        (0, node_test_1.it)("should not require storeId in configuration", () => {
            (0, expect_1.expect)(() => new index_1.OpenFgaApi({ ...default_config_1.baseConfig, storeId: undefined })).not.toThrow();
        });
        (0, node_test_1.it)("should require host in configuration", () => {
            (0, expect_1.expect)(() => new index_1.OpenFgaApi({ ...default_config_1.baseConfig, apiUrl: undefined })).toThrow();
        });
        (0, node_test_1.it)("should validate host in configuration (adding scheme as part of the host)", () => {
            (0, expect_1.expect)(() => new index_1.OpenFgaApi({ ...default_config_1.baseConfig, apiUrl: "//api.fga.example" })).toThrow();
        });
        (0, node_test_1.it)("should allow using apiHost if apiUrl is not provided", () => {
            (0, expect_1.expect)(() => new index_1.OpenFgaApi({ ...default_config_1.baseConfig, apiHost: "api.fga.example" })).not.toThrow();
        });
        (0, node_test_1.it)("should still validate apiHost", () => {
            (0, expect_1.expect)(() => new index_1.OpenFgaApi({ ...default_config_1.baseConfig, apiHost: "//api.fga.example" })).not.toThrow();
        });
        for (const scheme of ["https://", "http://", ""]) {
            (0, node_test_1.it)(`should allow valid schemes or default when scheme is missing (${scheme})`, () => {
                (0, expect_1.expect)(() => new index_1.OpenFgaApi({
                    ...default_config_1.baseConfig,
                    credentials: {
                        method: index_1.CredentialsMethod.ClientCredentials,
                        config: {
                            ...default_config_1.baseConfig.credentials.config,
                            apiTokenIssuer: `${scheme}tokenissuer.fga.example`
                        }
                    }
                })).not.toThrow();
            });
        }
        for (const scheme of ["tcp://", "grpc://", "file://"]) {
            (0, node_test_1.it)(`should not allow invalid schemes as part of the apiTokenIssuer in configuration (${scheme})`, () => {
                (0, expect_1.expect)(() => new index_1.OpenFgaApi({
                    ...default_config_1.baseConfig,
                    credentials: {
                        method: index_1.CredentialsMethod.ClientCredentials,
                        config: {
                            ...default_config_1.baseConfig.credentials.config,
                            apiTokenIssuer: `${scheme}tokenissuer.fga.example`
                        }
                    }
                })).toThrow();
            });
        }
        (0, node_test_1.it)("should not require credentials in configuration when not needed", () => {
            (0, expect_1.expect)(() => new index_1.OpenFgaApi({
                apiUrl: default_config_1.baseConfig.apiUrl,
            })).not.toThrow();
        });
        (0, node_test_1.it)("should require apiToken credentials in configuration in api_token flow", () => {
            (0, expect_1.expect)(() => new index_1.OpenFgaApi({
                apiUrl: default_config_1.baseConfig.apiUrl,
                credentials: {
                    method: index_1.CredentialsMethod.ApiToken
                }
            })).toThrow();
        });
        (0, node_test_1.it)("should require clientId, clientSecret, apiTokenIssuer and apiAudience credentials in configuration in client_credentials flow", () => {
            (0, expect_1.expect)(() => new index_1.OpenFgaApi({
                ...default_config_1.baseConfig,
                credentials: {
                    method: index_1.CredentialsMethod.ClientCredentials,
                },
            })).toThrow("config.clientId");
            (0, expect_1.expect)(() => new index_1.OpenFgaApi({
                ...default_config_1.baseConfig,
                credentials: {
                    method: index_1.CredentialsMethod.ClientCredentials,
                    config: {
                        ...default_config_1.baseConfig.credentials.config,
                        clientId: undefined
                    }
                }
            })).toThrow("config.clientId");
            (0, expect_1.expect)(() => new index_1.OpenFgaApi({
                ...default_config_1.baseConfig,
                credentials: {
                    method: index_1.CredentialsMethod.ClientCredentials,
                    config: {
                        ...default_config_1.baseConfig.credentials.config,
                        clientSecret: undefined
                    }
                }
            })).toThrow("config.clientSecret or config.clientAssertionSigningKey");
            (0, expect_1.expect)(() => new index_1.OpenFgaApi({
                ...default_config_1.baseConfig,
                credentials: {
                    method: index_1.CredentialsMethod.ClientCredentials,
                    config: {
                        ...default_config_1.baseConfig.credentials.config,
                        clientSecret: undefined,
                        clientAssertionSigningKey: undefined
                    }
                }
            })).toThrow("config.clientSecret or config.clientAssertionSigningKey");
            (0, expect_1.expect)(() => new index_1.OpenFgaApi({
                ...default_config_1.baseConfig,
                credentials: {
                    method: index_1.CredentialsMethod.ClientCredentials,
                    config: {
                        ...default_config_1.baseConfig.credentials.config,
                        apiAudience: undefined
                    }
                }
            })).toThrow("config.apiAudience");
            (0, expect_1.expect)(() => new index_1.OpenFgaApi({
                ...default_config_1.baseConfig,
                credentials: {
                    method: index_1.CredentialsMethod.ClientCredentials,
                    config: {
                        ...default_config_1.baseConfig.credentials.config,
                        apiTokenIssuer: undefined
                    }
                }
            })).toThrow("config.apiTokenIssuer");
        });
        (0, node_test_1.it)("should issue a network call to get the token at the first request if client id is provided", async () => {
            nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER);
            nocks.readAuthorizationModels(default_config_1.baseConfig.storeId);
            const fgaApi = new index_1.OpenFgaApi(default_config_1.baseConfig);
            await fgaApi.readAuthorizationModels(default_config_1.baseConfig.storeId);
        });
        (0, node_test_1.it)("should cache the bearer token and not issue a network call to get the token at the second request", async () => {
            // Use a long-lived token so this test validates caching behavior
            // independently from proactive near-expiry refresh logic.
            let scope = nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER, "test-token", 3600);
            nocks.readAuthorizationModels(default_config_1.baseConfig.storeId);
            const fgaApi = new index_1.OpenFgaApi(default_config_1.baseConfig);
            (0, expect_1.expect)(scope.isDone()).toBe(false);
            await fgaApi.readAuthorizationModels(default_config_1.baseConfig.storeId);
            (0, expect_1.expect)(scope.isDone()).toBe(true);
            scope = nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER);
            nocks.readAuthorizationModels(default_config_1.baseConfig.storeId);
            (0, expect_1.expect)(scope.isDone()).toBe(false);
            await fgaApi.readAuthorizationModels(default_config_1.baseConfig.storeId);
            (0, expect_1.expect)(scope.isDone()).toBe(false);
            // NOTE: manually clean pending mocks as we assert on _not_ being matched above.
            nock_1.default.cleanAll();
        });
        (0, node_test_1.it)("should retry a failed attempt to request to exchange the credentials", async () => {
            nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER, "test-token", 300, 500, {
                "Retry-After": "1" // Add Retry-After header
            });
            nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER);
            nocks.readAuthorizationModels(default_config_1.baseConfig.storeId);
            const fgaApi = new index_1.OpenFgaApi(default_config_1.baseConfig);
            await fgaApi.readAuthorizationModels(default_config_1.baseConfig.storeId);
        });
        (0, node_test_1.it)("should not issue a network call to get the token at the first request if the clientId is not provided", async () => {
            const scope = nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER);
            nocks.readAuthorizationModels(default_config_1.baseConfig.storeId);
            const fgaApi = new index_1.OpenFgaApi({
                apiUrl: default_config_1.baseConfig.apiUrl,
            });
            (0, expect_1.expect)(scope.isDone()).toBe(false);
            await fgaApi.readAuthorizationModels(default_config_1.baseConfig.storeId);
            (0, expect_1.expect)(scope.isDone()).toBe(false);
            // NOTE: manually clean pending mocks as we assert on _not_ being matched above.
            nock_1.default.cleanAll();
        });
        (0, node_test_1.it)("should issue a network call to get the token at the first request if client assertion is provided", async () => {
            nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER);
            nocks.readAuthorizationModels(default_config_1.baseConfig.storeId);
            const fgaApi = new index_1.OpenFgaApi({
                ...default_config_1.baseConfig,
                credentials: {
                    method: index_1.CredentialsMethod.ClientCredentials,
                    config: {
                        ...default_config_1.baseConfig.credentials.config,
                        clientAssertionSigningKey: default_config_1.OPENFGA_CLIENT_ASSERTION_SIGNING_KEY
                    }
                }
            });
            await fgaApi.readAuthorizationModels(default_config_1.baseConfig.storeId);
        });
        (0, node_test_1.it)("should allow passing in a configuration instance", async () => {
            const configuration = new index_1.Configuration(default_config_1.baseConfig);
            (0, expect_1.expect)(() => new index_1.OpenFgaApi(configuration)).not.toThrow();
        });
        (0, node_test_1.it)("should only accept valid telemetry attributes", async () => {
            (0, expect_1.expect)(() => new index_1.OpenFgaApi({
                ...default_config_1.baseConfig,
                telemetry: {
                    metrics: {
                        counterCredentialsRequest: {
                            attributes: ["JUNK"]
                        },
                        histogramQueryDuration: {
                            attributes: new Set
                        },
                        histogramRequestDuration: {
                            attributes: new Set
                        }
                    }
                }
            })).toThrow();
        });
    });
    (0, node_test_1.describe)("error handling", () => {
        let fgaApi;
        const { storeId } = default_config_1.baseConfig;
        const basePath = default_config_1.defaultConfiguration.getBasePath();
        const requestId = "1F2A3B";
        (0, node_test_1.before)(() => {
            fgaApi = new index_1.OpenFgaApi({ ...default_config_1.baseConfig });
        });
        (0, node_test_1.describe)("400 level error should result in FgaApiValidationError", () => {
            const tupleKey = {
                user: "user:xyz",
                relation: "viewer",
                object: "foobar:x",
            };
            (0, node_test_1.beforeEach)(async () => {
                nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER, "test-token");
                (0, nock_1.default)(basePath)
                    .defaultReplyHeaders({
                    "Fga-Request-Id": requestId,
                    "Content-Type": "application/json",
                })
                    .post(`/stores/${storeId}/check`, {
                    tuple_key: tupleKey,
                }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                    .reply(400, {
                    code: "validation_error",
                    message: "nock error",
                });
            });
            (0, node_test_1.it)("should throw FgaApiValidationError", async () => {
                await (0, expect_1.expect)(fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey })).rejects.toThrow(index_1.FgaApiValidationError);
            });
            (0, node_test_1.it)("FgaApiValidationError should have correct fields", async () => {
                try {
                    await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey });
                }
                catch (err) {
                    (0, expect_1.expect)(err).toBeInstanceOf(index_1.FgaApiValidationError);
                    if (err instanceof index_1.FgaApiValidationError) {
                        (0, expect_1.expect)(err.apiErrorCode).toBe(index_1.ErrorCode.ValidationError);
                        (0, expect_1.expect)(err.storeId).toBe(storeId);
                        (0, expect_1.expect)(err.endpointCategory).toBe("check");
                        (0, expect_1.expect)(err.requestId).toBe(requestId);
                    }
                }
            });
        });
        (0, node_test_1.describe)("429 level error should result in FgaApiRateLimitExceededError", () => {
            const tupleKey = {
                user: "user:xyz",
                relation: "viewer",
                object: "foobar:x",
            };
            (0, node_test_1.beforeEach)(async () => {
                const updateBaseConfig = {
                    ...default_config_1.baseConfig,
                    retryParams: (0, configuration_1.GetDefaultRetryParams)(2, 10),
                };
                fgaApi = new index_1.OpenFgaApi({ ...updateBaseConfig });
                nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER, "test-token");
                (0, nock_1.default)(basePath)
                    .post(`/stores/${storeId}/check`, {
                    tuple_key: tupleKey,
                }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                    .times(3)
                    .reply(429, {
                    code: "rate_limit_exceeded",
                    message: "nock error",
                });
            });
            (0, node_test_1.it)("should throw FgaApiRateLimitExceededError", async () => {
                await (0, expect_1.expect)(fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey }, {})).rejects.toThrow(index_1.FgaApiRateLimitExceededError);
            });
        });
        (0, node_test_1.describe)("429 with default retry config is successful", () => {
            const tupleKey = {
                user: "user:xyz",
                relation: "viewer",
                object: "foobar:x",
            };
            (0, node_test_1.beforeEach)(async () => {
                fgaApi = new index_1.OpenFgaApi({ ...default_config_1.baseConfig });
                nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER, "test-token");
                (0, nock_1.default)(basePath)
                    .post(`/stores/${storeId}/check`, {
                    tuple_key: tupleKey,
                    authorization_model_id: "01GXSA8YR785C4FYS3C0RTG7B1"
                }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                    .times(1)
                    .reply(429, {
                    code: "rate_limit_exceeded",
                    message: "nock error",
                });
                nocks.check(default_config_1.baseConfig.storeId, tupleKey);
            });
            (0, node_test_1.it)("should return allowed", async () => {
                const result = await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey, authorization_model_id: "01GXSA8YR785C4FYS3C0RTG7B1" }, {});
                (0, expect_1.expect)(result.allowed).toBe(true);
            });
        });
        (0, node_test_1.describe)("429 with retry in config and retry is successful", () => {
            const tupleKey = {
                user: "user:xyz",
                relation: "viewer",
                object: "foobar:x",
            };
            (0, node_test_1.beforeEach)(async () => {
                const updateBaseConfig = {
                    ...default_config_1.baseConfig,
                    retryParams: (0, configuration_1.GetDefaultRetryParams)(2, 10),
                };
                fgaApi = new index_1.OpenFgaApi({ ...updateBaseConfig });
                nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER, "test-token");
                (0, nock_1.default)(basePath)
                    .post(`/stores/${storeId}/check`, {
                    tuple_key: tupleKey,
                    authorization_model_id: "01GXSA8YR785C4FYS3C0RTG7B1"
                }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                    .times(1)
                    .reply(429, {
                    code: "rate_limit_exceeded",
                    message: "nock error",
                });
                nocks.check(default_config_1.baseConfig.storeId, tupleKey);
            });
            (0, node_test_1.it)("should return allowed", async () => {
                const result = await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey, authorization_model_id: "01GXSA8YR785C4FYS3C0RTG7B1" }, {});
                (0, expect_1.expect)(result.allowed).toBe(true);
            });
        });
        (0, node_test_1.describe)("429 with retry in call and retry is successful", () => {
            const tupleKey = {
                user: "user:xyz",
                relation: "viewer",
                object: "foobar:x",
            };
            (0, node_test_1.beforeEach)(async () => {
                nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER, "test-token");
                (0, nock_1.default)(basePath)
                    .post(`/stores/${storeId}/check`, {
                    tuple_key: tupleKey,
                }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                    .times(1)
                    .reply(429, {
                    code: "rate_limit_exceeded",
                    message: "nock error",
                });
                nocks.check(default_config_1.baseConfig.storeId, tupleKey);
            });
            (0, node_test_1.it)("should return allowed", async () => {
                const result = await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey }, { retryParams: (0, configuration_1.GetDefaultRetryParams)(2, 10) });
                (0, expect_1.expect)(result.allowed).toBe(true);
            });
        });
        (0, node_test_1.describe)("500 level error should result in FgaApiInternalError", () => {
            const tupleKey = {
                user: "user:xyz",
                relation: "viewer",
                object: "foobar:x",
            };
            (0, node_test_1.beforeEach)(async () => {
                nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER, "test-token");
            });
            (0, node_test_1.it)("should throw FgaApiInternalError if retries disabled", async () => {
                (0, nock_1.default)(basePath)
                    .post(`/stores/${storeId}/check`, {
                    tuple_key: tupleKey,
                }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                    .reply(500, {
                    code: "internal_error",
                    message: "nock error",
                });
                await (0, expect_1.expect)(fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey }, { retryParams: { maxRetry: 0 } })).rejects.toThrow(index_1.FgaApiInternalError);
            });
            (0, node_test_1.it)("should retry 500 error without Retry-After header using exponential backoff", async () => {
                const updateBaseConfig = {
                    ...default_config_1.baseConfig,
                    retryParams: (0, configuration_1.GetDefaultRetryParams)(2, 10),
                };
                const fgaApiWithRetry = new index_1.OpenFgaApi({ ...updateBaseConfig });
                (0, nock_1.default)(basePath)
                    .post(`/stores/${storeId}/check`, {
                    tuple_key: tupleKey,
                }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                    .reply(500, {
                    code: "internal_error",
                    message: "nock error",
                });
                (0, nock_1.default)(basePath)
                    .post(`/stores/${storeId}/check`, {
                    tuple_key: tupleKey,
                }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                    .reply(200, {
                    allowed: true,
                });
                const response = await fgaApiWithRetry.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey });
                (0, expect_1.expect)(response.allowed).toBe(true);
            });
            (0, node_test_1.it)("should not throw FgaApiInternalError with default retries", async () => {
                (0, nock_1.default)(basePath)
                    .post(`/stores/${storeId}/check`, {
                    tuple_key: tupleKey,
                }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                    .reply(500, {
                    code: "internal_error",
                    message: "nock error",
                }, {
                    "Retry-After": "1"
                });
                (0, nock_1.default)(basePath)
                    .post(`/stores/${storeId}/check`, {
                    tuple_key: tupleKey,
                }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                    .reply(200, {
                    allowed: true,
                });
                const response = await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey });
                (0, expect_1.expect)(response.allowed).toBe(true);
            });
        });
        (0, node_test_1.describe)("404 level error should result in FgaApiNotFoundError", () => {
            const tupleKey = {
                user: "user:xyz",
                relation: "viewer",
                object: "foobar:x",
            };
            (0, node_test_1.beforeEach)(async () => {
                nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER, "test-token");
                (0, nock_1.default)(basePath)
                    .post(`/stores/${storeId}/check`, {
                    tuple_key: tupleKey,
                }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                    .reply(404, {
                    code: "undefined_endpoint",
                    message: "nock error",
                });
            });
            (0, node_test_1.it)("should throw FgaApiNotFoundError", async () => {
                await (0, expect_1.expect)(fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey })).rejects.toThrow(index_1.FgaApiNotFoundError);
            });
        });
        (0, node_test_1.describe)("401 during authentication should result in FgaApiAuthenticationError", () => {
            const tupleKey = {
                user: "user:xyz",
                relation: "viewer",
                object: "foobar:x",
            };
            (0, node_test_1.beforeEach)(async () => {
                (0, nock_1.default)(`https://${default_config_1.OPENFGA_API_TOKEN_ISSUER}`)
                    .post("/oauth/token")
                    .reply(401);
            });
            (0, node_test_1.it)("should throw FgaApiAuthenticationError", async () => {
                fgaApi = new index_1.OpenFgaApi({ ...default_config_1.baseConfig });
                await (0, expect_1.expect)(fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey })).rejects.toThrow(index_1.FgaApiAuthenticationError);
            });
        });
        (0, node_test_1.describe)("non-Axios errors should be thrown immediately without retry", () => {
            (0, node_test_1.it)("should throw FgaError immediately for non-Axios errors", async () => {
                const tupleKey = {
                    user: "user:xyz",
                    relation: "viewer",
                    object: "foobar:x",
                };
                fgaApi = new index_1.OpenFgaApi({
                    ...default_config_1.baseConfig,
                    retryParams: (0, configuration_1.GetDefaultRetryParams)(3, 10)
                });
                nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER, "test-token");
                // Mock axios to throw a non-Axios error
                const originalAxios = fgaApi.axios;
                let callCount = 0;
                fgaApi.axios = async () => {
                    callCount++;
                    const nonAxiosError = new Error("Non-Axios error");
                    throw nonAxiosError;
                };
                await (0, expect_1.expect)(fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey })).rejects.toThrow("Non-Axios error");
                // Should not retry - only called once
                (0, expect_1.expect)(callCount).toBe(1);
                // Restore original axios
                fgaApi.axios = originalAxios;
            });
        });
        (0, node_test_1.describe)("retry logic with maxRetry=1 should allow exactly 1 retry", () => {
            const tupleKey = {
                user: "user:xyz",
                relation: "viewer",
                object: "foobar:x",
            };
            (0, node_test_1.beforeEach)(async () => {
                const updateBaseConfig = {
                    ...default_config_1.baseConfig,
                    retryParams: (0, configuration_1.GetDefaultRetryParams)(1, 10),
                };
                fgaApi = new index_1.OpenFgaApi({ ...updateBaseConfig });
                nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER, "test-token");
            });
            (0, node_test_1.it)("should retry once (2 total attempts) when maxRetry=1 for 500 error", async () => {
                // First attempt fails with 500
                (0, nock_1.default)(basePath)
                    .post(`/stores/${storeId}/check`, {
                    tuple_key: tupleKey,
                }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                    .reply(500, {
                    code: "internal_error",
                    message: "nock error",
                });
                // Second attempt (first retry) succeeds
                (0, nock_1.default)(basePath)
                    .post(`/stores/${storeId}/check`, {
                    tuple_key: tupleKey,
                }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                    .reply(200, {
                    allowed: true,
                });
                const response = await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey });
                (0, expect_1.expect)(response.allowed).toBe(true);
            });
            (0, node_test_1.it)("should fail after 2 total attempts when maxRetry=1 and all fail", async () => {
                // Both attempts fail
                (0, nock_1.default)(basePath)
                    .post(`/stores/${storeId}/check`, {
                    tuple_key: tupleKey,
                }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                    .times(2)
                    .reply(500, {
                    code: "internal_error",
                    message: "nock error",
                });
                await (0, expect_1.expect)(fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey })).rejects.toThrow(index_1.FgaApiInternalError);
            });
            (0, node_test_1.it)("should retry once (2 total attempts) when maxRetry=1 for 429 error", async () => {
                // First attempt fails with 429
                (0, nock_1.default)(basePath)
                    .post(`/stores/${storeId}/check`, {
                    tuple_key: tupleKey,
                }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                    .reply(429, {
                    code: "rate_limit_exceeded",
                    message: "nock error",
                });
                // Second attempt (first retry) succeeds
                (0, nock_1.default)(basePath)
                    .post(`/stores/${storeId}/check`, {
                    tuple_key: tupleKey,
                }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                    .reply(200, {
                    allowed: true,
                });
                const response = await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey });
                (0, expect_1.expect)(response.allowed).toBe(true);
            });
        });
    });
    (0, node_test_1.describe)("error handling for token exchange", () => {
        let fgaApi;
        const tupleKey = {
            user: "user:xyz",
            relation: "viewer",
            object: "foobar:x",
        };
        (0, node_test_1.beforeEach)(() => {
            fgaApi = new index_1.OpenFgaApi({ ...default_config_1.baseConfig });
        });
        (0, node_test_1.it)("should handle non-401 errors during token exchange", async () => {
            (0, nock_1.default)(`https://${default_config_1.OPENFGA_API_TOKEN_ISSUER}`)
                .post("/oauth/token")
                .reply(500, { error: "server_error" });
            await (0, expect_1.expect)(fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey })).rejects.toThrow(index_1.FgaError);
        });
        (0, node_test_1.it)("should handle network errors during token exchange", async () => {
            // Mock a network error during token exchange
            (0, nock_1.default)(`https://${default_config_1.OPENFGA_API_TOKEN_ISSUER}`)
                .post("/oauth/token")
                .replyWithError("Network error");
            await (0, expect_1.expect)(fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey })).rejects.toThrow();
        });
    });
    (0, node_test_1.describe)("retry behavior with Retry-After header", () => {
        let fgaApi;
        const tupleKey = {
            user: "user:xyz",
            relation: "viewer",
            object: "foobar:x",
        };
        const basePath = default_config_1.defaultConfiguration.getBasePath();
        const { storeId } = default_config_1.baseConfig;
        (0, node_test_1.beforeEach)(() => {
            const updateBaseConfig = {
                ...default_config_1.baseConfig,
                retryParams: (0, configuration_1.GetDefaultRetryParams)(2, 100), // Use 100ms for faster tests
            };
            fgaApi = new index_1.OpenFgaApi({ ...updateBaseConfig });
            nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER, "test-token");
        });
        (0, node_test_1.it)("should use exponential backoff when Retry-After header is missing", async () => {
            // First request fails with 429, no Retry-After header
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(429, {
                code: "rate_limit_exceeded",
                message: "rate limited",
            });
            // Second request succeeds
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(200, { allowed: true });
            const result = await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey });
            (0, expect_1.expect)(result.allowed).toBe(true);
        });
        (0, node_test_1.it)("should use valid Retry-After header (integer seconds)", async () => {
            // First request fails with 429, valid Retry-After header (2 seconds)
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(429, {
                code: "rate_limit_exceeded",
                message: "rate limited",
            }, {
                "Retry-After": "2"
            });
            // Second request succeeds
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(200, { allowed: true });
            const startTime = Date.now();
            const result = await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey });
            const elapsedTime = Date.now() - startTime;
            (0, expect_1.expect)(result.allowed).toBe(true);
        });
        (0, node_test_1.it)("should use valid Retry-After header (HTTP date)", async () => {
            const retryAfterDate = new Date(Date.now() + 2000); // 2 seconds from now
            // First request fails with 429, valid Retry-After header (HTTP date)
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(429, {
                code: "rate_limit_exceeded",
                message: "rate limited",
            }, {
                "Retry-After": retryAfterDate.toUTCString()
            });
            // Second request succeeds
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(200, { allowed: true });
            const startTime = Date.now();
            const result = await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey });
            const elapsedTime = Date.now() - startTime;
            (0, expect_1.expect)(result.allowed).toBe(true);
            (0, expect_1.expect)(elapsedTime).toBeLessThan(2500);
        });
        (0, node_test_1.it)("should handle invalid Retry-After header format and fallback to exponential backoff", async () => {
            // First request fails with 429, invalid Retry-After header
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(429, {
                code: "rate_limit_exceeded",
                message: "rate limited",
            }, {
                "Retry-After": "not-a-number"
            });
            // Second request succeeds
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(200, { allowed: true });
            const result = await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey });
            (0, expect_1.expect)(result.allowed).toBe(true);
        });
        (0, node_test_1.it)("should reject Retry-After header exceeding 30 minutes and fallback to exponential backoff", async () => {
            // First request fails with 429, Retry-After exceeds max (30 minutes = 1800 seconds)
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(429, {
                code: "rate_limit_exceeded",
                message: "rate limited",
            }, {
                "Retry-After": "2000" // 2000 seconds > 1800 seconds (30 min)
            });
            // Second request succeeds
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(200, { allowed: true });
            const startTime = Date.now();
            const result = await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey });
            const elapsedTime = Date.now() - startTime;
            (0, expect_1.expect)(result.allowed).toBe(true);
            // Should fallback to exponential backoff, not wait 2000 seconds
            (0, expect_1.expect)(elapsedTime).toBeLessThan(5000);
        });
        (0, node_test_1.it)("should reject Retry-After header less than 1 second and fallback to exponential backoff", async () => {
            // First request fails with 429, Retry-After less than minimum (1 second)
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(429, {
                code: "rate_limit_exceeded",
                message: "rate limited",
            }, {
                "Retry-After": "0" // 0 seconds < 1 second minimum
            });
            // Second request succeeds
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(200, { allowed: true });
            const startTime = Date.now();
            const result = await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey });
            const elapsedTime = Date.now() - startTime;
            (0, expect_1.expect)(result.allowed).toBe(true);
            // Should fallback to exponential backoff with configured minWaitInMs
            (0, expect_1.expect)(elapsedTime).toBeGreaterThan(0);
            (0, expect_1.expect)(elapsedTime).toBeLessThan(5000);
        });
        (0, node_test_1.it)("should use Retry-After header for 500 errors when present", async () => {
            // First request fails with 500, valid Retry-After header
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(500, {
                code: "internal_error",
                message: "internal error",
            }, {
                "Retry-After": "2"
            });
            // Second request succeeds
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(200, { allowed: true });
            const startTime = Date.now();
            const result = await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey });
            const elapsedTime = Date.now() - startTime;
            (0, expect_1.expect)(result.allowed).toBe(true);
            // Should wait approximately 2 seconds
            (0, expect_1.expect)(elapsedTime).toBeLessThan(2500);
        });
        (0, node_test_1.it)("should fallback to exponential backoff for 500 errors without Retry-After header", async () => {
            // First request fails with 500, no Retry-After header
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(500, {
                code: "internal_error",
                message: "internal error",
            });
            // Second request succeeds
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(200, { allowed: true });
            const result = await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey });
            (0, expect_1.expect)(result.allowed).toBe(true);
        });
    });
    (0, node_test_1.describe)("no retries for 501 Not Implemented errors", () => {
        let fgaApi;
        const tupleKey = {
            user: "user:xyz",
            relation: "viewer",
            object: "foobar:x",
        };
        const basePath = default_config_1.defaultConfiguration.getBasePath();
        const { storeId } = default_config_1.baseConfig;
        (0, node_test_1.beforeEach)(() => {
            const updateBaseConfig = {
                ...default_config_1.baseConfig,
                retryParams: (0, configuration_1.GetDefaultRetryParams)(3, 10), // Allow multiple retries
            };
            fgaApi = new index_1.OpenFgaApi({ ...updateBaseConfig });
            nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER, "test-token");
        });
        (0, node_test_1.it)("should not retry 501 Not Implemented errors", async () => {
            // Mock a single 501 error - should not be retried
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(501, {
                code: "not_implemented",
                message: "not implemented error",
            });
            await (0, expect_1.expect)(fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey })).rejects.toThrow(index_1.FgaApiError);
        });
        (0, node_test_1.it)("should not retry 501 errors even with Retry-After header", async () => {
            // Mock a single 501 error with Retry-After header - should still not be retried
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(501, {
                code: "not_implemented",
                message: "not implemented error",
            }, {
                "Retry-After": "2"
            });
            await (0, expect_1.expect)(fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey })).rejects.toThrow(index_1.FgaApiError);
        });
        (0, node_test_1.it)("should retry 500 but not 501 errors", async () => {
            // First attempt - 500 error should be retried
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(500, {
                code: "internal_error",
                message: "internal error",
            });
            // Second attempt - 501 error should not be retried
            (0, nock_1.default)(basePath)
                .post(`/stores/${storeId}/check`, {
                tuple_key: tupleKey,
            }, expect_1.expect.objectContaining({ Authorization: "Bearer test-token" }))
                .reply(501, {
                code: "not_implemented",
                message: "not implemented error",
            });
            await (0, expect_1.expect)(fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey })).rejects.toThrow(index_1.FgaApiError);
        });
    });
    (0, node_test_1.describe)("happy path of CHECK", () => {
        let result;
        let fgaApi;
        (0, node_test_1.before)(async () => {
            fgaApi = new index_1.OpenFgaApi({ ...default_config_1.baseConfig });
            nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER);
            const tupleKey = {
                user: "user:xyz",
                relation: "abc",
                object: "foobar:x",
            };
            nocks.check(default_config_1.baseConfig.storeId, tupleKey);
            result = await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tupleKey });
        });
        (0, node_test_1.it)("should return allowed", () => {
            (0, expect_1.expect)(result.allowed).toBe(true);
        });
        (0, node_test_1.it)("should return the proper $response object", () => {
            (0, expect_1.expect)(result).toHaveProperty("$response");
            (0, expect_1.expect)(result.$response.status).toBe(200);
            (0, expect_1.expect)(Object.prototype.propertyIsEnumerable.call(result, "$response")).toBe(false);
        });
    });
    (0, node_test_1.describe)("using the sdk", () => {
        let fgaApi;
        (0, node_test_1.before)(() => {
            fgaApi = new index_1.OpenFgaApi({ ...default_config_1.baseConfig });
        });
        (0, node_test_1.beforeEach)(() => {
            nocks.tokenExchange(default_config_1.OPENFGA_API_TOKEN_ISSUER);
        });
        (0, node_test_1.describe)("check", () => {
            (0, node_test_1.it)("should properly pass the request and return an allowed API response", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                nocks.check(default_config_1.baseConfig.storeId, tuple);
                const data = await fgaApi.check(default_config_1.baseConfig.storeId, { tuple_key: tuple });
                (0, expect_1.expect)(data).toMatchObject({ allowed: expect_1.expect.any(Boolean) });
            });
        });
        (0, node_test_1.describe)("write: write tuples", () => {
            (0, node_test_1.it)("should properly call the OpenFga Write API", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                nocks.write(default_config_1.baseConfig.storeId);
                const data = await fgaApi.write(default_config_1.baseConfig.storeId, {
                    writes: { tuple_keys: [tuple] },
                    authorization_model_id: "01GXSA8YR785C4FYS3C0RTG7B1",
                });
                (0, expect_1.expect)(data).toMatchObject({});
            });
        });
        (0, node_test_1.describe)("write: delete tuples", () => {
            (0, node_test_1.it)("should properly call the OpenFga Write API", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                nocks.delete(default_config_1.baseConfig.storeId, tuple);
                const data = await fgaApi.write(default_config_1.baseConfig.storeId, {
                    deletes: { tuple_keys: [tuple] },
                    authorization_model_id: "01GXSA8YR785C4FYS3C0RTG7B1",
                });
                (0, expect_1.expect)(data).toMatchObject({});
            });
        });
        (0, node_test_1.describe)("expand", () => {
            (0, node_test_1.it)("should properly call the OpenFga Expand API", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                nocks.expand(default_config_1.baseConfig.storeId, tuple);
                const data = await fgaApi.expand(default_config_1.baseConfig.storeId, { tuple_key: tuple, authorization_model_id: "01GXSA8YR785C4FYS3C0RTG7B1" });
                (0, expect_1.expect)(data).toMatchObject({});
            });
        });
        (0, node_test_1.describe)("read", () => {
            (0, node_test_1.it)("should properly call the OpenFga Read API", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                nocks.read(default_config_1.baseConfig.storeId, tuple);
                const data = await fgaApi.read(default_config_1.baseConfig.storeId, { tuple_key: tuple });
                (0, expect_1.expect)(data).toMatchObject({});
            });
        });
        (0, node_test_1.describe)("writeAuthorizationModel", () => {
            (0, node_test_1.it)("should call the api and return the response", async () => {
                const authorizationModel = {
                    schema_version: "1.1",
                    type_definitions: [
                        { type: "workspace", relations: { admin: { this: {} } } },
                    ],
                };
                nocks.writeAuthorizationModel(default_config_1.baseConfig.storeId, authorizationModel);
                const data = await fgaApi.writeAuthorizationModel(default_config_1.baseConfig.storeId, authorizationModel);
                (0, expect_1.expect)(data).toMatchObject({ id: expect_1.expect.any(String) });
            });
        });
        (0, node_test_1.describe)("readAuthorizationModel", () => {
            (0, node_test_1.it)("should call the api and return the response", async () => {
                const configId = "string";
                nocks.readSingleAuthzModel(default_config_1.baseConfig.storeId, configId);
                const data = await fgaApi.readAuthorizationModel(default_config_1.baseConfig.storeId, configId);
                (0, expect_1.expect)(data).toMatchObject({
                    authorization_model: {
                        id: expect_1.expect.any(String),
                        schema_version: "1.1",
                        type_definitions: expect_1.expect.arrayContaining([]),
                    },
                });
            });
        });
        (0, node_test_1.describe)("readAuthorizationModels", () => {
            (0, node_test_1.it)("should call the api and return the response", async () => {
                nocks.readAuthorizationModels(default_config_1.baseConfig.storeId, default_config_1.defaultConfiguration.getBasePath(), [{ id: "1", schema_version: "1.1", type_definitions: [] }]);
                const data = await fgaApi.readAuthorizationModels(default_config_1.baseConfig.storeId);
                (0, expect_1.expect)(data).toMatchObject({
                    authorization_models: expect_1.expect.arrayContaining([{ id: "1", schema_version: "1.1", type_definitions: [] }]),
                });
            });
        });
        (0, node_test_1.describe)("readChanges", () => {
            (0, node_test_1.it)("should call the api and return the response", async () => {
                const type = "repo";
                const pageSize = 25;
                const continuationToken = "eyJwayI6IkxBVEVTVF9OU0NPTkZJR19hdXRoMHN0b3JlIiwic2siOiIxem1qbXF3MWZLZExTcUoyN01MdTdqTjh0cWgifQ==";
                const startTime = "2022-01-01T00:00:00Z";
                nocks.readChanges(default_config_1.baseConfig.storeId, type, pageSize, continuationToken, startTime);
                const response = await fgaApi.readChanges(default_config_1.baseConfig.storeId, type, pageSize, continuationToken, startTime);
                (0, expect_1.expect)(response).toMatchObject({ changes: expect_1.expect.arrayContaining([]) });
            });
        });
        (0, node_test_1.describe)("listObjects", () => {
            (0, node_test_1.it)("should call the api and return the response", async () => {
                const mockedResponse = { objects: ["document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a"] };
                nocks.listObjects(default_config_1.baseConfig.storeId, mockedResponse);
                const response = await fgaApi.listObjects(default_config_1.baseConfig.storeId, {
                    authorization_model_id: "01GAHCE4YVKPQEKZQHT2R89MQV",
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "can_read",
                    type: "document",
                    contextual_tuples: {
                        tuple_keys: [{
                                user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                                relation: "editor",
                                object: "folder:product"
                            }, {
                                user: "folder:product",
                                relation: "parent",
                                object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a"
                            }]
                    }
                });
                (0, expect_1.expect)(response.objects).toHaveLength(mockedResponse.objects.length);
                (0, expect_1.expect)(response.objects).toEqual(expect_1.expect.arrayContaining(mockedResponse.objects));
            });
        });
    });
});
//# sourceMappingURL=index.test.js.map