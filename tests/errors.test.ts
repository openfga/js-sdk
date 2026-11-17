import { FgaError, FgaApiError } from "../errors";
import { describe, test } from "node:test";
import { expect } from "./helpers/expect";
import {
  OPENFGA_API_AUDIENCE,
  OPENFGA_API_TOKEN_ISSUER,
  OPENFGA_API_URL,
  OPENFGA_CLIENT_ASSERTION_SIGNING_KEY,
  OPENFGA_CLIENT_ID,
  OPENFGA_CLIENT_SECRET,
  OPENFGA_STORE_ID,
} from "./helpers/default-config";

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
    const formHeaders = { "Content-Type": "application/x-www-form-urlencoded" };

    test("should redact client_secret from URL-encoded requestData and keep it serializable", () => {
      const audience = encodeURIComponent(OPENFGA_API_AUDIENCE);
      const axiosError = {
        response: { status: 400, statusText: "Bad Request", data: {}, headers: {} },
        config: {
          url: `https://${OPENFGA_API_TOKEN_ISSUER}/oauth/token`,
          method: "post",
          headers: formHeaders,
          data: `client_id=${OPENFGA_CLIENT_ID}&client_secret=${OPENFGA_CLIENT_SECRET}&audience=${audience}&grant_type=client_credentials`,
        },
        request: { path: "" },
      } as any;

      const err = new FgaApiError(axiosError);

      expect(err.requestData).toBe(`client_id=${OPENFGA_CLIENT_ID}&client_secret=[REDACTED]&audience=${audience}&grant_type=client_credentials`);
      expect(Object.keys(err).includes("requestData")).toBe(true);
      expect(JSON.stringify(err).includes(OPENFGA_CLIENT_SECRET)).toBe(false);
    });

    test("should redact client_secret from object requestData and keep it serializable", () => {
      const axiosError = {
        response: { status: 400, statusText: "Bad Request", data: {}, headers: {} },
        config: {
          url: `https://${OPENFGA_API_TOKEN_ISSUER}/oauth/token`,
          method: "post",
          headers: formHeaders,
          data: { client_id: OPENFGA_CLIENT_ID, client_secret: OPENFGA_CLIENT_SECRET, audience: OPENFGA_API_AUDIENCE },
        },
        request: { path: "" },
      } as any;

      const err = new FgaApiError(axiosError);

      expect((err.requestData as any).client_secret).toBe("[REDACTED]");
      expect((err.requestData as any).client_id).toBe(OPENFGA_CLIENT_ID);
      expect((err.requestData as any).audience).toBe(OPENFGA_API_AUDIENCE);
      expect(Object.keys(err).includes("requestData")).toBe(true);
      expect(JSON.stringify(err).includes(OPENFGA_CLIENT_SECRET)).toBe(false);
    });

    test("should redact client_assertion from URL-encoded requestData", () => {
      const encodedKey = encodeURIComponent(OPENFGA_CLIENT_ASSERTION_SIGNING_KEY);
      const audience = encodeURIComponent(OPENFGA_API_AUDIENCE);
      const axiosError = {
        response: { status: 401, statusText: "Unauthorized", data: {}, headers: {} },
        config: {
          url: `https://${OPENFGA_API_TOKEN_ISSUER}/oauth/token`,
          method: "post",
          headers: formHeaders,
          data: `client_id=${OPENFGA_CLIENT_ID}&client_assertion=${encodedKey}&audience=${audience}`,
        },
        request: { path: "" },
      } as any;

      const err = new FgaApiError(axiosError);

      expect(err.requestData).toBe(`client_id=${OPENFGA_CLIENT_ID}&client_assertion=[REDACTED]&audience=${audience}`);
      expect(JSON.stringify(err).includes(encodedKey)).toBe(false);
    });

    test("should redact fields that are not allow-listed, so an unknown credential cannot leak", () => {
      const axiosError = {
        response: { status: 401, statusText: "Unauthorized", data: {}, headers: {} },
        config: {
          url: `https://${OPENFGA_API_TOKEN_ISSUER}/oauth/token`,
          method: "post",
          headers: formHeaders,
          data: `grant_type=client_credentials&client_id=${OPENFGA_CLIENT_ID}&scope=read&custom_signing_secret=super-secret&refresh_token=rt-123&bare_field`,
        },
        request: { path: "" },
      } as any;

      const err = new FgaApiError(axiosError);

      expect(err.requestData).toBe(`grant_type=client_credentials&client_id=${OPENFGA_CLIENT_ID}&scope=read&custom_signing_secret=[REDACTED]&refresh_token=[REDACTED]&bare_field=[REDACTED]`);
      expect(JSON.stringify(err).includes("super-secret")).toBe(false);
      expect(JSON.stringify(err).includes("rt-123")).toBe(false);
    });

    test("should keep JSON API request bodies as-is", () => {
      const body = JSON.stringify({ tuple_key: { user: "user:anne", relation: "reader", object: "document:1" } });
      const axiosError = {
        response: { status: 400, statusText: "Bad Request", data: {}, headers: {} },
        config: {
          url: `${OPENFGA_API_URL}/stores/${OPENFGA_STORE_ID}/check`,
          method: "post",
          headers: { "Content-Type": "application/json" },
          data: body,
        },
        request: { path: `/stores/${OPENFGA_STORE_ID}/check` },
      } as any;

      const err = new FgaApiError(axiosError);

      expect(err.requestData).toBe(body);
      expect(Object.keys(err).includes("requestData")).toBe(true);
    });

    test("should drop request data whose content type cannot be determined", () => {
      const axiosError = {
        response: { status: 400, statusText: "Bad Request", data: {}, headers: {} },
        config: {
          url: `https://${OPENFGA_API_TOKEN_ISSUER}/oauth/token`,
          method: "post",
          data: `client_id=${OPENFGA_CLIENT_ID}&client_secret=${OPENFGA_CLIENT_SECRET}`,
        },
        request: { path: "" },
      } as any;

      const err = new FgaApiError(axiosError);

      expect(err.requestData).toBe(undefined);
      expect(JSON.stringify(err).includes(OPENFGA_CLIENT_SECRET)).toBe(false);
    });

    test("should not store request headers containing Authorization", () => {
      const bearerToken = "fga_secret_access_token";
      const axiosError = {
        response: { status: 401, statusText: "Unauthorized", data: {}, headers: {} },
        config: {
          url: `${OPENFGA_API_URL}/stores/${OPENFGA_STORE_ID}/check`,
          method: "post",
          data: JSON.stringify({ tuple_key: { user: "user:anne", relation: "reader", object: "document:1" } }),
          headers: { Authorization: `Bearer ${bearerToken}` },
        },
        request: { path: `/stores/${OPENFGA_STORE_ID}/check` },
      } as any;

      const err = new FgaApiError(axiosError);

      expect(JSON.stringify(err).includes(bearerToken)).toBe(false);
      expect(Object.keys(err).includes("requestHeaders")).toBe(false);
    });
  });
});
