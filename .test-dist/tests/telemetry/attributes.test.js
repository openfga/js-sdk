"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const attributes_1 = require("../../telemetry/attributes");
const node_test_1 = require("node:test");
const expect_1 = require("../helpers/expect");
(0, node_test_1.describe)("TelemetryAttributes", () => {
    (0, node_test_1.test)("should prepare attributes correctly", () => {
        const attributes = {
            "fga-client.request.client_id": "test-client-id",
            "http.host": "example.com",
        };
        const filter = new Set([attributes_1.TelemetryAttribute.FgaClientRequestClientId]);
        const prepared = attributes_1.TelemetryAttributes.prepare(attributes, filter);
        (0, expect_1.expect)(prepared).toEqual({ "fga-client.request.client_id": "test-client-id" });
    });
    (0, node_test_1.test)("should return an empty object when attributes is provided but filter is undefined", () => {
        const attributes = {
            [attributes_1.TelemetryAttribute.HttpHost]: "example.com",
            [attributes_1.TelemetryAttribute.HttpResponseStatusCode]: 200,
        };
        (0, expect_1.expect)(attributes_1.TelemetryAttributes.prepare(attributes)).toEqual({});
    });
    (0, node_test_1.test)("should return an empty object when filter is provided but attributes is undefined", () => {
        const filter = new Set([
            attributes_1.TelemetryAttribute.HttpHost,
        ]);
        (0, expect_1.expect)(attributes_1.TelemetryAttributes.prepare(undefined, filter)).toEqual({});
    });
    (0, node_test_1.test)("should return an empty object when none of the attributes are in the filter set", () => {
        const attributes = {
            [attributes_1.TelemetryAttribute.HttpHost]: "example.com",
            [attributes_1.TelemetryAttribute.HttpResponseStatusCode]: 200,
        };
        const filter = new Set([
            attributes_1.TelemetryAttribute.UserAgentOriginal,
        ]);
        (0, expect_1.expect)(attributes_1.TelemetryAttributes.prepare(attributes, filter)).toEqual({});
    });
    (0, node_test_1.test)("should create attributes from request correctly", () => {
        const result = attributes_1.TelemetryAttributes.fromRequest({
            userAgent: "Mozilla/5.0",
            fgaMethod: "GET",
            httpMethod: "POST",
            url: "https://example.com",
            resendCount: 2,
            start: 1000,
            credentials: { method: "client_credentials", configuration: { clientId: "client-id" } },
        });
        (0, expect_1.expect)(result["user_agent.original"]).toEqual("Mozilla/5.0");
        (0, expect_1.expect)(result["fga-client.request.method"]).toEqual("GET");
        (0, expect_1.expect)(result["http.request.method"]).toEqual("POST");
        (0, expect_1.expect)(result["http.host"]).toEqual("example.com");
        (0, expect_1.expect)(result["url.scheme"]).toEqual("https");
    });
    (0, node_test_1.test)("should create attributes from response correctly", () => {
        const response = { status: 200, headers: { "openfga-authorization-model-id": "model-id", "fga-query-duration-ms": "10" } };
        const result = attributes_1.TelemetryAttributes.fromResponse({ response });
        // Verify line 90 is covered - status is correctly set
        (0, expect_1.expect)(result["http.response.status_code"]).toEqual(200);
        (0, expect_1.expect)(result["fga-client.response.model_id"]).toEqual("model-id");
        (0, expect_1.expect)(result["http.server.request.duration"]).toEqual(10);
    });
    (0, node_test_1.test)("should handle response without status correctly", () => {
        const response = { headers: { "openfga-authorization-model-id": "model-id", "fga-query-duration-ms": "10" } };
        const result = attributes_1.TelemetryAttributes.fromResponse({ response });
        // Verify that no status code is set when response does not have a status
        (0, expect_1.expect)(result["http.response.status_code"]).toBeUndefined();
        (0, expect_1.expect)(result["fga-client.response.model_id"]).toEqual("model-id");
        (0, expect_1.expect)(result["http.server.request.duration"]).toEqual(10);
    });
    (0, node_test_1.test)("should create attributes from a request body correctly", () => {
        const body = { authorization_model_id: "model-id", tuple_key: { user: "user:anne" } };
        const attributes = attributes_1.TelemetryAttributes.fromRequestBody(body);
        (0, expect_1.expect)(attributes[attributes_1.TelemetryAttribute.FgaClientRequestModelId]).toEqual("model-id");
        (0, expect_1.expect)(attributes[attributes_1.TelemetryAttribute.FgaClientUser]).toEqual("user:anne");
    });
    (0, node_test_1.test)("should create attributes from a request body without tuple_key", () => {
        const body = { authorization_model_id: "model-id" };
        const attributes = attributes_1.TelemetryAttributes.fromRequestBody(body);
        (0, expect_1.expect)(attributes[attributes_1.TelemetryAttribute.FgaClientRequestModelId]).toEqual("model-id");
        (0, expect_1.expect)(attributes[attributes_1.TelemetryAttribute.FgaClientUser]).toBeUndefined();
    });
    (0, node_test_1.test)("should create attributes from a batchCheck request body correctly", () => {
        const body = {
            authorization_model_id: "model-id",
            checks: [
                {
                    tuple_key: {
                        user: "user:anne",
                        object: "doc:123",
                        relation: "can_view"
                    }
                },
                {
                    tuple_key: {
                        user: "user:anne",
                        object: "doc:789",
                        relation: "can_view"
                    }
                }
            ]
        };
        const attributes = attributes_1.TelemetryAttributes.fromRequestBody(body);
        (0, expect_1.expect)(attributes[attributes_1.TelemetryAttribute.FgaClientRequestModelId]).toEqual("model-id");
        (0, expect_1.expect)(attributes[attributes_1.TelemetryAttribute.FgaClientRequestBatchCheckSize]).toEqual(2);
    });
});
//# sourceMappingURL=attributes.test.js.map