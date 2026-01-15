import * as nock from "nock";

import {
    OpenFgaClient,
    UserClientConfigurationParams,
    FgaApiNotFoundError,
    FgaApiValidationError,
} from "../index";
import { CredentialsMethod } from "../credentials";
import { baseConfig, OPENFGA_STORE_ID } from "./helpers/default-config";

nock.disableNetConnect();

describe("OpenFgaClient.rawRequest", () => {
    const testConfig: UserClientConfigurationParams = {
        ...baseConfig,
        credentials: { method: CredentialsMethod.None }
    };
    let fgaClient: OpenFgaClient;

    beforeEach(() => {
        fgaClient = new OpenFgaClient(testConfig);
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe("GET requests", () => {
        it("should make GET requests successfully", async () => {
            const responseData = { stores: [{ id: "store-1", name: "Test Store" }] };

            nock(testConfig.apiUrl!)
                .get("/stores")
                .reply(200, responseData);

            const result = await fgaClient.rawRequest({
                method: "GET",
                path: "/stores",
            });

            expect(result.stores).toEqual(responseData.stores);
        });

        it("should include query parameters in GET requests", async () => {
            const responseData = { stores: [] };

            nock(testConfig.apiUrl!)
                .get("/stores")
                .query({ page_size: 10, name: "test" })
                .reply(200, responseData);

            const result = await fgaClient.rawRequest({
                method: "GET",
                path: "/stores",
                queryParams: { page_size: 10, name: "test" },
            });

            expect(result.stores).toEqual([]);
        });

        it("should return $response with the full Axios response", async () => {
            const responseData = { stores: [] };

            nock(testConfig.apiUrl!)
                .get("/stores")
                .reply(200, responseData);

            const result = await fgaClient.rawRequest({
                method: "GET",
                path: "/stores",
            });

            expect(result.$response).toBeDefined();
            expect(result.$response.status).toBe(200);
        });
    });

    describe("POST requests", () => {
        it("should make POST requests with body", async () => {
            const requestBody = { name: "New Store" };
            const responseData = { id: "new-store-id", name: "New Store" };

            nock(testConfig.apiUrl!)
                .post("/stores", requestBody)
                .reply(201, responseData);

            const result = await fgaClient.rawRequest({
                method: "POST",
                path: "/stores",
                body: requestBody,
            });

            expect(result.id).toBe("new-store-id");
        });

        it("should set Content-Type header for POST requests with body", async () => {
            const requestBody = { foo: "bar" };

            nock(testConfig.apiUrl!, {
                reqheaders: {
                    "Content-Type": "application/json",
                },
            })
                .post("/stores", requestBody)
                .reply(200, {});

            await fgaClient.rawRequest({
                method: "POST",
                path: "/stores",
                body: requestBody,
            });

            // If we get here without error, the Content-Type header was correctly applied
            expect(true).toBe(true);
        });
    });

    describe("PUT requests", () => {
        it("should make PUT requests with body", async () => {
            const requestBody = { name: "Updated Store" };

            nock(testConfig.apiUrl!)
                .put(`/stores/${OPENFGA_STORE_ID}`, requestBody)
                .reply(200, { success: true });

            const result = await fgaClient.rawRequest({
                method: "PUT",
                path: `/stores/${OPENFGA_STORE_ID}`,
                body: requestBody,
            });

            expect(result.success).toBe(true);
        });
    });

    describe("DELETE requests", () => {
        it("should make DELETE requests", async () => {
            nock(testConfig.apiUrl!)
                .delete(`/stores/${OPENFGA_STORE_ID}`)
                .reply(204, {});

            const result = await fgaClient.rawRequest({
                method: "DELETE",
                path: `/stores/${OPENFGA_STORE_ID}`,
            });

            expect(result.$response.status).toBe(204);
        });
    });

    describe("PATCH requests", () => {
        it("should make PATCH requests with body", async () => {
            const requestBody = { name: "Patched Store" };

            nock(testConfig.apiUrl!)
                .patch(`/stores/${OPENFGA_STORE_ID}`, requestBody)
                .reply(200, { success: true });

            const result = await fgaClient.rawRequest({
                method: "PATCH",
                path: `/stores/${OPENFGA_STORE_ID}`,
                body: requestBody,
            });

            expect(result.success).toBe(true);
        });
    });

    describe("custom headers", () => {
        it("should include custom headers in requests", async () => {
            nock(testConfig.apiUrl!, {
                reqheaders: {
                    "X-Custom-Header": "custom-value",
                },
            })
                .get("/stores")
                .reply(200, {});

            await fgaClient.rawRequest(
                {
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
    });

    describe("error handling", () => {
        it("should throw FgaApiNotFoundError for 404 responses", async () => {
            nock(testConfig.apiUrl!)
                .get("/nonexistent-endpoint")
                .reply(404, {
                    code: "undefined_endpoint",
                    message: "Not found",
                });

            await expect(
                fgaClient.rawRequest({
                    method: "GET",
                    path: "/nonexistent-endpoint",
                })
            ).rejects.toThrow(FgaApiNotFoundError);
        });

        it("should throw FgaApiValidationError for 400 responses", async () => {
            nock(testConfig.apiUrl!)
                .post("/stores")
                .reply(400, {
                    code: "validation_error",
                    message: "Invalid request",
                });

            await expect(
                fgaClient.rawRequest({
                    method: "POST",
                    path: "/stores",
                    body: { invalid: "data" },
                })
            ).rejects.toThrow(FgaApiValidationError);
        });
    });


});

describe("OpenFgaClient.rawRequest - path parameters", () => {
    const testConfig: UserClientConfigurationParams = {
        ...baseConfig,
        credentials: { method: CredentialsMethod.None }
    };
    let fgaClient: OpenFgaClient;

    beforeEach(() => {
        fgaClient = new OpenFgaClient(testConfig);
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe("path parameter replacement", () => {
        it("should replace path parameters with values (single_parameter)", async () => {
            const storeId = "01ARZ3NDEKTSV4RRFFQ69G5FAV";
            const responseData = { id: storeId, name: "Test Store" };

            nock(testConfig.apiUrl!)
                .get(`/stores/${storeId}`)
                .reply(200, responseData);

            const result = await fgaClient.rawRequest({
                method: "GET",
                path: "/stores/{store_id}",
                pathParams: { store_id: storeId },
            });

            expect(result.id).toBe(storeId);
        });

        it("should replace multiple path parameters (multiple_parameters)", async () => {
            const storeId = "store-123";
            const modelId = "model-456";
            const responseData = { id: modelId };

            nock(testConfig.apiUrl!)
                .get(`/stores/${storeId}/authorization-models/${modelId}`)
                .reply(200, responseData);

            const result = await fgaClient.rawRequest({
                method: "GET",
                path: "/stores/{store_id}/authorization-models/{model_id}",
                pathParams: { store_id: storeId, model_id: modelId },
            });

            expect(result.id).toBe(modelId);
        });

        it("should URL-encode path parameter values with spaces (parameter_with_special_characters)", async () => {
            const storeId = "store id with spaces";
            const encodedStoreId = "store%20id%20with%20spaces";

            nock(testConfig.apiUrl!)
                .get(`/stores/${encodedStoreId}`)
                .reply(200, { id: storeId });

            const result = await fgaClient.rawRequest({
                method: "GET",
                path: "/stores/{store_id}",
                pathParams: { store_id: storeId },
            });

            expect(result.id).toBe(storeId);
        });

        it("should URL-encode path parameter values with URL-unsafe characters (parameter_with_url_unsafe_characters)", async () => {
            const id = "test/with?special&chars";
            const encodedId = encodeURIComponent(id);

            // Use regex matching to handle URL-encoded special characters properly
            nock(testConfig.apiUrl!)
                .get(new RegExp(`/items/${encodedId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
                .reply(200, { id: id });

            const result = await fgaClient.rawRequest({
                method: "GET",
                path: "/items/{id}",
                pathParams: { id: id },
            });

            expect(result.id).toBe(id);
        });

        it("should URL-encode unicode characters in path parameters (parameter_with_unicode)", async () => {
            const name = "用户";
            const encodedName = encodeURIComponent(name); // %E7%94%A8%E6%88%B7

            // Use regex matching to handle URL-encoded unicode characters properly
            nock(testConfig.apiUrl!)
                .get(new RegExp(`/users/${encodedName}`))
                .reply(200, { name: name });

            const result = await fgaClient.rawRequest({
                method: "GET",
                path: "/users/{name}",
                pathParams: { name: name },
            });

            expect(result.name).toBe(name);
        });

        it("should ignore unused path parameters (unused_parameters_ignored)", async () => {
            const storeId = "123";

            nock(testConfig.apiUrl!)
                .get(`/stores/${storeId}`)
                .reply(200, { id: storeId });

            const result = await fgaClient.rawRequest({
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
            const id = "abc";

            nock(testConfig.apiUrl!)
                .get(`/stores/${id}/check/${id}`)
                .reply(200, { id: id });

            const result = await fgaClient.rawRequest({
                method: "GET",
                path: "/stores/{id}/check/{id}",
                pathParams: { id: id },
            });

            expect(result.id).toBe(id);
        });

        it("should allow empty parameter value (empty_parameter_value)", async () => {
            nock(testConfig.apiUrl!)
                .get("/stores/")
                .reply(200, { id: "" });

            const result = await fgaClient.rawRequest({
                method: "GET",
                path: "/stores/{store_id}",
                pathParams: { store_id: "" },
            });

            expect(result.id).toBe("");
        });

        it("should work without pathParams for paths with no template (no_parameters)", async () => {
            nock(testConfig.apiUrl!)
                .get("/stores")
                .reply(200, { stores: [] });

            const result = await fgaClient.rawRequest({
                method: "GET",
                path: "/stores",
            });

            expect(result.stores).toEqual([]);
        });

        it("should throw error for unresolved path parameters", async () => {
            await expect(
                fgaClient.rawRequest({
                    method: "GET",
                    path: "/stores/{store_id}/check",
                    // pathParams intentionally omitted
                })
            ).rejects.toThrow("Path parameter 'store_id' was not provided for path: /stores/{store_id}/check");
        });

        it("should throw error when some path parameters are missing", async () => {
            await expect(
                fgaClient.rawRequest({
                    method: "GET",
                    path: "/stores/{store_id}/authorization-models/{model_id}",
                    pathParams: { store_id: "abc" }, // model_id is missing
                })
            ).rejects.toThrow("Path parameter 'model_id' was not provided");
        });
    });

    describe("operationName for telemetry", () => {
        it("should accept operationName parameter", async () => {
            nock(testConfig.apiUrl!)
                .get("/stores")
                .reply(200, { stores: [] });

            // Should complete without error when operationName is provided
            const result = await fgaClient.rawRequest({
                operationName: "CustomListStores",
                method: "GET",
                path: "/stores",
            });

            expect(result.stores).toEqual([]);
        });

        it("should work without operationName (backward compatible)", async () => {
            nock(testConfig.apiUrl!)
                .get("/stores")
                .reply(200, { stores: [] });

            const result = await fgaClient.rawRequest({
                method: "GET",
                path: "/stores",
            });

            expect(result.stores).toEqual([]);
        });
    });
});
