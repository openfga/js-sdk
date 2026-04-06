import { FgaError, FgaApiError, HttpErrorContext } from "../errors";
import SdkConstants from "../constants";

describe("errors.ts", () => {
  describe("FgaError", () => {
    test("should use explicit message when msg argument is provided", () => {
      const err = new FgaError(new Error("wrapped-error"), "explicit-message");

      expect(err.message).toBe("explicit-message");
    });

    test("should derive message from string err when msg is not provided", () => {
      const err = new FgaError("string-error");

      expect(err.message).toBe("string-error");
    });

    test("should derive message from Error err when msg is not provided", () => {
      const err = new FgaError(new Error("inner"));

      expect(err.message).toBe("FGA Error: inner");
    });

    test("should preserve empty string msg", () => {
      const err = new FgaError(new Error("inner"), "");

      expect(err.message).toBe("");
    });
  });

  describe("FgaApiError", () => {
    test("should produce descriptive message from HttpErrorContext with all fields", () => {
      const ctx: HttpErrorContext = {
        status: 500,
        statusText: "Internal Server Error",
        requestUrl: `${SdkConstants.TestApiUrl}/stores/s1/check`,
        requestMethod: "POST",
      };
      const err = new FgaApiError(ctx);

      expect(err.message).toBe(`FGA API Error: POST ${SdkConstants.TestApiUrl}/stores/s1/check - 500 Internal Server Error`);
    });

    test("should produce descriptive message without statusText", () => {
      const ctx: HttpErrorContext = {
        status: 502,
        requestUrl: `${SdkConstants.TestApiUrl}/stores/s1/check`,
        requestMethod: "GET",
      };
      const err = new FgaApiError(ctx);

      expect(err.message).toBe(`FGA API Error: GET ${SdkConstants.TestApiUrl}/stores/s1/check - 502`);
    });

    test("should use fallback placeholders when HttpErrorContext fields are missing", () => {
      const ctx: HttpErrorContext = {};
      const err = new FgaApiError(ctx);

      expect(err.message).toBe("FGA API Error: Unknown Method Unknown URL - Unknown Status");
    });

    test("should use explicit msg over generated default", () => {
      const ctx: HttpErrorContext = {
        status: 500,
        statusText: "Internal Server Error",
        requestUrl: `${SdkConstants.TestApiUrl}/check`,
        requestMethod: "POST",
      };
      const err = new FgaApiError(ctx, "custom error message");

      expect(err.message).toBe("custom error message");
    });

    test("should use Error message when constructed with Error", () => {
      const inner = new Error("something went wrong");
      const err = new FgaApiError(inner);

      expect(err.message).toBe("FGA Error: something went wrong");
    });

    test("should use explicit msg over Error message", () => {
      const inner = new Error("something went wrong");
      const err = new FgaApiError(inner, "override message");

      expect(err.message).toBe("override message");
    });

    test("should populate context fields from HttpErrorContext", () => {
      const ctx: HttpErrorContext = {
        status: 418,
        statusText: "I'm a teapot",
        requestUrl: `${SdkConstants.TestApiUrl}/stores/s1/check`,
        requestMethod: "POST",
        requestData: { tuple_key: {} },
        data: { message: "api error detail" },
        headers: { "fga-request-id": "req-xyz" },
      };
      const err = new FgaApiError(ctx);

      expect(err.statusCode).toBe(418);
      expect(err.statusText).toBe("I'm a teapot");
      expect(err.requestURL).toBe(`${SdkConstants.TestApiUrl}/stores/s1/check`);
      expect(err.method).toBe("POST");
      expect(err.requestData).toEqual({ tuple_key: {} });
      expect(err.apiErrorMessage).toBe("api error detail");
      expect(err.requestId).toBe("req-xyz");
      expect(err.storeId).toBe("s1");
      expect(err.endpointCategory).toBe("check");
    });
  });
});
