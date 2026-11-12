import { FgaApiAuthenticationError, FgaApiError } from "../errors";
import { describe, test } from "node:test";
import { expect } from "./helpers/expect";
import {
  OPENFGA_API_AUDIENCE,
  OPENFGA_API_TOKEN_ISSUER,
  OPENFGA_CLIENT_ASSERTION_SIGNING_KEY,
  OPENFGA_CLIENT_ID,
  OPENFGA_CLIENT_SECRET,
} from "./helpers/default-config";

describe("errors.ts", () => {
  describe("FgaApiAuthenticationError", () => {
    const formHeaders = { "Content-Type": "application/x-www-form-urlencoded" };

    test("should be an instance of FgaApiError", () => {
      const audience = encodeURIComponent(OPENFGA_API_AUDIENCE);
      const axiosError = {
        response: {
          status: 401,
          statusText: "Unauthorized",
          data: { code: "auth_error" },
          headers: {},
        },
        config: {
          url: `https://${OPENFGA_API_TOKEN_ISSUER}/oauth/token`,
          method: "post",
          headers: formHeaders,
          data: `client_id=${OPENFGA_CLIENT_ID}&audience=${audience}&grant_type=client_credentials`,
        },
        request: {
          path: "/stores/01H0GVCS1HCQM6SJRJ4A026FZ9/check",
        },
      } as any;

      const err = new FgaApiAuthenticationError(axiosError);

      expect(err).toBeInstanceOf(FgaApiError);
      expect(err).toBeInstanceOf(Error);
      expect(err.statusCode).toBe(401);
      expect(err.statusText).toBe("Unauthorized");
      expect(err.requestURL).toBe(`https://${OPENFGA_API_TOKEN_ISSUER}/oauth/token`);
      expect(err.clientId).toBe(OPENFGA_CLIENT_ID);
      expect(err.audience).toBe(OPENFGA_API_AUDIENCE);
      expect(err.grantType).toBe("client_credentials");
      expect(err.apiErrorCode).toBe("auth_error");
      expect(err.message).toBe("FGA Authentication Error. Unauthorized");
    });

    test("should redact client_secret from requestData and keep it serializable", () => {
      const audience = encodeURIComponent(OPENFGA_API_AUDIENCE);
      const axiosError = {
        response: { status: 401, statusText: "Unauthorized", data: {}, headers: {} },
        config: {
          url: `https://${OPENFGA_API_TOKEN_ISSUER}/oauth/token`,
          method: "post",
          headers: formHeaders,
          data: `client_id=${OPENFGA_CLIENT_ID}&client_secret=${OPENFGA_CLIENT_SECRET}&audience=${audience}&grant_type=client_credentials`,
        },
        request: { path: "" },
      } as any;

      const err = new FgaApiAuthenticationError(axiosError);

      expect(err.requestData).toBe(`client_id=${OPENFGA_CLIENT_ID}&client_secret=[REDACTED]&audience=${audience}&grant_type=client_credentials`);
      expect(err.clientId).toBe(OPENFGA_CLIENT_ID);
      expect(err.grantType).toBe("client_credentials");
      expect(Object.keys(err).includes("requestData")).toBe(true);
      expect(JSON.stringify(err).includes(OPENFGA_CLIENT_SECRET)).toBe(false);
    });

    test("should redact client_assertion from requestData and keep it serializable", () => {
      const encodedKey = encodeURIComponent(OPENFGA_CLIENT_ASSERTION_SIGNING_KEY);
      const audience = encodeURIComponent(OPENFGA_API_AUDIENCE);
      const axiosError = {
        response: { status: 401, statusText: "Unauthorized", data: {}, headers: {} },
        config: {
          url: `https://${OPENFGA_API_TOKEN_ISSUER}/oauth/token`,
          method: "post",
          headers: formHeaders,
          data: `client_id=${OPENFGA_CLIENT_ID}&client_assertion=${encodedKey}&client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&audience=${audience}&grant_type=client_credentials`,
        },
        request: { path: "" },
      } as any;

      const err = new FgaApiAuthenticationError(axiosError);

      expect(err.requestData).toBe(`client_id=${OPENFGA_CLIENT_ID}&client_assertion=[REDACTED]&client_assertion_type=[REDACTED]&audience=${audience}&grant_type=client_credentials`);
      expect(err.clientId).toBe(OPENFGA_CLIENT_ID);
      expect(Object.keys(err).includes("requestData")).toBe(true);
      expect(JSON.stringify(err).includes(encodedKey)).toBe(false);
    });
  });
});
