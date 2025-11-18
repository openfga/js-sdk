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

nock.disableNetConnect();

describe("Credentials", () => {
  const mockTelemetryConfig: TelemetryConfiguration = new TelemetryConfiguration({});

  describe("Refreshing access token", () => {
    interface TestCase {
      description: string;
      apiTokenIssuer: string;
      expectedBaseUrl: string;
      expectedPath: string;
      queryParams?: Record<string, string>;
    }

    const testCases: TestCase[] = [
      {
        description: "should use default scheme and token endpoint path when apiTokenIssuer has no scheme and no path",
        apiTokenIssuer: "issuer.fga.example",
        expectedBaseUrl: "https://issuer.fga.example",
        expectedPath: `/${DEFAULT_TOKEN_ENDPOINT_PATH}`,
      },
      {
        description: "should use default token endpoint path when apiTokenIssuer has root path and no scheme",
        apiTokenIssuer: "https://issuer.fga.example/",
        expectedBaseUrl: "https://issuer.fga.example",
        expectedPath: `/${DEFAULT_TOKEN_ENDPOINT_PATH}`,
      },
      {
        description: "should preserve custom token endpoint path when provided",
        apiTokenIssuer: "https://issuer.fga.example/some_endpoint",
        expectedBaseUrl: "https://issuer.fga.example",
        expectedPath: "/some_endpoint",
      },
      {
        description: "should preserve custom token endpoint path with nested path when provided",
        apiTokenIssuer: "https://issuer.fga.example/api/v1/oauth/token",
        expectedBaseUrl: "https://issuer.fga.example",
        expectedPath: "/api/v1/oauth/token",
      },
      {
        description: "should add https:// prefix when apiTokenIssuer has no scheme",
        apiTokenIssuer: "issuer.fga.example/some_endpoint",
        expectedBaseUrl: "https://issuer.fga.example",
        expectedPath: "/some_endpoint",
      },
      {
        description: "should preserve http:// scheme when provided",
        apiTokenIssuer: "http://issuer.fga.example/some_endpoint",
        expectedBaseUrl: "http://issuer.fga.example",
        expectedPath: "/some_endpoint",
      },
      {
        description: "should use default path when apiTokenIssuer has https:// scheme but no path",
        apiTokenIssuer: "https://issuer.fga.example",
        expectedBaseUrl: "https://issuer.fga.example",
        expectedPath: `/${DEFAULT_TOKEN_ENDPOINT_PATH}`,
      },
      {
        description: "should preserve custom path with query parameters",
        apiTokenIssuer: "https://issuer.fga.example/some_endpoint?param=value",
        expectedBaseUrl: "https://issuer.fga.example",
        expectedPath: "/some_endpoint",
        queryParams: { param: "value" },
      },
      {
        description: "should preserve custom path with port number",
        apiTokenIssuer: "https://issuer.fga.example:8080/some_endpoint",
        expectedBaseUrl: "https://issuer.fga.example:8080",
        expectedPath: "/some_endpoint",
      },
    ];

    test.each(testCases)("$description", async ({ apiTokenIssuer, expectedBaseUrl, expectedPath, queryParams }) => {
      const scope = queryParams
        ? nock(expectedBaseUrl)
          .post(expectedPath)
          .query(queryParams)
          .reply(200, {
            access_token: "test-token",
            expires_in: 300,
          })
        : nock(expectedBaseUrl)
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
      nock.cleanAll();
    });

    it("should throw FgaValidationError for malformed apiTokenIssuer", () => {
      expect(() => new Credentials(
        {
          method: CredentialsMethod.ClientCredentials,
          config: {
            apiTokenIssuer: "not a valid url::::",
            apiAudience: OPENFGA_API_AUDIENCE,
            clientId: OPENFGA_CLIENT_ID,
            clientSecret: OPENFGA_CLIENT_SECRET,
          },
        } as AuthCredentialsConfig,
        undefined,
        mockTelemetryConfig,
      )).toThrowError(FgaValidationError);
    });

    test.each([
      {
        description: "HTTPS scheme",
        apiTokenIssuer: "https://issuer.fga.example/some_endpoint",
        expectedBaseUrl: "https://issuer.fga.example",
        expectedAudience: "https://issuer.fga.example/some_endpoint/",
      },
      {
        description: "HTTP scheme",
        apiTokenIssuer: "http://issuer.fga.example/some_endpoint",
        expectedBaseUrl: "http://issuer.fga.example",
        expectedAudience: "http://issuer.fga.example/some_endpoint/",
      },
      {
        description: "No scheme",
        apiTokenIssuer: "issuer.fga.example/some_endpoint",
        expectedBaseUrl: "https://issuer.fga.example",
        expectedAudience: "https://issuer.fga.example/some_endpoint/",
      }
    ])("should normalize audience from apiTokenIssuer when using PrivateKeyJWT client credentials ($description)", async ({ apiTokenIssuer, expectedBaseUrl, expectedAudience }) => {
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
      nock.cleanAll();
    });
  });
});

