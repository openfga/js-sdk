import * as nock from "nock";

import {
    OpenFgaClient,
    FgaApiNotFoundError,
    FgaApiValidationError,
} from "../index";
import {
    baseConfig,
    defaultConfiguration,
    OPENFGA_API_TOKEN_ISSUER,
    OPENFGA_STORE_ID,
} from "./helpers/default-config";
import { getNocks } from "./helpers/nocks";

const nocks = getNocks(nock);
nock.disableNetConnect();

describe("OpenFgaClient.rawRequest", () => {
    let fgaClient: OpenFgaClient;
    const basePath = defaultConfiguration.getBasePath();

    beforeEach(() => {
        fgaClient = new OpenFgaClient({ ...baseConfig });
        nocks.tokenExchange(OPENFGA_API_TOKEN_ISSUER, "test-token");
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe("GET requests", () => {
        it("should make GET requests successfully", async () => {
            const responseData = { stores: [{ id: "store-1", name: "Test Store" }] };

            nock(basePath)
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

            nock(basePath)
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

            nock(basePath)
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

            nock(basePath)
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

            nock(basePath, {
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

            nock(basePath)
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
            nock(basePath)
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

            nock(basePath)
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
            nock(basePath, {
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
            nock(basePath)
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
            nock(basePath)
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

    describe("authentication", () => {
        it("should include authentication headers", async () => {
            nock(basePath, {
                reqheaders: {
                    Authorization: "Bearer test-token",
                },
            })
                .get("/stores")
                .reply(200, {});

            await fgaClient.rawRequest({
                method: "GET",
                path: "/stores",
            });

            // If we get here without error, the auth header was correctly applied
            expect(true).toBe(true);
        });
    });
});
