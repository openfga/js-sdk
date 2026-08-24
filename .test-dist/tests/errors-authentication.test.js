"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
const node_test_1 = require("node:test");
const expect_1 = require("./helpers/expect");
(0, node_test_1.describe)("errors.ts", () => {
    (0, node_test_1.describe)("FgaApiAuthenticationError", () => {
        (0, node_test_1.test)("should be an instance of FgaApiError", () => {
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
            };
            const err = new errors_1.FgaApiAuthenticationError(axiosError);
            (0, expect_1.expect)(err).toBeInstanceOf(errors_1.FgaApiError);
            (0, expect_1.expect)(err).toBeInstanceOf(Error);
            (0, expect_1.expect)(err.statusCode).toBe(401);
            (0, expect_1.expect)(err.statusText).toBe("Unauthorized");
            (0, expect_1.expect)(err.requestURL).toBe("https://issuer.fga.example/oauth/token");
            (0, expect_1.expect)(err.clientId).toBe("client-id");
            (0, expect_1.expect)(err.audience).toBe("api-audience");
            (0, expect_1.expect)(err.grantType).toBe("client_credentials");
            (0, expect_1.expect)(err.apiErrorCode).toBe("auth_error");
            (0, expect_1.expect)(err.message).toBe("FGA Authentication Error. Unauthorized");
        });
    });
});
//# sourceMappingURL=errors-authentication.test.js.map