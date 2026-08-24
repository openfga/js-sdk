"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("../../telemetry/configuration");
const attributes_1 = require("../../telemetry/attributes");
const metrics_1 = require("../../telemetry/metrics");
const node_test_1 = require("node:test");
const expect_1 = require("../helpers/expect");
(0, node_test_1.describe)("TelemetryConfiguration", () => {
    (0, node_test_1.test)("should use defaults if not all metrics defined", () => {
        const config = new configuration_1.TelemetryConfiguration({
            [metrics_1.TelemetryMetric.CounterCredentialsRequest]: {},
            [metrics_1.TelemetryMetric.HistogramQueryDuration]: {
                attributes: new Set([
                    attributes_1.TelemetryAttribute.FgaClientRequestClientId,
                    attributes_1.TelemetryAttribute.HttpResponseStatusCode,
                    attributes_1.TelemetryAttribute.UrlScheme,
                    attributes_1.TelemetryAttribute.HttpRequestMethod,
                ])
            }
        });
        (0, expect_1.expect)(config.metrics?.counterCredentialsRequest?.attributes).toEqual(undefined);
        (0, expect_1.expect)(config.metrics?.histogramQueryDuration?.attributes).toEqual(new Set(new Set([
            attributes_1.TelemetryAttribute.FgaClientRequestClientId,
            attributes_1.TelemetryAttribute.HttpResponseStatusCode,
            attributes_1.TelemetryAttribute.UrlScheme,
            attributes_1.TelemetryAttribute.HttpRequestMethod,
        ])));
        (0, expect_1.expect)(config.metrics?.histogramRequestDuration?.attributes).toEqual(undefined);
    });
    (0, node_test_1.test)("should use defaults", () => {
        const config = new configuration_1.TelemetryConfiguration();
        (0, expect_1.expect)(config.metrics?.counterCredentialsRequest?.attributes).toEqual(configuration_1.TelemetryConfiguration.defaultAttributes);
        (0, expect_1.expect)(config.metrics?.histogramQueryDuration?.attributes).toEqual(configuration_1.TelemetryConfiguration.defaultAttributes);
        (0, expect_1.expect)(config.metrics?.histogramRequestDuration?.attributes).toEqual(configuration_1.TelemetryConfiguration.defaultAttributes);
        // histogramHttpRequestDuration is disabled by default due to high cardinality
        (0, expect_1.expect)(config.metrics?.histogramHttpRequestDuration?.attributes).toEqual(undefined);
    });
    (0, node_test_1.test)("should be undefined if empty object passed", () => {
        const config = new configuration_1.TelemetryConfiguration({});
        (0, expect_1.expect)(config.metrics?.counterCredentialsRequest?.attributes).toEqual(undefined);
        (0, expect_1.expect)(config.metrics?.histogramQueryDuration?.attributes).toEqual(undefined);
        (0, expect_1.expect)(config.metrics?.histogramRequestDuration?.attributes).toEqual(undefined);
        (0, expect_1.expect)(config.metrics?.histogramHttpRequestDuration?.attributes).toEqual(undefined);
    });
});
//# sourceMappingURL=configuration.test.js.map