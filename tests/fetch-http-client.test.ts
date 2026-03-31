import { attemptHttpRequest, HttpClient, FgaResponse } from "../common";
import SdkConstants from "../constants";
import {
  FgaError,
  FgaApiValidationError,
  FgaApiAuthenticationError,
  FgaApiNotFoundError,
  FgaApiRateLimitExceededError,
  FgaApiInternalError,
  FgaApiError,
} from "../errors";
import { OpenFgaClient } from "../client";

function mockHttpClient(
  fetchImpl: (url: string | URL | Request, init?: RequestInit) => Promise<Response>,
  opts?: { defaultHeaders?: Record<string, string>; defaultTimeout?: number }
): HttpClient {
  return {
    fetch: fetchImpl as typeof globalThis.fetch,
    defaultHeaders: opts?.defaultHeaders,
    defaultTimeout: opts?.defaultTimeout ?? 10000,
  };
}

function mockResponse(
  status: number,
  body?: any,
  opts?: { statusText?: string; headers?: Record<string, string> }
): Response {
  const headers = new Headers(opts?.headers ?? { "content-type": "application/json" });
  const bodyStr = body !== undefined ? JSON.stringify(body) : null;
  return new Response(bodyStr, {
    status,
    statusText: opts?.statusText ?? "OK",
    headers,
  });
}

describe("fetch-based HTTP client", () => {
  describe("attemptHttpRequest", () => {
    describe("FgaResponse shape", () => {
      it("should return a well-formed FgaResponse on success", async () => {
        const responseBody = { allowed: true };
        const client = mockHttpClient(async () =>
          mockResponse(200, responseBody, {
            statusText: "OK",
            headers: {
              "content-type": "application/json",
              "x-request-id": "abc-123",
              "fga-query-duration-ms": "42",
            },
          })
        );

        const result = await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/stores/s1/check`, method: "POST", headers: {}, data: "{}" },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(result).toBeDefined();
        const resp = result!.response!;
        expect(resp.status).toBe(200);
        expect(resp.statusText).toBe("OK");
        expect(resp.headers["x-request-id"]).toBe("abc-123");
        expect(resp.headers["fga-query-duration-ms"]).toBe("42");
        expect(resp.data).toEqual({ allowed: true });
        expect(result!.retries).toBe(0);
      });

      it("should set data to undefined for 204 No Content", async () => {
        const client = mockHttpClient(async () =>
          new Response(null, { status: 204, statusText: "No Content" })
        );

        const result = await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/stores/s1/something`, method: "DELETE", headers: {} },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(result).toBeDefined();
        expect(result!.response!.status).toBe(204);
        expect(result!.response!.data).toBeUndefined();
      });

      it("should set data to undefined when content-length is 0", async () => {
        const client = mockHttpClient(async () =>
          new Response(null, {
            status: 200,
            headers: { "content-length": "0" },
          })
        );

        const result = await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/stores/s1/something`, method: "GET", headers: {} },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(result!.response!.data).toBeUndefined();
      });

      it("should return text for non-JSON content types", async () => {
        const client = mockHttpClient(async () =>
          new Response("plain text body", {
            status: 200,
            headers: { "content-type": "text/plain" },
          })
        );

        const result = await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/something`, method: "GET", headers: {} },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(result!.response!.data).toBe("plain text body");
      });

      it("should return text for text/json content type (not matched by isJsonMime)", async () => {
        const client = mockHttpClient(async () =>
          new Response(JSON.stringify({ key: "value" }), {
            status: 200,
            headers: { "content-type": "text/json" },
          })
        );

        const result = await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/something`, method: "GET", headers: {} },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        // text/json is not recognized by isJsonMime, so it's returned as text
        expect(result!.response!.data).toBe("{\"key\":\"value\"}");
      });

      it("should parse response as JSON for application/vnd.api+json content type", async () => {
        const client = mockHttpClient(async () =>
          new Response(JSON.stringify({ items: [1, 2] }), {
            status: 200,
            headers: { "content-type": "application/vnd.api+json" },
          })
        );

        const result = await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/something`, method: "GET", headers: {} },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(result!.response!.data).toEqual({ items: [1, 2] });
      });

      it("should parse response as JSON for application/json with charset parameter", async () => {
        const client = mockHttpClient(async () =>
          new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "content-type": "application/json; charset=utf-8" },
          })
        );

        const result = await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/something`, method: "GET", headers: {} },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(result!.response!.data).toEqual({ ok: true });
      });

      it("should return the raw body for stream responseType", async () => {
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode("{\"result\":\"ok\"}\n"));
            controller.close();
          },
        });

        const client = mockHttpClient(async () =>
          new Response(stream, {
            status: 200,
            headers: { "content-type": "application/json" },
          })
        );

        const result = await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/stream`, method: "POST", headers: {}, responseType: "stream" },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(result!.response!.status).toBe(200);
        // data should be the ReadableStream itself, not parsed JSON
        expect(result!.response!.data).toBeInstanceOf(ReadableStream);
      });
    });

    describe("case-insensitive header merging", () => {
      it("should merge default and request headers case-insensitively", async () => {
        let capturedHeaders: Record<string, string> | undefined;
        const client = mockHttpClient(
          async (_url, init) => {
            capturedHeaders = init?.headers as Record<string, string>;
            return mockResponse(200, {});
          },
          { defaultHeaders: { "X-Default": "default-val", "Authorization": "Bearer token" } }
        );

        await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/check`, method: "GET", headers: { "x-default": "override-val" } },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(capturedHeaders).toBeDefined();
        expect(capturedHeaders!["x-default"]).toBe("override-val");
        expect(capturedHeaders!["authorization"]).toBe("Bearer token");
        // There should not be duplicate keys with different casing
        expect(Object.keys(capturedHeaders!).filter(k => k.toLowerCase() === "x-default")).toHaveLength(1);
      });

      it("should lowercase all header keys", async () => {
        let capturedHeaders: Record<string, string> | undefined;
        const client = mockHttpClient(
          async (_url, init) => {
            capturedHeaders = init?.headers as Record<string, string>;
            return mockResponse(200, {});
          },
          { defaultHeaders: { "Content-Type": "application/json" } }
        );

        await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/check`, method: "GET", headers: { "Accept": "text/html" } },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(capturedHeaders!["content-type"]).toBe("application/json");
        expect(capturedHeaders!["accept"]).toBe("text/html");
        expect(capturedHeaders!["Content-Type"]).toBeUndefined();
        expect(capturedHeaders!["Accept"]).toBeUndefined();
      });
    });

    describe("timeout", () => {
      it("should pass AbortSignal.timeout to fetch", async () => {
        let capturedSignal: AbortSignal | undefined;
        const client = mockHttpClient(
          async (_url, init) => {
            capturedSignal = init?.signal as AbortSignal;
            return mockResponse(200, {});
          },
          { defaultTimeout: 5000 }
        );

        await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/check`, method: "GET", headers: {} },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(capturedSignal).toBeDefined();
        expect(capturedSignal).toBeInstanceOf(AbortSignal);
      });

      it("should prefer per-request timeout over default", async () => {
        let capturedSignal: AbortSignal | undefined;
        const client = mockHttpClient(
          async (_url, init) => {
            capturedSignal = init?.signal as AbortSignal;
            return mockResponse(200, {});
          },
          { defaultTimeout: 30000 }
        );

        await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/check`, method: "GET", headers: {}, timeout: 500 },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(capturedSignal).toBeDefined();
        expect(capturedSignal!.aborted).toBe(false);
      });

      it("should classify TimeoutError as retryable network error", async () => {
        let callCount = 0;
        const client = mockHttpClient(async () => {
          callCount++;
          const err = new DOMException("The operation was aborted.", "TimeoutError");
          throw err;
        });

        await expect(
          attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/check`, method: "GET", headers: {} },
            { maxRetry: 1, minWaitInMs: 1 },
            client
          )
        ).rejects.toThrow(FgaError);

        expect(callCount).toBe(2);
      });
    });

    describe("network error classification", () => {
      it("should retry on TypeError (fetch network error)", async () => {
        let callCount = 0;
        const client = mockHttpClient(async () => {
          callCount++;
          throw new TypeError("Failed to fetch");
        });

        await expect(
          attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/check`, method: "POST", headers: {} },
            { maxRetry: 2, minWaitInMs: 1 },
            client
          )
        ).rejects.toThrow(FgaError);

        expect(callCount).toBe(3);
      });

      it("should not retry on generic Error (non-network error)", async () => {
        let callCount = 0;
        const client = mockHttpClient(async () => {
          callCount++;
          throw new Error("Some programming error");
        });

        await expect(
          attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/check`, method: "POST", headers: {} },
            { maxRetry: 3, minWaitInMs: 1 },
            client
          )
        ).rejects.toThrow("Some programming error");

        expect(callCount).toBe(1);
      });

      it("should not retry on RangeError", async () => {
        let callCount = 0;
        const client = mockHttpClient(async () => {
          callCount++;
          throw new RangeError("out of range");
        });

        await expect(
          attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/check`, method: "GET", headers: {} },
            { maxRetry: 3, minWaitInMs: 1 },
            client
          )
        ).rejects.toThrow(FgaError);

        expect(callCount).toBe(1);
      });
    });

    describe("HTTP error classification", () => {
      it("should throw FgaApiValidationError for 400", async () => {
        const client = mockHttpClient(async () =>
          mockResponse(400, { code: "validation_error", message: "bad request" }, { statusText: "Bad Request" })
        );

        await expect(
          attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/stores/s1/check`, method: "POST", headers: {} },
            { maxRetry: 0, minWaitInMs: 100 },
            client
          )
        ).rejects.toThrow(FgaApiValidationError);
      });

      it("should throw FgaApiValidationError for 422", async () => {
        const client = mockHttpClient(async () =>
          mockResponse(422, { code: "unprocessable", message: "invalid" }, { statusText: "Unprocessable Entity" })
        );

        await expect(
          attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/stores/s1/check`, method: "POST", headers: {} },
            { maxRetry: 0, minWaitInMs: 100 },
            client
          )
        ).rejects.toThrow(FgaApiValidationError);
      });

      it("should throw FgaApiAuthenticationError for 401", async () => {
        const client = mockHttpClient(async () =>
          mockResponse(401, { code: "unauthenticated" }, { statusText: "Unauthorized" })
        );

        await expect(
          attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/stores/s1/check`, method: "POST", headers: {} },
            { maxRetry: 0, minWaitInMs: 100 },
            client
          )
        ).rejects.toThrow(FgaApiAuthenticationError);
      });

      it("should throw FgaApiAuthenticationError for 403", async () => {
        const client = mockHttpClient(async () =>
          mockResponse(403, {}, { statusText: "Forbidden" })
        );

        await expect(
          attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/stores/s1/check`, method: "POST", headers: {} },
            { maxRetry: 0, minWaitInMs: 100 },
            client
          )
        ).rejects.toThrow(FgaApiAuthenticationError);
      });

      it("should throw FgaApiNotFoundError for 404", async () => {
        const client = mockHttpClient(async () =>
          mockResponse(404, { code: "not_found", message: "store not found" }, { statusText: "Not Found" })
        );

        await expect(
          attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/stores/s1/check`, method: "POST", headers: {} },
            { maxRetry: 0, minWaitInMs: 100 },
            client
          )
        ).rejects.toThrow(FgaApiNotFoundError);
      });

      it("should throw FgaApiRateLimitExceededError for 429 after exhausting retries", async () => {
        const client = mockHttpClient(async () =>
          mockResponse(429, {}, { statusText: "Too Many Requests" })
        );

        await expect(
          attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/stores/s1/check`, method: "POST", headers: {} },
            { maxRetry: 0, minWaitInMs: 1 },
            client
          )
        ).rejects.toThrow(FgaApiRateLimitExceededError);
      });

      it("should throw FgaApiInternalError for 500 after exhausting retries", async () => {
        const client = mockHttpClient(async () =>
          mockResponse(500, { message: "internal error" }, { statusText: "Internal Server Error" })
        );

        await expect(
          attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/stores/s1/check`, method: "POST", headers: {} },
            { maxRetry: 0, minWaitInMs: 1 },
            client
          )
        ).rejects.toThrow(FgaApiInternalError);
      });

      it("should not retry 501 Not Implemented", async () => {
        let callCount = 0;
        const client = mockHttpClient(async () => {
          callCount++;
          return mockResponse(501, {}, { statusText: "Not Implemented" });
        });

        await expect(
          attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/stores/s1/check`, method: "POST", headers: {} },
            { maxRetry: 3, minWaitInMs: 1 },
            client
          )
        ).rejects.toThrow(FgaApiError);

        expect(callCount).toBe(1);
      });

      it("should include method, URL, and status in generic FgaApiError message for unmapped status", async () => {
        const client = mockHttpClient(async () =>
          mockResponse(501, {}, { statusText: "Not Implemented" })
        );

        try {
          await attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/stores/s1/check`, method: "POST", headers: {} },
            { maxRetry: 0, minWaitInMs: 100 },
            client
          );
          fail("should have thrown");
        } catch (err: any) {
          expect(err).toBeInstanceOf(FgaApiError);
          // Should NOT be one of the specialized subclasses
          expect(err.name).toBe("FgaApiError");
          expect(err.message).toContain("POST");
          expect(err.message).toContain(`${SdkConstants.TestApiUrl}/stores/s1/check`);
          expect(err.message).toContain("501");
          expect(err.message).toContain("Not Implemented");
        }
      });

      it("should populate error context fields from HTTP response", async () => {
        const client = mockHttpClient(async () =>
          mockResponse(400, { code: "validation_error", message: "invalid tuple" }, {
            statusText: "Bad Request",
            headers: {
              "content-type": "application/json",
              "fga-request-id": "req-abc-123",
            },
          })
        );

        try {
          await attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/stores/s1/check`, method: "POST", headers: {}, data: "{\"tuple_key\":{}}" },
            { maxRetry: 0, minWaitInMs: 100 },
            client
          );
          fail("should have thrown");
        } catch (err: any) {
          expect(err).toBeInstanceOf(FgaApiValidationError);
          expect(err.statusCode).toBe(400);
          expect(err.statusText).toBe("Bad Request");
          expect(err.requestURL).toBe(`${SdkConstants.TestApiUrl}/stores/s1/check`);
          expect(err.method).toBe("POST");
          expect(err.apiErrorMessage).toBe("invalid tuple");
          expect(err.requestId).toBe("req-abc-123");
          expect(err.responseData).toEqual({ code: "validation_error", message: "invalid tuple" });
        }
      });

      it("should capture non-JSON error body as text instead of dropping it", async () => {
        const client = mockHttpClient(async () =>
          new Response("plain text error detail", {
            status: 400,
            statusText: "Bad Request",
            headers: { "content-type": "text/plain" },
          })
        );

        try {
          await attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/stores/s1/check`, method: "POST", headers: {} },
            { maxRetry: 0, minWaitInMs: 100 },
            client
          );
          fail("should have thrown");
        } catch (err: any) {
          expect(err).toBeInstanceOf(FgaApiValidationError);
          expect(err.responseData).toBe("plain text error detail");
        }
      });

      it("should parse JSON error body when content-type is application/json", async () => {
        const client = mockHttpClient(async () =>
          new Response(JSON.stringify({ code: "validation_error", message: "bad request" }), {
            status: 400,
            statusText: "Bad Request",
            headers: { "content-type": "application/json" },
          })
        );

        try {
          await attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/stores/s1/check`, method: "POST", headers: {} },
            { maxRetry: 0, minWaitInMs: 100 },
            client
          );
          fail("should have thrown");
        } catch (err: any) {
          expect(err).toBeInstanceOf(FgaApiValidationError);
          expect(err.responseData).toEqual({ code: "validation_error", message: "bad request" });
          expect(err.apiErrorMessage).toBe("bad request");
        }
      });
    });

    describe("retry behavior", () => {
      it("should retry 429 and succeed on subsequent attempt", async () => {
        let callCount = 0;
        const client = mockHttpClient(async () => {
          callCount++;
          if (callCount === 1) {
            return mockResponse(429, {}, { statusText: "Too Many Requests" });
          }
          return mockResponse(200, { allowed: true });
        });

        const result = await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/check`, method: "POST", headers: {} },
          { maxRetry: 2, minWaitInMs: 1 },
          client
        );

        expect(callCount).toBe(2);
        expect(result!.response!.status).toBe(200);
        expect(result!.response!.data).toEqual({ allowed: true });
        expect(result!.retries).toBe(1);
      });

      it("should retry 500 and succeed on subsequent attempt", async () => {
        let callCount = 0;
        const client = mockHttpClient(async () => {
          callCount++;
          if (callCount <= 2) {
            return mockResponse(500, {}, { statusText: "Internal Server Error" });
          }
          return mockResponse(200, { stores: [] });
        });

        const result = await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/stores`, method: "GET", headers: {} },
          { maxRetry: 3, minWaitInMs: 1 },
          client
        );

        expect(callCount).toBe(3);
        expect(result!.response!.status).toBe(200);
        expect(result!.retries).toBe(2);
      });

      it("should not retry 400 errors", async () => {
        let callCount = 0;
        const client = mockHttpClient(async () => {
          callCount++;
          return mockResponse(400, { message: "bad" });
        });

        await expect(
          attemptHttpRequest(
            { url: `${SdkConstants.TestApiUrl}/check`, method: "POST", headers: {} },
            { maxRetry: 3, minWaitInMs: 1 },
            client
          )
        ).rejects.toThrow(FgaApiValidationError);

        expect(callCount).toBe(1);
      });
    });

    describe("request body serialization", () => {
      it("should pass string body as-is", async () => {
        let capturedBody: string | undefined;
        const client = mockHttpClient(async (_url, init) => {
          capturedBody = init?.body as string;
          return mockResponse(200, {});
        });

        await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/check`, method: "POST", headers: {}, data: "already-serialized" },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(capturedBody).toBe("already-serialized");
      });

      it("should JSON-stringify object body", async () => {
        let capturedBody: string | undefined;
        const client = mockHttpClient(async (_url, init) => {
          capturedBody = init?.body as string;
          return mockResponse(200, {});
        });

        await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/check`, method: "POST", headers: {}, data: { key: "value" } },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(capturedBody).toBe("{\"key\":\"value\"}");
      });

      it("should not set body when data is undefined", async () => {
        let capturedBody: BodyInit | null | undefined;
        const client = mockHttpClient(async (_url, init) => {
          capturedBody = init?.body;
          return mockResponse(200, {});
        });

        await attemptHttpRequest(
          { url: `${SdkConstants.TestApiUrl}/stores`, method: "GET", headers: {} },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(capturedBody).toBeUndefined();
      });

      it("should serialize object as form-urlencoded when content-type is application/x-www-form-urlencoded", async () => {
        let capturedBody: string | undefined;
        const client = mockHttpClient(async (_url, init) => {
          capturedBody = init?.body as string;
          return mockResponse(200, {});
        });

        await attemptHttpRequest(
          {
            url: `${SdkConstants.TestApiUrl}/oauth/token`,
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            data: { client_id: "my-id", client_secret: "my-secret", grant_type: "client_credentials" },
          },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(capturedBody).toBeDefined();
        const params = new URLSearchParams(capturedBody!);
        expect(params.get("client_id")).toBe("my-id");
        expect(params.get("client_secret")).toBe("my-secret");
        expect(params.get("grant_type")).toBe("client_credentials");
      });

      it("should serialize URLSearchParams as form-urlencoded when content-type is application/x-www-form-urlencoded", async () => {
        let capturedBody: string | undefined;
        const client = mockHttpClient(async (_url, init) => {
          capturedBody = init?.body as string;
          return mockResponse(200, {});
        });

        const formData = new URLSearchParams();
        formData.append("client_id", "my-id");
        formData.append("scope", "openid");

        await attemptHttpRequest(
          {
            url: `${SdkConstants.TestApiUrl}/oauth/token`,
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            data: formData,
          },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(capturedBody).toBeDefined();
        const params = new URLSearchParams(capturedBody!);
        expect(params.get("client_id")).toBe("my-id");
        expect(params.get("scope")).toBe("openid");
      });

      it("should skip null and undefined values in form-urlencoded serialization", async () => {
        let capturedBody: string | undefined;
        const client = mockHttpClient(async (_url, init) => {
          capturedBody = init?.body as string;
          return mockResponse(200, {});
        });

        await attemptHttpRequest(
          {
            url: `${SdkConstants.TestApiUrl}/oauth/token`,
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            data: { client_id: "my-id", optional_field: null, another: undefined, keep: "yes" },
          },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(capturedBody).toBeDefined();
        const params = new URLSearchParams(capturedBody!);
        expect(params.get("client_id")).toBe("my-id");
        expect(params.get("keep")).toBe("yes");
        expect(params.has("optional_field")).toBe(false);
        expect(params.has("another")).toBe(false);
      });

      it("should JSON-stringify object body when content-type is text/json", async () => {
        let capturedBody: string | undefined;
        const client = mockHttpClient(async (_url, init) => {
          capturedBody = init?.body as string;
          return mockResponse(200, {});
        });

        await attemptHttpRequest(
          {
            url: `${SdkConstants.TestApiUrl}/check`,
            method: "POST",
            headers: { "Content-Type": "text/json" },
            data: { key: "value" },
          },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(capturedBody).toBe("{\"key\":\"value\"}");
      });

      it("should JSON-stringify object body when content-type is application/vnd.api+json", async () => {
        let capturedBody: string | undefined;
        const client = mockHttpClient(async (_url, init) => {
          capturedBody = init?.body as string;
          return mockResponse(200, {});
        });

        await attemptHttpRequest(
          {
            url: `${SdkConstants.TestApiUrl}/check`,
            method: "POST",
            headers: { "Content-Type": "application/vnd.api+json" },
            data: { key: "value" },
          },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(capturedBody).toBe("{\"key\":\"value\"}");
      });

      it("should default to JSON serialization when content-type is absent", async () => {
        let capturedBody: string | undefined;
        const client = mockHttpClient(async (_url, init) => {
          capturedBody = init?.body as string;
          return mockResponse(200, {});
        });

        await attemptHttpRequest(
          {
            url: `${SdkConstants.TestApiUrl}/check`,
            method: "POST",
            headers: {},
            data: { key: "value" },
          },
          { maxRetry: 0, minWaitInMs: 100 },
          client
        );

        expect(capturedBody).toBe("{\"key\":\"value\"}");
      });
    });
  });

  describe("custom HttpClient injection", () => {
    it("should use a custom fetch function passed via HttpClient", async () => {
      let fetchCalled = false;
      const customClient = mockHttpClient(async () => {
        fetchCalled = true;
        return mockResponse(200, { allowed: true });
      });

      const result = await attemptHttpRequest(
        { url: `${SdkConstants.TestApiUrl}/check`, method: "POST", headers: {} },
        { maxRetry: 0, minWaitInMs: 100 },
        customClient
      );

      expect(fetchCalled).toBe(true);
      expect(result!.response!.data).toEqual({ allowed: true });
    });

    it("should apply defaultHeaders from HttpClient", async () => {
      let capturedHeaders: Record<string, string> | undefined;
      const customClient = mockHttpClient(
        async (_url, init) => {
          capturedHeaders = init?.headers as Record<string, string>;
          return mockResponse(200, {});
        },
        { defaultHeaders: { "x-custom-sdk-header": "custom-value" } }
      );

      await attemptHttpRequest(
        { url: `${SdkConstants.TestApiUrl}/check`, method: "GET", headers: {} },
        { maxRetry: 0, minWaitInMs: 100 },
        customClient
      );

      expect(capturedHeaders!["x-custom-sdk-header"]).toBe("custom-value");
    });

    it("should pass custom HttpClient to OpenFgaClient constructor", async () => {
      let fetchCallCount = 0;
      const customClient: HttpClient = {
        fetch: (async (url: string) => {
          fetchCallCount++;
          return mockResponse(200, { stores: [], continuation_token: "" });
        }) as typeof globalThis.fetch,
        defaultTimeout: 5000,
      };

      const fgaClient = new OpenFgaClient(
        {
          apiUrl: SdkConstants.TestApiUrl,
          credentials: { method: "none" as any },
        },
        customClient
      );

      const result = await fgaClient.listStores();
      expect(fetchCallCount).toBe(1);
      expect(result.stores).toEqual([]);
    });
  });
});
