"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nock_1 = __importDefault(require("nock"));
const node_test_1 = require("node:test");
const index_1 = require("../index");
const default_config_1 = require("./helpers/default-config");
const credentials_1 = require("../credentials");
const expect_1 = require("./helpers/expect");
(0, node_test_1.describe)("Header Functionality Tests", () => {
    const testConfig = {
        ...default_config_1.baseConfig,
        credentials: { method: credentials_1.CredentialsMethod.None }
    };
    (0, node_test_1.describe)("Default headers from client configuration", () => {
        (0, node_test_1.it)("should send default headers from baseOptions on all requests", async () => {
            const fgaClient = new index_1.OpenFgaClient({
                ...testConfig,
                baseOptions: {
                    headers: {
                        "X-Default-Header": "default-value",
                        "X-Client-ID": "test-client-123",
                        "X-API-Version": "v1.0"
                    }
                }
            });
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                // Verify all default headers are present
                (0, expect_1.expect)(this.req.headers["x-default-header"]).toBe("default-value");
                (0, expect_1.expect)(this.req.headers["x-client-id"]).toBe("test-client-123");
                (0, expect_1.expect)(this.req.headers["x-api-version"]).toBe("v1.0");
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            });
        });
        (0, node_test_1.it)("should send default headers on multiple different API calls", async () => {
            const fgaClient = new index_1.OpenFgaClient({
                ...testConfig,
                baseOptions: {
                    headers: {
                        "X-Persistent-Header": "should-appear-everywhere"
                    }
                }
            });
            // Test check endpoint
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                (0, expect_1.expect)(this.req.headers["x-persistent-header"]).toBe("should-appear-everywhere");
                return [200, { allowed: true }];
            });
            // Test read endpoint
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/read`)
                .reply(function () {
                (0, expect_1.expect)(this.req.headers["x-persistent-header"]).toBe("should-appear-everywhere");
                return [200, { tuples: [] }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            });
            await fgaClient.read({});
        });
    });
    (0, node_test_1.describe)("Per-request headers", () => {
        (0, node_test_1.it)("should send per-request headers when specified", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                (0, expect_1.expect)(this.req.headers["x-request-header"]).toBe("request-value");
                (0, expect_1.expect)(this.req.headers["x-correlation-id"]).toBe("abc-123-def");
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            }, {
                headers: {
                    "X-Request-Header": "request-value",
                    "X-Correlation-ID": "abc-123-def"
                }
            });
        });
        (0, node_test_1.it)("should only send per-request headers on the specific request", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            // First request with headers
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                (0, expect_1.expect)(this.req.headers["x-first-request"]).toBe("first-value");
                (0, expect_1.expect)(this.req.headers["x-second-request"]).toBeUndefined();
                return [200, { allowed: true }];
            });
            // Second request with different headers
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                (0, expect_1.expect)(this.req.headers["x-second-request"]).toBe("second-value");
                (0, expect_1.expect)(this.req.headers["x-first-request"]).toBeUndefined();
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            }, {
                headers: {
                    "X-First-Request": "first-value"
                }
            });
            await fgaClient.check({
                user: "user:different",
                relation: "writer",
                object: "document:other"
            }, {
                headers: {
                    "X-Second-Request": "second-value"
                }
            });
        });
    });
    (0, node_test_1.describe)("Default + per-request header combination", () => {
        (0, node_test_1.it)("should send both default headers and per-request headers", async () => {
            const fgaClient = new index_1.OpenFgaClient({
                ...testConfig,
                baseOptions: {
                    headers: {
                        "X-Default-Header": "default-value",
                        "X-Client-Name": "test-client"
                    }
                }
            });
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                // Verify default headers are present
                (0, expect_1.expect)(this.req.headers["x-default-header"]).toBe("default-value");
                (0, expect_1.expect)(this.req.headers["x-client-name"]).toBe("test-client");
                // Verify per-request headers are present
                (0, expect_1.expect)(this.req.headers["x-request-id"]).toBe("req-123");
                (0, expect_1.expect)(this.req.headers["x-user-context"]).toBe("test-user");
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            }, {
                headers: {
                    "X-Request-ID": "req-123",
                    "X-User-Context": "test-user"
                }
            });
        });
        (0, node_test_1.it)("should merge headers from multiple sources correctly", async () => {
            const fgaClient = new index_1.OpenFgaClient({
                ...testConfig,
                baseOptions: {
                    headers: {
                        "X-Source": "default",
                        "X-Default-Only": "only-in-default",
                        "X-Version": "1.0"
                    }
                }
            });
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                const headers = this.req.headers;
                // Default headers should be present
                (0, expect_1.expect)(headers["x-source"]).toBe("default");
                (0, expect_1.expect)(headers["x-default-only"]).toBe("only-in-default");
                (0, expect_1.expect)(headers["x-version"]).toBe("1.0");
                // Per-request headers should be present
                (0, expect_1.expect)(headers["x-request-only"]).toBe("only-in-request");
                (0, expect_1.expect)(headers["x-timestamp"]).toBe("2023-10-01");
                // SDK headers should be present
                (0, expect_1.expect)(headers["content-type"]).toBe("application/json");
                (0, expect_1.expect)(headers["user-agent"]).toMatch(/openfga-sdk/);
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            }, {
                headers: {
                    "X-Request-Only": "only-in-request",
                    "X-Timestamp": "2023-10-01"
                }
            });
        });
    });
    (0, node_test_1.describe)("Header precedence and override behavior", () => {
        (0, node_test_1.it)("should allow per-request headers to override default headers", async () => {
            const fgaClient = new index_1.OpenFgaClient({
                ...testConfig,
                baseOptions: {
                    headers: {
                        "X-Environment": "default-env",
                        "X-Priority": "low",
                        "X-Shared-Header": "from-default"
                    }
                }
            });
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                // Per-request headers should override default headers
                (0, expect_1.expect)(this.req.headers["x-environment"]).toBe("production");
                (0, expect_1.expect)(this.req.headers["x-priority"]).toBe("high");
                (0, expect_1.expect)(this.req.headers["x-shared-header"]).toBe("from-request");
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            }, {
                headers: {
                    "X-Environment": "production",
                    "X-Priority": "high",
                    "X-Shared-Header": "from-request"
                }
            });
        });
        (0, node_test_1.it)("should preserve non-overridden default headers", async () => {
            const fgaClient = new index_1.OpenFgaClient({
                ...testConfig,
                baseOptions: {
                    headers: {
                        "X-Keep-Default": "keep-this",
                        "X-Override-This": "original-value",
                        "X-Also-Keep": "also-keep-this"
                    }
                }
            });
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                // Non-overridden defaults should remain
                (0, expect_1.expect)(this.req.headers["x-keep-default"]).toBe("keep-this");
                (0, expect_1.expect)(this.req.headers["x-also-keep"]).toBe("also-keep-this");
                // Overridden header should have new value
                (0, expect_1.expect)(this.req.headers["x-override-this"]).toBe("new-value");
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            }, {
                headers: {
                    "X-Override-This": "new-value"
                }
            });
        });
        (0, node_test_1.it)("should handle case-insensitive header overrides correctly", async () => {
            const fgaClient = new index_1.OpenFgaClient({
                ...testConfig,
                baseOptions: {
                    headers: {
                        "X-Test-Header": "default-value"
                    }
                }
            });
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                // HTTP headers are case-insensitive, so request header should override default
                const testHeaderValue = this.req.headers["x-test-header"];
                // Per-request should win
                (0, expect_1.expect)(testHeaderValue).toBe("request-value");
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            }, {
                headers: {
                    "x-test-header": "request-value" // Different case
                }
            });
        });
    });
    (0, node_test_1.describe)("Content-Type header protection behavior", () => {
        (0, node_test_1.it)("does not honor Content-Type header from baseOptions override", async () => {
            // The SDK protects Content-Type
            // User attempts to set Content-Type via baseOptions are ignored
            const fgaClient = new index_1.OpenFgaClient({
                ...testConfig,
                baseOptions: {
                    headers: {
                        "Content-Type": "text/plain", // SDK ignores this
                        "X-Custom-Header": "should-work" // Custom headers work fine
                    }
                }
            });
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                const headers = this.req.headers;
                // SDK enforces Content-Type for JSON APIs
                (0, expect_1.expect)(headers["content-type"]).toBe("application/json");
                // Custom headers are preserved
                (0, expect_1.expect)(headers["x-custom-header"]).toBe("should-work");
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            });
        });
        (0, node_test_1.it)("does not allow Content-Type override via per-request headers", async () => {
            // SDK always enforces Content-Type for JSON requests; user attempts to override are ignored
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                // SDK always enforces Content-Type for JSON APIs
                (0, expect_1.expect)(this.req.headers["content-type"]).toBe("application/json");
                (0, expect_1.expect)(this.req.headers["x-custom-request"]).toBe("request-value");
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            }, {
                headers: {
                    "Content-Type": "application/xml", // SDK ignores this
                    "X-Custom-Request": "request-value" // Custom headers still work
                }
            });
        });
        (0, node_test_1.it)("should set Content-Type to application/json by default", async () => {
            // When no Content-Type is specified, SDK sets it to application/json
            const fgaClient = new index_1.OpenFgaClient({
                ...testConfig,
                baseOptions: {
                    headers: {
                        "X-API-Version": "v1", // Custom header without Content-Type
                        "Authorization": "Bearer token" // Another custom header
                    }
                }
            });
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                const headers = this.req.headers;
                // SDK automatically sets Content-Type for JSON APIs
                (0, expect_1.expect)(headers["content-type"]).toBe("application/json");
                // Custom headers are preserved
                (0, expect_1.expect)(headers["x-api-version"]).toBe("v1");
                (0, expect_1.expect)(headers["authorization"]).toBe("Bearer token");
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            });
        });
        (0, node_test_1.it)("SDK enforces Content-Type and Accept regardless of baseOptions headers", async () => {
            // SDK always enforces Content-Type and Accept for JSON requests
            const fgaClient = new index_1.OpenFgaClient({
                ...testConfig,
                baseOptions: {
                    headers: {
                        "Content-Type": "text/plain", // SDK ignores this
                        "Accept": "text/html", // SDK ignores this too
                        "X-Custom": "definitely-works" // Custom headers always work
                    }
                }
            });
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                const headers = this.req.headers;
                // SDK enforces Content-Type and Accept for JSON APIs
                (0, expect_1.expect)(headers["content-type"]).toBe("application/json");
                (0, expect_1.expect)(headers["accept"]).toBe("application/json");
                // Custom headers are passed through
                (0, expect_1.expect)(headers["x-custom"]).toBe("definitely-works");
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            });
        });
    });
    (0, node_test_1.describe)("Edge cases and special scenarios", () => {
        (0, node_test_1.it)("should handle empty baseOptions headers", async () => {
            const fgaClient = new index_1.OpenFgaClient({
                ...testConfig,
                baseOptions: {
                    headers: {}
                }
            });
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                // Should still have SDK headers
                (0, expect_1.expect)(this.req.headers["content-type"]).toBe("application/json");
                (0, expect_1.expect)(this.req.headers["user-agent"]).toMatch(/openfga-sdk/);
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            });
        });
        (0, node_test_1.it)("should handle undefined baseOptions", async () => {
            const fgaClient = new index_1.OpenFgaClient({
                ...testConfig
                // No baseOptions specified
            });
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                // Should still have SDK headers
                (0, expect_1.expect)(this.req.headers["content-type"]).toBe("application/json");
                (0, expect_1.expect)(this.req.headers["user-agent"]).toMatch(/openfga-sdk/);
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            });
        });
        (0, node_test_1.it)("should handle empty per-request headers", async () => {
            const fgaClient = new index_1.OpenFgaClient({
                ...testConfig,
                baseOptions: {
                    headers: {
                        "X-Default": "default-value"
                    }
                }
            });
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                // Default headers should still be present
                (0, expect_1.expect)(this.req.headers["x-default"]).toBe("default-value");
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            }, {
                headers: {} // Empty headers object
            });
        });
        (0, node_test_1.it)("should handle special header values", async () => {
            const fgaClient = new index_1.OpenFgaClient({
                ...testConfig,
                baseOptions: {
                    headers: {
                        "X-Empty-String": "",
                        "X-Number-Value": "123",
                        "X-Boolean-Value": "true",
                        "X-Special-Chars": "test@#$%^&*()_+-={}[]|\\:;\"'<>,.?/"
                    }
                }
            });
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                const headers = this.req.headers;
                (0, expect_1.expect)(headers["x-empty-string"]).toBe("");
                (0, expect_1.expect)(headers["x-number-value"]).toBe("123");
                (0, expect_1.expect)(headers["x-boolean-value"]).toBe("true");
                (0, expect_1.expect)(headers["x-special-chars"]).toBe("test@#$%^&*()_+-={}[]|\\:;\"'<>,.?/");
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            });
        });
        (0, node_test_1.it)("should handle large number of headers", async () => {
            const defaultHeaders = {};
            const requestHeaders = {};
            // Create many default headers
            for (let i = 1; i <= 50; i++) {
                defaultHeaders[`X-Default-${i}`] = `default-value-${i}`;
            }
            // Create many request headers
            for (let i = 1; i <= 50; i++) {
                requestHeaders[`X-Request-${i}`] = `request-value-${i}`;
            }
            const fgaClient = new index_1.OpenFgaClient({
                ...testConfig,
                baseOptions: {
                    headers: defaultHeaders
                }
            });
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                const headers = this.req.headers;
                // Verify a sample of default headers
                (0, expect_1.expect)(headers["x-default-1"]).toBe("default-value-1");
                (0, expect_1.expect)(headers["x-default-25"]).toBe("default-value-25");
                (0, expect_1.expect)(headers["x-default-50"]).toBe("default-value-50");
                // Verify a sample of request headers
                (0, expect_1.expect)(headers["x-request-1"]).toBe("request-value-1");
                (0, expect_1.expect)(headers["x-request-25"]).toBe("request-value-25");
                (0, expect_1.expect)(headers["x-request-50"]).toBe("request-value-50");
                return [200, { allowed: true }];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            }, {
                headers: requestHeaders
            });
        });
    });
    (0, node_test_1.describe)("Header behavior across different API methods", () => {
        (0, node_test_1.it)("should send headers consistently across different API endpoints", async () => {
            const fgaClient = new index_1.OpenFgaClient({
                ...testConfig,
                baseOptions: {
                    headers: {
                        "X-Consistent-Header": "always-present"
                    }
                }
            });
            // Test multiple endpoints
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/check`)
                .reply(function () {
                (0, expect_1.expect)(this.req.headers["x-consistent-header"]).toBe("always-present");
                return [200, { allowed: true }];
            });
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/read`)
                .reply(function () {
                (0, expect_1.expect)(this.req.headers["x-consistent-header"]).toBe("always-present");
                return [200, { tuples: [] }];
            });
            (0, nock_1.default)(testConfig.apiUrl)
                .post(`/stores/${testConfig.storeId}/write`)
                .reply(function () {
                (0, expect_1.expect)(this.req.headers["x-consistent-header"]).toBe("always-present");
                return [200, {}];
            });
            await fgaClient.check({
                user: "user:test",
                relation: "reader",
                object: "document:test"
            });
            await fgaClient.read({});
            await fgaClient.write({
                writes: [{
                        user: "user:test",
                        relation: "reader",
                        object: "document:test"
                    }]
            });
        });
    });
});
//# sourceMappingURL=headers.test.js.map