import { FgaApiAuthenticationError, FgaApiError } from "../errors";

describe("errors.ts", () => {
  describe("FgaApiAuthenticationError", () => {
    test("should be an instance of FgaApiError", () => {
      const axiosError = {
        response: {
          status: 401,
          statusText: "Unauthorized",
          data: { code: "auth_error" },
          headers: {},
        },
        config: {
          url: "https://issuer.fga.example/oauth/token",
          method: "post",
          data: JSON.stringify({
            client_id: "client-id",
            audience: "api-audience",
            grant_type: "client_credentials",
          }),
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
      expect(err.requestURL).toBe("https://issuer.fga.example/oauth/token");
      expect(err.clientId).toBe("client-id");
      expect(err.audience).toBe("api-audience");
      expect(err.grantType).toBe("client_credentials");
      expect(err.apiErrorCode).toBe("auth_error");
      expect(err.message).toBe("FGA Authentication Error. Unauthorized");
    });
  });
});
