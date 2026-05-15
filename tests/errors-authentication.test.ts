import { FgaApiAuthenticationError, FgaApiError, HttpErrorContext } from "../errors";

describe("errors.ts", () => {
  describe("FgaApiAuthenticationError", () => {
    test("should be an instance of FgaApiError", () => {
      const errorContext: HttpErrorContext = {
        status: 401,
        statusText: "Unauthorized",
        data: { code: "auth_error" },
        headers: {},
        requestUrl: "https://issuer.fga.example/oauth/token",
        requestMethod: "post",
        requestData: JSON.stringify({
          client_id: "client-id",
          audience: "api-audience",
          grant_type: "client_credentials",
        }),
      };

      const err = new FgaApiAuthenticationError(errorContext);

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
