"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const counters_1 = require("../../telemetry/counters");
const node_test_1 = require("node:test");
const expect_1 = require("../helpers/expect");
(0, node_test_1.describe)("TelemetryCounters", () => {
    (0, node_test_1.test)("should have correct counter details", () => {
        (0, expect_1.expect)(counters_1.TelemetryCounters.credentialsRequest.name).toBe("fga-client.credentials.request");
        (0, expect_1.expect)(counters_1.TelemetryCounters.credentialsRequest.unit).toBe("milliseconds");
        (0, expect_1.expect)(counters_1.TelemetryCounters.credentialsRequest.description).toBe("The number of times an access token is requested.");
    });
});
//# sourceMappingURL=counters.test.js.map