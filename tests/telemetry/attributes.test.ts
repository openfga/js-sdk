import { TelemetryAttribute, TelemetryAttributes } from "../../telemetry/attributes";

describe("TelemetryAttributes", () => {

  test("should prepare attributes correctly", () => {
    const attributes = {
      "fga-client.request.client_id": "test-client-id",
      "http.host": "example.com",
    };

    const filter = new Set<TelemetryAttribute>([TelemetryAttribute.FgaClientRequestClientId]);
    const prepared = TelemetryAttributes.prepare(attributes, filter);

    expect(prepared).toEqual({ "fga-client.request.client_id": "test-client-id" });
  });

  test("should return an empty object when attributes is provided but filter is undefined", () => {
    const attributes = {
      [TelemetryAttribute.HttpHost]: "example.com",
      [TelemetryAttribute.HttpResponseStatusCode]: 200,
    };
    expect(TelemetryAttributes.prepare(attributes)).toEqual({});
  });

  test("should return an empty object when filter is provided but attributes is undefined", () => {
    const filter = new Set<TelemetryAttribute>([
      TelemetryAttribute.HttpHost,
    ]);
    expect(TelemetryAttributes.prepare(undefined, filter)).toEqual({});
  });

  test("should return an empty object when none of the attributes are in the filter set", () => {
    const attributes = {
      [TelemetryAttribute.HttpHost]: "example.com",
      [TelemetryAttribute.HttpResponseStatusCode]: 200,
    };
    const filter = new Set<TelemetryAttribute>([
      TelemetryAttribute.UserAgentOriginal,
    ]);
    expect(TelemetryAttributes.prepare(attributes, filter)).toEqual({});
  });

  test("should create attributes from request correctly", () => {
    const result = TelemetryAttributes.fromRequest({
      userAgent: "Mozilla/5.0",
      fgaMethod: "GET",
      httpMethod: "POST",
      url: "https://example.com",
      resendCount: 2,
      start: 1000,
      credentials: { method: "client_credentials", configuration: { clientId: "client-id" } },
    });

    expect(result["user_agent.original"]).toEqual("Mozilla/5.0");
    expect(result["fga-client.request.method"]).toEqual("GET");
    expect(result["http.request.method"]).toEqual("POST");
    expect(result["http.host"]).toEqual("example.com");
    expect(result["url.scheme"]).toEqual("https:");
  });

  test("should create attributes from response correctly", () => {
    const response = { status: 200, headers: { "openfga-authorization-model-id": "model-id", "fga-query-duration-ms": "10" } };
    const result = TelemetryAttributes.fromResponse({ response });

    // Verify line 90 is covered - status is correctly set
    expect(result["http.response.status_code"]).toEqual(200);
    expect(result["fga-client.response.model_id"]).toEqual("model-id");
    expect(result["http.server.request.duration"]).toEqual("10");
  });

  test("should handle response without status correctly", () => {
    const response = { headers: { "openfga-authorization-model-id": "model-id", "fga-query-duration-ms": "10" } };
    const result = TelemetryAttributes.fromResponse({ response });

    // Verify that no status code is set when response does not have a status
    expect(result["http.response.status_code"]).toBeUndefined();
    expect(result["fga-client.response.model_id"]).toEqual("model-id");
    expect(result["http.server.request.duration"]).toEqual("10");
  });

  test("should create attributes from response with client credentials", () => {
    const response = { status: 200, headers: {} };
    const credentials = { method: "client_credentials", configuration: { clientId: "client-id" } };
    const result = TelemetryAttributes.fromResponse({ response, credentials });

    // Check that the client ID is set correctly from the credentials
    expect(result["http.response.status_code"]).toEqual(200);
    expect(result["fga-client.request.client_id"]).toEqual("client-id");
  });
});
