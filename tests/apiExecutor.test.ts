import * as nock from "nock";

import {
    OpenFgaClient,
    UserClientConfigurationParams,
    FgaApiNotFoundError,
    FgaApiValidationError,
} from "../index";
import { CredentialsMethod } from "../credentials";
import { baseConfig, defaultConfiguration, OPENFGA_STORE_ID } from "./helpers/default-config";

describe("OpenFgaClient.apiExecutor", () => {
    const basePath = defaultConfiguration.getBasePath();
    const testConfig: UserClientConfigurationParams = {
        ...baseConfig,
        credentials: { method: CredentialsMethod.None }
    };

    beforeAll(() => {
        nock.restore();
        nock.cleanAll();
        nock.activate();
        nock.disableNetConnect();
    });

    afterEach(() => {
        nock.cleanAll();
    });

    afterAll(() => {
        nock.restore();
    });

    describe("GET requests", () => {
        it("should make GET requests successfully", async () => {
            const fgaClient = new OpenFgaClient(testConfig);
            const responseData = { stores: [{ id: "store-1", name: "Test Store" }] };

            nock(basePath)
                .get("/stores")
                .reply(200, responseData);

            const result = await fgaClient.apiExecutor<any>({
                operationName: "ListStores",
                method: "GET",
                path: "/stores",
            });

            expect(result.stores).toEqual(responseData.stores);
        });

        it("should include query parameters in GET requests", async () => {
            const fgaClient = new OpenFgaClient(testConfig);
            const responseData = { stores: [] };

            nock(basePath)
                .get("/stores")
                .query({ page_size: 10, name: "test" })
                .reply(200, responseData);

            const result = await fgaClient.apiExecutor<any>({
                operationName: "ListStores",
                method: "GET",
                path: "/stores",
                queryParams: { page_size: 10, name: "test" },
            });

            expect(result.stores).toEqual([]);
        });

        it("should return $response with the full Axios response", async () => {
            const fgaClient = new OpenFgaClient(testConfig);
            const responseData = { stores: [] };

            nock(basePath)
                .get("/stores")
                .reply(200, responseData);

            const result = await fgaClient.apiExecutor({
                operationName: "ListStores",
                method: "GET",
                path: "/stores",
            });

            expect(result.$response).toBeDefined();
            expect(result.$response.status).toBe(200);
        });
    });

    describe("POST requests", () => {
        it("should make POST requests with body", async () => {
            const fgaClient = new OpenFgaClient(testConfig);
            const requestBody = { name: "New Store" };
            const responseData = { id: "new-store-id", name: "New Store" };

            nock(basePath)
                .post("/stores", requestBody)
                .reply(201, responseData);

            const result = await fgaClient.apiExecutor<any>({
                operationName: "CreateStore",
                method: "POST",
                path: "/stores",
                body: requestBody,
            });

            expect(result.id).toBe("new-store-id");
        });

        it("should set Content-Type header for POST requests with body", async () => {
            const fgaClient = new OpenFgaClient(testConfig);
            const requestBody = { foo: "bar" };

            nock(basePath, {
                reqheaders: {
                    "Content-Type": "application/json",
                },
            })
                .post("/stores", requestBody)
                .reply(200, {});

            await fgaClient.apiExecutor({
                operationName: "CreateStore",
                method: "POST",
                path: "/stores",
                body: requestBody,
            });

            // If we get here without error, the Content-Type header was correctly applied
            expect(true).toBe(true);
        });

        it("should set Accept header for all requests", async () => {
            const fgaClient = new OpenFgaClient(testConfig);

            nock(basePath, {
                reqheaders: {
                    "Accept": "application/json",
                },
            })
                .get("/stores")
                .reply(200, {});

            await fgaClient.apiExecutor({
                operationName: "ListStores",
                method: "GET",
                path: "/stores",
            });

            // If we get here without error, the Accept header was correctly applied
            expect(true).toBe(true);
        });
    });

    describe("PUT requests", () => {
        it("should make PUT requests with body", async () => {
            const fgaClient = new OpenFgaClient(testConfig);
            const requestBody = { name: "Updated Store" };

            nock(basePath)
                .put(`/stores/${OPENFGA_STORE_ID}`, requestBody)
                .reply(200, { success: true });

            const result = await fgaClient.apiExecutor<any>({
                operationName: "UpdateStore",
                method: "PUT",
                path: `/stores/${OPENFGA_STORE_ID}`,
                body: requestBody,
            });

            expect(result.success).toBe(true);
        });
    });

    describe("DELETE requests", () => {
        it("should make DELETE requests", async () => {
            const fgaClient = new OpenFgaClient(testConfig);

            nock(basePath)
                .delete(`/stores/${OPENFGA_STORE_ID}`)
                .reply(204, {});

            const result = await fgaClient.apiExecutor({
                operationName: "DeleteStore",
                method: "DELETE",
                path: `/stores/${OPENFGA_STORE_ID}`,
            });

            expect(result.$response.status).toBe(204);
        });
    });

    describe("PATCH requests", () => {
        it("should make PATCH requests with body", async () => {
            const fgaClient = new OpenFgaClient(testConfig);
            const requestBody = { name: "Patched Store" };

            nock(basePath)
                .patch(`/stores/${OPENFGA_STORE_ID}`, requestBody)
                .reply(200, { success: true });

            const result = await fgaClient.apiExecutor<any>({
                operationName: "PatchStore",
                method: "PATCH",
                path: `/stores/${OPENFGA_STORE_ID}`,
                body: requestBody,
            });

            expect(result.success).toBe(true);
        });
    });

    describe("custom headers", () => {
        it("should include headers from request params", async () => {
            const fgaClient = new OpenFgaClient(testConfig);

            nock(basePath, {
                reqheaders: {
                    "X-Custom-Header": "custom-value",
                },
            })
                .get("/stores")
                .reply(200, {});

            await fgaClient.apiExecutor({
                operationName: "ListStores",
                method: "GET",
                path: "/stores",
                headers: { "X-Custom-Header": "custom-value" },
            });

            // If we get here without error, the custom header was correctly applied
            expect(true).toBe(true);
        });

        it("should include headers from options (backward compatible)", async () => {
            const fgaClient = new OpenFgaClient(testConfig);

            nock(basePath, {
                reqheaders: {
                    "X-Custom-Header": "custom-value",
                },
            })
                .get("/stores")
                .reply(200, {});

            await fgaClient.apiExecutor(
                {
                    operationName: "ListStores",
                    method: "GET",
                    path: "/stores",
                },
                {
                    headers: { "X-Custom-Header": "custom-value" },
                }
            );

            // If we get here without error, the custom header was correctly applied
            expect(true).toBe(true);
        });

        it("should let options.headers override request.headers for the same key", async () => {
            const fgaClient = new OpenFgaClient(testConfig);

            nock(basePath, {
                reqheaders: {
                    "X-Version": "options-wins",
                },
            })
                .get("/stores")
                .reply(200, {});

            await fgaClient.apiExecutor(
                {
                    operationName: "ListStores",
                    method: "GET",
                    path: "/stores",
                    headers: { "X-Version": "request-value" },
                },
                {
                    headers: { "X-Version": "options-wins" },
                }
            );

            expect(true).toBe(true);
        });
    });

    describe("error handling", () => {
        it("should throw FgaApiNotFoundError for 404 responses", async () => {
            const fgaClient = new OpenFgaClient(testConfig);

            nock(basePath)
                .get("/nonexistent-endpoint")
                .reply(404, {
                    code: "undefined_endpoint",
                    message: "Not found",
                });

            await expect(
                fgaClient.apiExecutor({
                    operationName: "GetNonexistent",
                    method: "GET",
                    path: "/nonexistent-endpoint",
                })
            ).rejects.toThrow(FgaApiNotFoundError);
        });

        it("should throw FgaApiValidationError for 400 responses", async () => {
            const fgaClient = new OpenFgaClient(testConfig);

            nock(basePath)
                .post("/stores")
                .reply(400, {
                    code: "validation_error",
                    message: "Invalid request",
                });

            await expect(
                fgaClient.apiExecutor({
                    operationName: "CreateStore",
                    method: "POST",
                    path: "/stores",
                    body: { invalid: "data" },
                })
            ).rejects.toThrow(FgaApiValidationError);
        });
    });


});

describe("OpenFgaClient.apiExecutor - path parameters", () => {
    const basePath = defaultConfiguration.getBasePath();
    const testConfig: UserClientConfigurationParams = {
        ...baseConfig,
        credentials: { method: CredentialsMethod.None }
    };

    beforeAll(() => {
        nock.restore();
        nock.cleanAll();
        nock.activate();
        nock.disableNetConnect();
    });

    afterEach(() => {
        nock.cleanAll();
    });

    afterAll(() => {
        nock.restore();
    });

    describe("path parameter replacement", () => {
        it("should replace path parameters with values (single_parameter)", async () => {
            const fgaClient = new OpenFgaClient(testConfig);
            const storeId = "01ARZ3NDEKTSV4RRFFQ69G5FAV";
            const responseData = { id: storeId, name: "Test Store" };

            nock(basePath)
                .get(`/stores/${storeId}`)
                .reply(200, responseData);

            const result = await fgaClient.apiExecutor<any>({
                operationName: "GetStore",
                method: "GET",
                path: "/stores/{store_id}",
                pathParams: { store_id: storeId },
            });

            expect(result.id).toBe(storeId);
        });

        it("should replace multiple path parameters (multiple_parameters)", async () => {
            const fgaClient = new OpenFgaClient(testConfig);
            const storeId = "store-123";
            const modelId = "model-456";
            const responseData = { id: modelId };

            nock(basePath)
                .get(`/stores/${storeId}/authorization-models/${modelId}`)
                .reply(200, responseData);

            const result = await fgaClient.apiExecutor<any>({
                operationName: "GetAuthorizationModel",
                method: "GET",
                path: "/stores/{store_id}/authorization-models/{model_id}",
                pathParams: { store_id: storeId, model_id: modelId },
            });

            expect(result.id).toBe(modelId);
        });

        it("should URL-encode path parameter values with spaces (parameter_with_special_characters)", async () => {
            const fgaClient = new OpenFgaClient(testConfig);
            const storeId = "store id with spaces";
            const encodedStoreId = "store%20id%20with%20spaces";

            nock(basePath)
                .get(`/stores/${encodedStoreId}`)
                .reply(200, { id: storeId });

            const result = await fgaClient.apiExecutor<any>({
                operationName: "GetStore",
                method: "GET",
                path: "/stores/{store_id}",
                pathParams: { store_id: storeId },
            });

            expect(result.id).toBe(storeId);
        });

        it("should URL-encode path parameter values with URL-unsafe characters (parameter_with_url_unsafe_characters)", async () => {
            const fgaClient = new OpenFgaClient(testConfig);
            const id = "test/with?special&chars";
            const encodedId = encodeURIComponent(id);

            // Use regex matching to handle URL-encoded special characters properly
            nock(basePath)
                .get(new RegExp(`/items/${encodedId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
                .reply(200, { id: id });

            const result = await fgaClient.apiExecutor<any>({
                operationName: "GetItem",
                method: "GET",
                path: "/items/{id}",
                pathParams: { id: id },
            });

            expect(result.id).toBe(id);
        });

        it("should URL-encode unicode characters in path parameters (parameter_with_unicode)", async () => {
            const fgaClient = new OpenFgaClient(testConfig);
            const name = "用户";
            const encodedName = encodeURIComponent(name); // %E7%94%A8%E6%88%B7

            // Use regex matching to handle URL-encoded unicode characters properly
            nock(basePath)
                .get(new RegExp(`/users/${encodedName}`))
                .reply(200, { name: name });

            const result = await fgaClient.apiExecutor<any>({
                operationName: "GetUser",
                method: "GET",
                path: "/users/{name}",
                pathParams: { name: name },
            });

            expect(result.name).toBe(name);
        });

        it("should ignore unused path parameters (unused_parameters_ignored)", async () => {
            const fgaClient = new OpenFgaClient(testConfig);
            const storeId = "123";

            nock(basePath)
                .get(`/stores/${storeId}`)
                .reply(200, { id: storeId });

            const result = await fgaClient.apiExecutor<any>({
                operationName: "GetStore",
                method: "GET",
                path: "/stores/{store_id}",
                pathParams: {
                    store_id: storeId,
                    unused: "value" // Should be ignored
                },
            });

            expect(result.id).toBe(storeId);
        });

        it("should replace parameter appearing multiple times in path (parameter_appears_multiple_times)", async () => {
            const fgaClient = new OpenFgaClient(testConfig);
            const id = "abc";

            nock(basePath)
                .get(`/stores/${id}/check/${id}`)
                .reply(200, { id: id });

            const result = await fgaClient.apiExecutor<any>({
                operationName: "CustomCheck",
                method: "GET",
                path: "/stores/{id}/check/{id}",
                pathParams: { id: id },
            });

            expect(result.id).toBe(id);
        });

        it("should allow empty parameter value (empty_parameter_value)", async () => {
            const fgaClient = new OpenFgaClient(testConfig);

            nock(basePath)
                .get("/stores/")
                .reply(200, { id: "" });

            const result = await fgaClient.apiExecutor<any>({
                operationName: "GetStore",
                method: "GET",
                path: "/stores/{store_id}",
                pathParams: { store_id: "" },
            });

            expect(result.id).toBe("");
        });

        it("should work without pathParams for paths with no template (no_parameters)", async () => {
            const fgaClient = new OpenFgaClient(testConfig);

            nock(basePath)
                .get("/stores")
                .reply(200, { stores: [] });

            const result = await fgaClient.apiExecutor<any>({
                operationName: "ListStores",
                method: "GET",
                path: "/stores",
            });

            expect(result.stores).toEqual([]);
        });

        it("should throw error for unresolved path parameters", async () => {
            const fgaClient = new OpenFgaClient(testConfig);

            await expect(
                fgaClient.apiExecutor({
                    operationName: "CustomCheck",
                    method: "GET",
                    path: "/stores/{store_id}/check",
                    // pathParams intentionally omitted
                })
            ).rejects.toThrow("Path parameter 'store_id' was not provided for path: /stores/{store_id}/check");
        });

        it("should throw error when some path parameters are missing", async () => {
            const fgaClient = new OpenFgaClient(testConfig);

            await expect(
                fgaClient.apiExecutor({
                    operationName: "GetAuthorizationModel",
                    method: "GET",
                    path: "/stores/{store_id}/authorization-models/{model_id}",
                    pathParams: { store_id: "abc" }, // model_id is missing
                })
            ).rejects.toThrow("Path parameter 'model_id' was not provided");
        });
    });

    describe("operationName for telemetry", () => {
        it("should accept operationName parameter", async () => {
            const fgaClient = new OpenFgaClient(testConfig);

            nock(basePath)
                .get("/stores")
                .reply(200, { stores: [] });

            // Should complete without error when operationName is provided
            const result = await fgaClient.apiExecutor<any>({
                operationName: "CustomListStores",
                method: "GET",
                path: "/stores",
            });

            expect(result.stores).toEqual([]);
        });

        it("should use the provided operationName for the request", async () => {
            const fgaClient = new OpenFgaClient(testConfig);

            nock(basePath)
                .get("/stores")
                .reply(200, { stores: [] });

            const result = await fgaClient.apiExecutor<any>({
                operationName: "ListStores",
                method: "GET",
                path: "/stores",
            });

            expect(result.stores).toEqual([]);
        });
    });
});
