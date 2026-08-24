"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nock_1 = __importDefault(require("nock"));
const node_test_1 = require("node:test");
const credentials_1 = require("../credentials");
const index_1 = require("../index");
const default_config_1 = require("./helpers/default-config");
const expect_1 = require("./helpers/expect");
(0, node_test_1.describe)("OpenFgaClient.executeApiRequest", () => {
    const basePath = default_config_1.defaultConfiguration.getBasePath();
    const testConfig = {
        ...default_config_1.baseConfig,
        credentials: { method: credentials_1.CredentialsMethod.None }
    };
    (0, node_test_1.describe)("GET requests", () => {
        (0, node_test_1.it)("should make GET requests successfully", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            const responseData = { stores: [{ id: "store-1", name: "Test Store" }] };
            (0, nock_1.default)(basePath)
                .get("/stores")
                .reply(200, responseData);
            const result = await fgaClient.executeApiRequest({
                operationName: "ListStores",
                method: "GET",
                path: "/stores",
            });
            (0, expect_1.expect)(result.stores).toEqual(responseData.stores);
        });
        (0, node_test_1.it)("should include query parameters in GET requests", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            const responseData = { stores: [] };
            (0, nock_1.default)(basePath)
                .get("/stores")
                .query({ page_size: 10, name: "test" })
                .reply(200, responseData);
            const result = await fgaClient.executeApiRequest({
                operationName: "ListStores",
                method: "GET",
                path: "/stores",
                queryParams: { page_size: 10, name: "test" },
            });
            (0, expect_1.expect)(result.stores).toEqual([]);
        });
        (0, node_test_1.it)("should return $response with the full Axios response", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            const responseData = { stores: [] };
            (0, nock_1.default)(basePath)
                .get("/stores")
                .reply(200, responseData);
            const result = await fgaClient.executeApiRequest({
                operationName: "ListStores",
                method: "GET",
                path: "/stores",
            });
            (0, expect_1.expect)(result.$response).toBeDefined();
            (0, expect_1.expect)(result.$response.status).toBe(200);
        });
    });
    (0, node_test_1.describe)("POST requests", () => {
        (0, node_test_1.it)("should make POST requests with body", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            const requestBody = { name: "New Store" };
            const responseData = { id: "new-store-id", name: "New Store" };
            (0, nock_1.default)(basePath)
                .post("/stores", requestBody)
                .reply(201, responseData);
            const result = await fgaClient.executeApiRequest({
                operationName: "CreateStore",
                method: "POST",
                path: "/stores",
                body: requestBody,
            });
            (0, expect_1.expect)(result.id).toBe("new-store-id");
        });
        (0, node_test_1.it)("should set Content-Type header for POST requests with body", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            const requestBody = { foo: "bar" };
            (0, nock_1.default)(basePath, {
                reqheaders: {
                    "Content-Type": "application/json",
                },
            })
                .post("/stores", requestBody)
                .reply(200, {});
            await fgaClient.executeApiRequest({
                operationName: "CreateStore",
                method: "POST",
                path: "/stores",
                body: requestBody,
            });
            // If we get here without error, the Content-Type header was correctly applied
            (0, expect_1.expect)(true).toBe(true);
        });
        (0, node_test_1.it)("should set Accept header for all requests", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            (0, nock_1.default)(basePath, {
                reqheaders: {
                    "Accept": "application/json",
                },
            })
                .get("/stores")
                .reply(200, {});
            await fgaClient.executeApiRequest({
                operationName: "ListStores",
                method: "GET",
                path: "/stores",
            });
            // If we get here without error, the Accept header was correctly applied
            (0, expect_1.expect)(true).toBe(true);
        });
    });
    (0, node_test_1.describe)("PUT requests", () => {
        (0, node_test_1.it)("should make PUT requests with body", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            const requestBody = { name: "Updated Store" };
            (0, nock_1.default)(basePath)
                .put(`/stores/${default_config_1.OPENFGA_STORE_ID}`, requestBody)
                .reply(200, { success: true });
            const result = await fgaClient.executeApiRequest({
                operationName: "UpdateStore",
                method: "PUT",
                path: `/stores/${default_config_1.OPENFGA_STORE_ID}`,
                body: requestBody,
            });
            (0, expect_1.expect)(result.success).toBe(true);
        });
    });
    (0, node_test_1.describe)("DELETE requests", () => {
        (0, node_test_1.it)("should make DELETE requests", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            (0, nock_1.default)(basePath)
                .delete(`/stores/${default_config_1.OPENFGA_STORE_ID}`)
                .reply(204, {});
            const result = await fgaClient.executeApiRequest({
                operationName: "DeleteStore",
                method: "DELETE",
                path: `/stores/${default_config_1.OPENFGA_STORE_ID}`,
            });
            (0, expect_1.expect)(result.$response.status).toBe(204);
        });
    });
    (0, node_test_1.describe)("PATCH requests", () => {
        (0, node_test_1.it)("should make PATCH requests with body", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            const requestBody = { name: "Patched Store" };
            (0, nock_1.default)(basePath)
                .patch(`/stores/${default_config_1.OPENFGA_STORE_ID}`, requestBody)
                .reply(200, { success: true });
            const result = await fgaClient.executeApiRequest({
                operationName: "PatchStore",
                method: "PATCH",
                path: `/stores/${default_config_1.OPENFGA_STORE_ID}`,
                body: requestBody,
            });
            (0, expect_1.expect)(result.success).toBe(true);
        });
    });
    (0, node_test_1.describe)("custom headers", () => {
        (0, node_test_1.it)("should include headers from request params", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            (0, nock_1.default)(basePath, {
                reqheaders: {
                    "X-Custom-Header": "custom-value",
                },
            })
                .get("/stores")
                .reply(200, {});
            await fgaClient.executeApiRequest({
                operationName: "ListStores",
                method: "GET",
                path: "/stores",
                headers: { "X-Custom-Header": "custom-value" },
            });
            // If we get here without error, the custom header was correctly applied
            (0, expect_1.expect)(true).toBe(true);
        });
        (0, node_test_1.it)("should include headers from options (backward compatible)", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            (0, nock_1.default)(basePath, {
                reqheaders: {
                    "X-Custom-Header": "custom-value",
                },
            })
                .get("/stores")
                .reply(200, {});
            await fgaClient.executeApiRequest({
                operationName: "ListStores",
                method: "GET",
                path: "/stores",
            }, {
                headers: { "X-Custom-Header": "custom-value" },
            });
            // If we get here without error, the custom header was correctly applied
            (0, expect_1.expect)(true).toBe(true);
        });
        (0, node_test_1.it)("should let options.headers override request.headers for the same key", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            (0, nock_1.default)(basePath, {
                reqheaders: {
                    "X-Version": "options-wins",
                },
            })
                .get("/stores")
                .reply(200, {});
            await fgaClient.executeApiRequest({
                operationName: "ListStores",
                method: "GET",
                path: "/stores",
                headers: { "X-Version": "request-value" },
            }, {
                headers: { "X-Version": "options-wins" },
            });
            (0, expect_1.expect)(true).toBe(true);
        });
    });
    (0, node_test_1.describe)("error handling", () => {
        (0, node_test_1.it)("should throw FgaApiNotFoundError for 404 responses", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            (0, nock_1.default)(basePath)
                .get("/nonexistent-endpoint")
                .reply(404, {
                code: "undefined_endpoint",
                message: "Not found",
            });
            await (0, expect_1.expect)(fgaClient.executeApiRequest({
                operationName: "GetNonexistent",
                method: "GET",
                path: "/nonexistent-endpoint",
            })).rejects.toThrow(index_1.FgaApiNotFoundError);
        });
        (0, node_test_1.it)("should throw FgaApiValidationError for 400 responses", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            (0, nock_1.default)(basePath)
                .post("/stores")
                .reply(400, {
                code: "validation_error",
                message: "Invalid request",
            });
            await (0, expect_1.expect)(fgaClient.executeApiRequest({
                operationName: "CreateStore",
                method: "POST",
                path: "/stores",
                body: { invalid: "data" },
            })).rejects.toThrow(index_1.FgaApiValidationError);
        });
    });
});
(0, node_test_1.describe)("OpenFgaClient.executeApiRequest - path parameters", () => {
    const basePath = default_config_1.defaultConfiguration.getBasePath();
    const testConfig = {
        ...default_config_1.baseConfig,
        credentials: { method: credentials_1.CredentialsMethod.None }
    };
    (0, node_test_1.describe)("path parameter replacement", () => {
        (0, node_test_1.it)("should replace path parameters with values (single_parameter)", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            const storeId = "01ARZ3NDEKTSV4RRFFQ69G5FAV";
            const responseData = { id: storeId, name: "Test Store" };
            (0, nock_1.default)(basePath)
                .get(`/stores/${storeId}`)
                .reply(200, responseData);
            const result = await fgaClient.executeApiRequest({
                operationName: "GetStore",
                method: "GET",
                path: "/stores/{store_id}",
                pathParams: { store_id: storeId },
            });
            (0, expect_1.expect)(result.id).toBe(storeId);
        });
        (0, node_test_1.it)("should replace multiple path parameters (multiple_parameters)", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            const storeId = "store-123";
            const modelId = "model-456";
            const responseData = { id: modelId };
            (0, nock_1.default)(basePath)
                .get(`/stores/${storeId}/authorization-models/${modelId}`)
                .reply(200, responseData);
            const result = await fgaClient.executeApiRequest({
                operationName: "GetAuthorizationModel",
                method: "GET",
                path: "/stores/{store_id}/authorization-models/{model_id}",
                pathParams: { store_id: storeId, model_id: modelId },
            });
            (0, expect_1.expect)(result.id).toBe(modelId);
        });
        (0, node_test_1.it)("should URL-encode path parameter values with spaces (parameter_with_special_characters)", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            const storeId = "store id with spaces";
            const encodedStoreId = "store%20id%20with%20spaces";
            (0, nock_1.default)(basePath)
                .get(`/stores/${encodedStoreId}`)
                .reply(200, { id: storeId });
            const result = await fgaClient.executeApiRequest({
                operationName: "GetStore",
                method: "GET",
                path: "/stores/{store_id}",
                pathParams: { store_id: storeId },
            });
            (0, expect_1.expect)(result.id).toBe(storeId);
        });
        (0, node_test_1.it)("should URL-encode path parameter values with URL-unsafe characters (parameter_with_url_unsafe_characters)", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            const id = "test/with?special&chars";
            const encodedId = encodeURIComponent(id);
            // Use regex matching to handle URL-encoded special characters properly
            (0, nock_1.default)(basePath)
                .get(new RegExp(`/items/${encodedId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`))
                .reply(200, { id: id });
            const result = await fgaClient.executeApiRequest({
                operationName: "GetItem",
                method: "GET",
                path: "/items/{id}",
                pathParams: { id: id },
            });
            (0, expect_1.expect)(result.id).toBe(id);
        });
        (0, node_test_1.it)("should URL-encode unicode characters in path parameters (parameter_with_unicode)", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            const name = "用户";
            const encodedName = encodeURIComponent(name); // %E7%94%A8%E6%88%B7
            // Use regex matching to handle URL-encoded unicode characters properly
            (0, nock_1.default)(basePath)
                .get(new RegExp(`/users/${encodedName}`))
                .reply(200, { name: name });
            const result = await fgaClient.executeApiRequest({
                operationName: "GetUser",
                method: "GET",
                path: "/users/{name}",
                pathParams: { name: name },
            });
            (0, expect_1.expect)(result.name).toBe(name);
        });
        (0, node_test_1.it)("should ignore unused path parameters (unused_parameters_ignored)", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            const storeId = "123";
            (0, nock_1.default)(basePath)
                .get(`/stores/${storeId}`)
                .reply(200, { id: storeId });
            const result = await fgaClient.executeApiRequest({
                operationName: "GetStore",
                method: "GET",
                path: "/stores/{store_id}",
                pathParams: {
                    store_id: storeId,
                    unused: "value" // Should be ignored
                },
            });
            (0, expect_1.expect)(result.id).toBe(storeId);
        });
        (0, node_test_1.it)("should replace parameter appearing multiple times in path (parameter_appears_multiple_times)", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            const id = "abc";
            (0, nock_1.default)(basePath)
                .get(`/stores/${id}/check/${id}`)
                .reply(200, { id: id });
            const result = await fgaClient.executeApiRequest({
                operationName: "CustomCheck",
                method: "GET",
                path: "/stores/{id}/check/{id}",
                pathParams: { id: id },
            });
            (0, expect_1.expect)(result.id).toBe(id);
        });
        (0, node_test_1.it)("should allow empty parameter value (empty_parameter_value)", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            (0, nock_1.default)(basePath)
                .get("/stores/")
                .reply(200, { id: "" });
            const result = await fgaClient.executeApiRequest({
                operationName: "GetStore",
                method: "GET",
                path: "/stores/{store_id}",
                pathParams: { store_id: "" },
            });
            (0, expect_1.expect)(result.id).toBe("");
        });
        (0, node_test_1.it)("should work without pathParams for paths with no template (no_parameters)", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            (0, nock_1.default)(basePath)
                .get("/stores")
                .reply(200, { stores: [] });
            const result = await fgaClient.executeApiRequest({
                operationName: "ListStores",
                method: "GET",
                path: "/stores",
            });
            (0, expect_1.expect)(result.stores).toEqual([]);
        });
        (0, node_test_1.it)("should throw error for unresolved path parameters", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            await (0, expect_1.expect)(fgaClient.executeApiRequest({
                operationName: "CustomCheck",
                method: "GET",
                path: "/stores/{store_id}/check",
                // pathParams intentionally omitted
            })).rejects.toThrow("Path parameter 'store_id' was not provided for path: /stores/{store_id}/check");
        });
        (0, node_test_1.it)("should throw error when some path parameters are missing", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            await (0, expect_1.expect)(fgaClient.executeApiRequest({
                operationName: "GetAuthorizationModel",
                method: "GET",
                path: "/stores/{store_id}/authorization-models/{model_id}",
                pathParams: { store_id: "abc" }, // model_id is missing
            })).rejects.toThrow("Path parameter 'model_id' was not provided");
        });
    });
    (0, node_test_1.describe)("operationName for telemetry", () => {
        (0, node_test_1.it)("should accept operationName parameter", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            (0, nock_1.default)(basePath)
                .get("/stores")
                .reply(200, { stores: [] });
            // Should complete without error when operationName is provided
            const result = await fgaClient.executeApiRequest({
                operationName: "CustomListStores",
                method: "GET",
                path: "/stores",
            });
            (0, expect_1.expect)(result.stores).toEqual([]);
        });
        (0, node_test_1.it)("should use the provided operationName for the request", async () => {
            const fgaClient = new index_1.OpenFgaClient(testConfig);
            (0, nock_1.default)(basePath)
                .get("/stores")
                .reply(200, { stores: [] });
            const result = await fgaClient.executeApiRequest({
                operationName: "ListStores",
                method: "GET",
                path: "/stores",
            });
            (0, expect_1.expect)(result.stores).toEqual([]);
        });
    });
});
//# sourceMappingURL=apiExecutor.test.js.map