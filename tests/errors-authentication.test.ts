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
    });
  });
});
