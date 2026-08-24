"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const histograms_1 = require("../../telemetry/histograms");
const node_test_1 = require("node:test");
const expect_1 = require("../helpers/expect");
(0, node_test_1.describe)("TelemetryHistograms", () => {
    (0, node_test_1.test)("should have correct histogram details for request duration", () => {
        (0, expect_1.expect)(histograms_1.TelemetryHistograms.requestDuration.name).toBe("fga-client.request.duration");
        (0, expect_1.expect)(histograms_1.TelemetryHistograms.requestDuration.unit).toBe("milliseconds");
        (0, expect_1.expect)(histograms_1.TelemetryHistograms.requestDuration.description).toBe("How long it took for a request to be fulfilled.");
    });
    (0, node_test_1.test)("should have correct histogram details for query duration", () => {
        (0, expect_1.expect)(histograms_1.TelemetryHistograms.queryDuration.name).toBe("fga-client.query.duration");
        (0, expect_1.expect)(histograms_1.TelemetryHistograms.queryDuration.unit).toBe("milliseconds");
        (0, expect_1.expect)(histograms_1.TelemetryHistograms.queryDuration.description).toBe("How long it took to perform a query request.");
    });
    (0, node_test_1.test)("should have correct histogram details for http request duration", () => {
        (0, expect_1.expect)(histograms_1.TelemetryHistograms.httpRequestDuration.name).toBe("fga-client.http_request.duration");
        (0, expect_1.expect)(histograms_1.TelemetryHistograms.httpRequestDuration.unit).toBe("milliseconds");
        (0, expect_1.expect)(histograms_1.TelemetryHistograms.httpRequestDuration.description).toBe("The time (in milliseconds) for a single HTTP request to complete.");
    });
});
//# sourceMappingURL=histograms.test.js.map