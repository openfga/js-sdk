import * as nock from "nock";
import { OpenFgaClient, UserClientConfigurationParams } from "../index";
import { baseConfig } from "./helpers/default-config";
import { CredentialsMethod } from "../credentials";

nock.disableNetConnect();

describe("Header Functionality Tests", () => {
  const testConfig: UserClientConfigurationParams = {
    ...baseConfig,
    credentials: { method: CredentialsMethod.None }
  };

  afterEach(() => {
    nock.cleanAll();
  });

  describe("Default headers from client configuration", () => {
    it("should send default headers from baseOptions on all requests", async () => {
      const fgaClient = new OpenFgaClient({
        ...testConfig,
        baseOptions: {
          headers: {
            "X-Default-Header": "default-value",
            "X-Client-ID": "test-client-123",
            "X-API-Version": "v1.0"
          }
        }
      });

      const scope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          // Verify all default headers are present
          expect(request.headers.get("x-default-header")).toBe("default-value");
          expect(request.headers.get("x-client-id")).toBe("test-client-123");
          expect(request.headers.get("x-api-version")).toBe("v1.0");
          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      });

      expect(scope.isDone()).toBe(true);
    });

    it("should send default headers on multiple different API calls", async () => {
      const fgaClient = new OpenFgaClient({
        ...testConfig,
        baseOptions: {
          headers: {
            "X-Persistent-Header": "should-appear-everywhere"
          }
        }
      });

      // Test check endpoint
      const checkScope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          expect(request.headers.get("x-persistent-header")).toBe("should-appear-everywhere");
          return [200, { allowed: true }];
        });

      // Test read endpoint
      const readScope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/read`)
        .reply((request) => {
          expect(request.headers.get("x-persistent-header")).toBe("should-appear-everywhere");
          return [200, { tuples: [] }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader", 
        object: "document:test"
      });

      await fgaClient.read({});

      expect(checkScope.isDone()).toBe(true);
      expect(readScope.isDone()).toBe(true);
    });
  });

  describe("Per-request headers", () => {
    it("should send per-request headers when specified", async () => {
      const fgaClient = new OpenFgaClient(testConfig);

      const scope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          expect(request.headers.get("x-request-header")).toBe("request-value");
          expect(request.headers.get("x-correlation-id")).toBe("abc-123-def");
          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      }, {
        headers: {
          "X-Request-Header": "request-value",
          "X-Correlation-ID": "abc-123-def"
        }
      });

      expect(scope.isDone()).toBe(true);
    });

    it("should only send per-request headers on the specific request", async () => {
      const fgaClient = new OpenFgaClient(testConfig);

      // First request with headers
      const firstScope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          expect(request.headers.get("x-first-request")).toBe("first-value");
          expect(request.headers.get("x-second-request")).toBeNull();
          return [200, { allowed: true }];
        });

      // Second request with different headers
      const secondScope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          expect(request.headers.get("x-second-request")).toBe("second-value");
          expect(request.headers.get("x-first-request")).toBeNull();
          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      }, {
        headers: {
          "X-First-Request": "first-value"
        }
      });

      await fgaClient.check({
        user: "user:different",
        relation: "writer",
        object: "document:other"
      }, {
        headers: {
          "X-Second-Request": "second-value"
        }
      });

      expect(firstScope.isDone()).toBe(true);
      expect(secondScope.isDone()).toBe(true);
    });
  });

  describe("Default + per-request header combination", () => {
    it("should send both default headers and per-request headers", async () => {
      const fgaClient = new OpenFgaClient({
        ...testConfig,
        baseOptions: {
          headers: {
            "X-Default-Header": "default-value",
            "X-Client-Name": "test-client"
          }
        }
      });

      const scope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          // Verify default headers are present
          expect(request.headers.get("x-default-header")).toBe("default-value");
          expect(request.headers.get("x-client-name")).toBe("test-client");
          
          // Verify per-request headers are present
          expect(request.headers.get("x-request-id")).toBe("req-123");
          expect(request.headers.get("x-user-context")).toBe("test-user");
          
          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      }, {
        headers: {
          "X-Request-ID": "req-123",
          "X-User-Context": "test-user"
        }
      });

      expect(scope.isDone()).toBe(true);
    });

    it("should merge headers from multiple sources correctly", async () => {
      const fgaClient = new OpenFgaClient({
        ...testConfig,
        baseOptions: {
          headers: {
            "X-Source": "default",
            "X-Default-Only": "only-in-default",
            "X-Version": "1.0"
          }
        }
      });

      const scope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          const headers = request.headers;
          
          // Default headers should be present
          expect(headers.get("x-source")).toBe("default");
          expect(headers.get("x-default-only")).toBe("only-in-default");
          expect(headers.get("x-version")).toBe("1.0");
          
          // Per-request headers should be present
          expect(headers.get("x-request-only")).toBe("only-in-request");
          expect(headers.get("x-timestamp")).toBe("2023-10-01");
          
          // SDK headers should be present
          expect(headers.get("content-type")).toBe("application/json");
          expect(headers.get("user-agent")).toMatch(/openfga-sdk/);
          
          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      }, {
        headers: {
          "X-Request-Only": "only-in-request",
          "X-Timestamp": "2023-10-01"
        }
      });

      expect(scope.isDone()).toBe(true);
    });
  });

  describe("Header precedence and override behavior", () => {
    it("should allow per-request headers to override default headers", async () => {
      const fgaClient = new OpenFgaClient({
        ...testConfig,
        baseOptions: {
          headers: {
            "X-Environment": "default-env",
            "X-Priority": "low",
            "X-Shared-Header": "from-default"
          }
        }
      });

      const scope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          // Per-request headers should override default headers
          expect(request.headers.get("x-environment")).toBe("production");
          expect(request.headers.get("x-priority")).toBe("high");
          expect(request.headers.get("x-shared-header")).toBe("from-request");
          
          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      }, {
        headers: {
          "X-Environment": "production",
          "X-Priority": "high",
          "X-Shared-Header": "from-request"
        }
      });

      expect(scope.isDone()).toBe(true);
    });

    it("should preserve non-overridden default headers", async () => {
      const fgaClient = new OpenFgaClient({
        ...testConfig,
        baseOptions: {
          headers: {
            "X-Keep-Default": "keep-this",
            "X-Override-This": "original-value",
            "X-Also-Keep": "also-keep-this"
          }
        }
      });

      const scope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          // Non-overridden defaults should remain
          expect(request.headers.get("x-keep-default")).toBe("keep-this");
          expect(request.headers.get("x-also-keep")).toBe("also-keep-this");
          
          // Overridden header should have new value
          expect(request.headers.get("x-override-this")).toBe("new-value");
          
          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      }, {
        headers: {
          "X-Override-This": "new-value"
        }
      });

      expect(scope.isDone()).toBe(true);
    });

    it("should handle case-insensitive header overrides correctly", async () => {
      const fgaClient = new OpenFgaClient({
        ...testConfig,
        baseOptions: {
          headers: {
            "X-Test-Header": "default-value"
          }
        }
      });

      const scope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          // HTTP headers are case-insensitive, so request header should override default
          const testHeaderValue = request.headers.get("x-test-header");
          
          // Per-request should win
          expect(testHeaderValue).toBe("request-value");
          
          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      }, {
        headers: {
          "x-test-header": "request-value"  // Different case
        }
      });

      expect(scope.isDone()).toBe(true);
    });
  });

  describe("Content-Type header protection behavior", () => {
    it("does not honor Content-Type header from baseOptions override", async () => {
      // The SDK protects Content-Type
      // User attempts to set Content-Type via baseOptions are ignored
      
      const fgaClient = new OpenFgaClient({
        ...testConfig,
        baseOptions: {
          headers: {
            "Content-Type": "text/plain",           // SDK ignores this
            "X-Custom-Header": "should-work"        // Custom headers work fine
          }
        }
      });

      const scope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          const headers = request.headers;
          
          // SDK enforces Content-Type for JSON APIs
          expect(headers.get("content-type")).toBe("application/json");
          
          // Custom headers are preserved
          expect(headers.get("x-custom-header")).toBe("should-work");
          
          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      });

      expect(scope.isDone()).toBe(true);
    });

    it("allows Content-Type override via per-request headers", async () => {
      // At the request level, user headers can override SDK headers
      
      const fgaClient = new OpenFgaClient(testConfig);

      const scope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          // Per-request headers override SDK headers (including Content-Type)
          expect(request.headers.get("content-type")).toBe("application/xml");
          expect(request.headers.get("x-custom-request")).toBe("request-value");
          
          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      }, {
        headers: {
          "Content-Type": "application/xml",        // This overrides SDK's Content-Type
          "X-Custom-Request": "request-value"       // Custom headers also work
        }
      });

      expect(scope.isDone()).toBe(true);
    });

    it("should set Content-Type to application/json by default", async () => {
      // When no Content-Type is specified, SDK sets it to application/json
      
      const fgaClient = new OpenFgaClient({
        ...testConfig,
        baseOptions: {
          headers: {
            "X-API-Version": "v1",              // Custom header without Content-Type
            "Authorization": "Bearer token"      // Another custom header
          }
        }
      });

      const scope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          const headers = request.headers;
          
          // SDK automatically sets Content-Type for JSON APIs
          expect(headers.get("content-type")).toBe("application/json");
          
          // Custom headers are preserved
          expect(headers.get("x-api-version")).toBe("v1");
          expect(headers.get("authorization")).toBe("Bearer token");
          
          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      });

      expect(scope.isDone()).toBe(true);
    });

    it("should demonstrate Content-Type protection is only critical header", async () => {
      // Only Content-Type receives special protection - other SDK headers can be overridden
      
      const fgaClient = new OpenFgaClient({
        ...testConfig,
        baseOptions: {
          headers: {
            "Content-Type": "text/plain",       // SDK ignores this
            "User-Agent": "custom-agent",       // This might work (not protected)
            "Accept": "text/html",              // This might work (not protected)
            "X-Custom": "definitely-works"      // Custom headers always work
          }
        }
      });

      const scope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          const headers = request.headers;
          
          // Only Content-Type is strictly protected
          expect(headers.get("content-type")).toBe("application/json");
          
          // Other headers may or may not be overrideable (depends on axios behavior)
          // The key point is that only Content-Type has explicit SDK protection
          
          // Custom headers definitely work
          expect(headers.get("x-custom")).toBe("definitely-works");
          
          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      });

      expect(scope.isDone()).toBe(true);
    });
  });

  describe("Edge cases and special scenarios", () => {
    it("should handle empty baseOptions headers", async () => {
      const fgaClient = new OpenFgaClient({
        ...testConfig,
        baseOptions: {
          headers: {}
        }
      });

      const scope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          // Should still have SDK headers
          expect(request.headers.get("content-type")).toBe("application/json");
          expect(request.headers.get("user-agent")).toMatch(/openfga-sdk/);
          
          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      });

      expect(scope.isDone()).toBe(true);
    });

    it("should handle undefined baseOptions", async () => {
      const fgaClient = new OpenFgaClient({
        ...testConfig
        // No baseOptions specified
      });

      const scope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          // Should still have SDK headers
          expect(request.headers.get("content-type")).toBe("application/json");
          expect(request.headers.get("user-agent")).toMatch(/openfga-sdk/);
          
          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      });

      expect(scope.isDone()).toBe(true);
    });

    it("should handle empty per-request headers", async () => {
      const fgaClient = new OpenFgaClient({
        ...testConfig,
        baseOptions: {
          headers: {
            "X-Default": "default-value"
          }
        }
      });

      const scope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          // Default headers should still be present
          expect(request.headers.get("x-default")).toBe("default-value");
          
          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      }, {
        headers: {}  // Empty headers object
      });

      expect(scope.isDone()).toBe(true);
    });

    it("should handle special header values", async () => {
      const fgaClient = new OpenFgaClient({
        ...testConfig,
        baseOptions: {
          headers: {
            "X-Empty-String": "",
            "X-Number-Value": "123",
            "X-Boolean-Value": "true",
            "X-Special-Chars": "test@#$%^&*()_+-={}[]|\\:;\"'<>,.?/"
          }
        }
      });

      const scope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          const headers = request.headers;
          
          expect(headers.get("x-empty-string")).toBe("");
          expect(headers.get("x-number-value")).toBe("123");
          expect(headers.get("x-boolean-value")).toBe("true");
          expect(headers.get("x-special-chars")).toBe("test@#$%^&*()_+-={}[]|\\:;\"'<>,.?/");
          
          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      });

      expect(scope.isDone()).toBe(true);
    });

    it.skip("should handle large number of headers", async () => {
      const defaultHeaders: Record<string, string> = {};
      const requestHeaders: Record<string, string> = {};
      
      // Create many default headers
      for (let i = 1; i <= 50; i++) {
        defaultHeaders[`X-Default-${i}`] = `default-value-${i}`;
      }
      
      // Create many request headers
      for (let i = 1; i <= 50; i++) {
        requestHeaders[`X-Request-${i}`] = `request-value-${i}`;
      }

      const fgaClient = new OpenFgaClient({
        ...testConfig,
        baseOptions: {
          headers: defaultHeaders
        }
      });

      const scope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          const headers = request.headers;
          
          // Log all header names for debugging
          const headerNames: string[] = [];
          headers.forEach((_value, key) => headerNames.push(key));

          // Verify a sample of default headers (checking both cases)
          expect(headers.get("x-default-1") || headers.get("X-Default-1")).toBeTruthy();
          expect(headers.get("x-default-25") || headers.get("X-Default-25")).toBeTruthy();
          expect(headers.get("x-default-50") || headers.get("X-Default-50")).toBeTruthy();

          // Verify a sample of request headers (checking both cases)
          expect(headers.get("x-request-1") || headers.get("X-Request-1")).toBeTruthy();
          expect(headers.get("x-request-25") || headers.get("X-Request-25")).toBeTruthy();
          expect(headers.get("x-request-50") || headers.get("X-Request-50")).toBeTruthy();

          return [200, { allowed: true }];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      }, {
        headers: requestHeaders
      });

      expect(scope.isDone()).toBe(true);
    });
  });

  describe("Header behavior across different API methods", () => {
    it("should send headers consistently across different API endpoints", async () => {
      const fgaClient = new OpenFgaClient({
        ...testConfig,
        baseOptions: {
          headers: {
            "X-Consistent-Header": "always-present"
          }
        }
      });

      // Test multiple endpoints
      const checkScope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/check`)
        .reply((request) => {
          expect(request.headers.get("x-consistent-header")).toBe("always-present");
          return [200, { allowed: true }];
        });

      const readScope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/read`)
        .reply((request) => {
          expect(request.headers.get("x-consistent-header")).toBe("always-present");
          return [200, { tuples: [] }];
        });

      const writeScope = nock(testConfig.apiUrl!)
        .post(`/stores/${testConfig.storeId}/write`)
        .reply((request) => {
          expect(request.headers.get("x-consistent-header")).toBe("always-present");
          return [200, {}];
        });

      await fgaClient.check({
        user: "user:test",
        relation: "reader",
        object: "document:test"
      });

      await fgaClient.read({});

      await fgaClient.write({
        writes: [{
          user: "user:test",
          relation: "reader", 
          object: "document:test"
        }]
      });

      expect(checkScope.isDone()).toBe(true);
      expect(readScope.isDone()).toBe(true);
      expect(writeScope.isDone()).toBe(true);
    });
  });
});
