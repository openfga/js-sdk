import * as nock from "nock";
import * as jose from "jose";
import { Credentials, CredentialsMethod, DEFAULT_TOKEN_ENDPOINT_PATH } from "../credentials";
import { AuthCredentialsConfig } from "../credentials/types";
import { TelemetryConfiguration } from "../telemetry/configuration";
import {
  OPENFGA_API_AUDIENCE,
  OPENFGA_CLIENT_ASSERTION_SIGNING_KEY,
  OPENFGA_CLIENT_ID,
  OPENFGA_CLIENT_SECRET,
} from "./helpers/default-config";
import {FgaValidationError} from "../errors";

describe("Credentials", () => {
  const mockTelemetryConfig: TelemetryConfiguration = new TelemetryConfiguration({});

  describe("Refreshing access token", () => {
    beforeEach(() => {
      nock.disableNetConnect();
    });

    afterEach(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    test("should use default scheme and token endpoint path when apiTokenIssuer has no scheme and no path", async () => {
      const apiTokenIssuer = "issuer.fga.example";
      const expectedBaseUrl = "https://issuer.fga.example";
      const expectedPath = `/${DEFAULT_TOKEN_ENDPOINT_PATH}`;

      const scope = nock(expectedBaseUrl)
        .post(expectedPath)
        .reply(200, {
          access_token: "test-token",
          expires_in: 300,
        });

      const credentials = new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer,
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientSecret: OPENFGA_CLIENT_SECRET,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      );

      await credentials.getAccessTokenHeader();

      expect(scope.isDone()).toBe(true);
    });

    test("should use default token endpoint path when apiTokenIssuer has root path and no scheme", async () => {
      const apiTokenIssuer = "https://issuer.fga.example/";
      const expectedBaseUrl = "https://issuer.fga.example";
      const expectedPath = `/${DEFAULT_TOKEN_ENDPOINT_PATH}`;

      const scope = nock(expectedBaseUrl)
        .post(expectedPath)
        .reply(200, {
          access_token: "test-token",
          expires_in: 300,
        });

      const credentials = new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer,
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientSecret: OPENFGA_CLIENT_SECRET,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      );

      await credentials.getAccessTokenHeader();

      expect(scope.isDone()).toBe(true);
    });

    test("should preserve custom token endpoint path when provided", async () => {
      const apiTokenIssuer = "https://issuer.fga.example/some_endpoint";
      const expectedBaseUrl = "https://issuer.fga.example";
      const expectedPath = "/some_endpoint";

      const scope = nock(expectedBaseUrl)
        .post(expectedPath)
        .reply(200, {
          access_token: "test-token",
          expires_in: 300,
        });

      const credentials = new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer,
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientSecret: OPENFGA_CLIENT_SECRET,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      );

      await credentials.getAccessTokenHeader();

      expect(scope.isDone()).toBe(true);
    });

    test("should preserve custom token endpoint path with nested path when provided", async () => {
      const apiTokenIssuer = "https://issuer.fga.example/api/v1/oauth/token";
      const expectedBaseUrl = "https://issuer.fga.example";
      const expectedPath = "/api/v1/oauth/token";

      const scope = nock(expectedBaseUrl)
        .post(expectedPath)
        .reply(200, {
          access_token: "test-token",
          expires_in: 300,
        });

      const credentials = new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer,
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientSecret: OPENFGA_CLIENT_SECRET,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      );

      await credentials.getAccessTokenHeader();

      expect(scope.isDone()).toBe(true);
    });

    test("should add https:// prefix when apiTokenIssuer has no scheme", async () => {
      const apiTokenIssuer = "issuer.fga.example/some_endpoint";
      const expectedBaseUrl = "https://issuer.fga.example";
      const expectedPath = "/some_endpoint";

      const scope = nock(expectedBaseUrl)
        .post(expectedPath)
        .reply(200, {
          access_token: "test-token",
          expires_in: 300,
        });

      const credentials = new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer,
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientSecret: OPENFGA_CLIENT_SECRET,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      );

      await credentials.getAccessTokenHeader();

      expect(scope.isDone()).toBe(true);
    });

    test("should preserve http:// scheme when provided", async () => {
      const apiTokenIssuer = "http://issuer.fga.example/some_endpoint";
      const expectedBaseUrl = "http://issuer.fga.example";
      const expectedPath = "/some_endpoint";

      const scope = nock(expectedBaseUrl)
        .post(expectedPath)
        .reply(200, {
          access_token: "test-token",
          expires_in: 300,
        });

      const credentials = new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer,
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientSecret: OPENFGA_CLIENT_SECRET,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      );

      await credentials.getAccessTokenHeader();

      expect(scope.isDone()).toBe(true);
    });

    test("should use default path when apiTokenIssuer has https:// scheme but no path", async () => {
      const apiTokenIssuer = "https://issuer.fga.example";
      const expectedBaseUrl = "https://issuer.fga.example";
      const expectedPath = `/${DEFAULT_TOKEN_ENDPOINT_PATH}`;

      const scope = nock(expectedBaseUrl)
        .post(expectedPath)
        .reply(200, {
          access_token: "test-token",
          expires_in: 300,
        });

      const credentials = new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer,
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientSecret: OPENFGA_CLIENT_SECRET,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      );

      await credentials.getAccessTokenHeader();

      expect(scope.isDone()).toBe(true);
    });

    test("should preserve custom path with query parameters", async () => {
      const apiTokenIssuer = "https://issuer.fga.example/some_endpoint?param=value";
      const expectedBaseUrl = "https://issuer.fga.example";
      const expectedPath = "/some_endpoint";
      const queryParams = { param: "value" };

      const scope = nock(expectedBaseUrl)
        .post(expectedPath)
        .query(queryParams)
        .reply(200, {
          access_token: "test-token",
          expires_in: 300,
        });

      const credentials = new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer,
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientSecret: OPENFGA_CLIENT_SECRET,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      );

      await credentials.getAccessTokenHeader();

      expect(scope.isDone()).toBe(true);
    });

    test("should preserve custom path with port number", async () => {
      const apiTokenIssuer = "https://issuer.fga.example:8080/some_endpoint";
      const expectedBaseUrl = "https://issuer.fga.example:8080";
      const expectedPath = "/some_endpoint";

      const scope = nock(expectedBaseUrl)
        .post(expectedPath)
        .reply(200, {
          access_token: "test-token",
          expires_in: 300,
        });

      const credentials = new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer,
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientSecret: OPENFGA_CLIENT_SECRET,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      );

      await credentials.getAccessTokenHeader();

      expect(scope.isDone()).toBe(true);
    });

    test("should use default path when path has multiple trailing slashes", async () => {
      const apiTokenIssuer = "https://issuer.fga.example///";
      const expectedBaseUrl = "https://issuer.fga.example";
      const expectedPath = `/${DEFAULT_TOKEN_ENDPOINT_PATH}`;

      const scope = nock(expectedBaseUrl)
        .post(expectedPath)
        .reply(200, {
          access_token: "test-token",
          expires_in: 300,
        });

      const credentials = new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer,
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientSecret: OPENFGA_CLIENT_SECRET,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      );

      await credentials.getAccessTokenHeader();

      expect(scope.isDone()).toBe(true);
    });

    test("should use default path when path only consists of slashes", async () => {
      const apiTokenIssuer = "https://issuer.fga.example//";
      const expectedBaseUrl = "https://issuer.fga.example";
      const expectedPath = `/${DEFAULT_TOKEN_ENDPOINT_PATH}`;

      const scope = nock(expectedBaseUrl)
        .post(expectedPath)
        .reply(200, {
          access_token: "test-token",
          expires_in: 300,
        });

      const credentials = new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer,
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientSecret: OPENFGA_CLIENT_SECRET,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      );

      await credentials.getAccessTokenHeader();

      expect(scope.isDone()).toBe(true);
    });

    test("should preserve custom path with consecutive/trailing slashes", async () => {
      const apiTokenIssuer = "https://issuer.fga.example/oauth//token///";
      const expectedBaseUrl = "https://issuer.fga.example";
      const expectedPath = "/oauth//token///";

      const scope = nock(expectedBaseUrl)
        .post(expectedPath)
        .reply(200, {
          access_token: "test-token",
          expires_in: 300,
        });

      const credentials = new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer,
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientSecret: OPENFGA_CLIENT_SECRET,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      );

      await credentials.getAccessTokenHeader();

      expect(scope.isDone()).toBe(true);
    });

    test.each([
      {
        description: "malformed url",
        apiTokenIssuer: "not a valid url::::",
      },
      {
        description: "empty string",
        apiTokenIssuer: "",
      },
      {
        description: "whitespace-only issuer",
        apiTokenIssuer: "   ",
      },
    ])("should throw FgaValidationError when $description", ({ apiTokenIssuer }) => {
      expect(() => new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer,
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientSecret: OPENFGA_CLIENT_SECRET,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      )).toThrow(FgaValidationError);
    });

    test("should normalize audience from apiTokenIssuer when using PrivateKeyJWT client credentials with HTTPS scheme", async () => {
      const apiTokenIssuer = "https://issuer.fga.example/some_endpoint";
      const expectedBaseUrl = "https://issuer.fga.example";
      const expectedAudience = "https://issuer.fga.example/some_endpoint/";

      const scope = nock(expectedBaseUrl)
        .post("/some_endpoint", (body: string) => {
          const params = new URLSearchParams(body);
          const clientAssertion = params.get("client_assertion") as string;
          const decoded = jose.decodeJwt(clientAssertion);
          expect(decoded.aud).toBe(`${expectedAudience}`);
          return true;
        })
        .reply(200, {
          access_token: "test-token",
          expires_in: 300,
        });

      const credentials = new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer,
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientAssertionSigningKey: OPENFGA_CLIENT_ASSERTION_SIGNING_KEY,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      );

      await credentials.getAccessTokenHeader();

      expect(scope.isDone()).toBe(true);
    });

    test("should normalize audience from apiTokenIssuer when using PrivateKeyJWT client credentials with HTTP scheme", async () => {
      const apiTokenIssuer = "http://issuer.fga.example/some_endpoint";
      const expectedBaseUrl = "http://issuer.fga.example";
      const expectedAudience = "http://issuer.fga.example/some_endpoint/";

      const scope = nock(expectedBaseUrl)
        .post("/some_endpoint", (body: string) => {
          const params = new URLSearchParams(body);
          const clientAssertion = params.get("client_assertion") as string;
          const decoded = jose.decodeJwt(clientAssertion);
          expect(decoded.aud).toBe(`${expectedAudience}`);
          return true;
        })
        .reply(200, {
          access_token: "test-token",
          expires_in: 300,
        });

      const credentials = new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer,
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientAssertionSigningKey: OPENFGA_CLIENT_ASSERTION_SIGNING_KEY,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      );

      await credentials.getAccessTokenHeader();

      expect(scope.isDone()).toBe(true);
    });

    test("should normalize audience from apiTokenIssuer when using PrivateKeyJWT client credentials with no scheme", async () => {
      const apiTokenIssuer = "issuer.fga.example/some_endpoint";
      const expectedBaseUrl = "https://issuer.fga.example";
      const expectedAudience = "https://issuer.fga.example/some_endpoint/";

      const scope = nock(expectedBaseUrl)
        .post("/some_endpoint", (body: string) => {
          const params = new URLSearchParams(body);
          const clientAssertion = params.get("client_assertion") as string;
          const decoded = jose.decodeJwt(clientAssertion);
          expect(decoded.aud).toBe(`${expectedAudience}`);
          return true;
        })
        .reply(200, {
          access_token: "test-token",
          expires_in: 300,
        });

      const credentials = new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer,
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientAssertionSigningKey: OPENFGA_CLIENT_ASSERTION_SIGNING_KEY,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      );

      await credentials.getAccessTokenHeader();

      expect(scope.isDone()).toBe(true);
    });
  });
});
