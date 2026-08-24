"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metrics_1 = require("../../telemetry/metrics");
const counters_1 = require("../../telemetry/counters");
const histograms_1 = require("../../telemetry/histograms");
const attributes_1 = require("../../telemetry/attributes");
const constants_1 = __importDefault(require("../../constants"));
const api_1 = require("@opentelemetry/api");
const node_test_1 = require("node:test");
const expect_1 = require("../helpers/expect");
(0, node_test_1.describe)("TelemetryMetrics", () => {
    let telemetryMetrics;
    (0, node_test_1.beforeEach)(() => {
        node_test_1.mock.method(api_1.metrics, "getMeter", () => ({
            createCounter: node_test_1.mock.fn(() => ({ add: node_test_1.mock.fn() })),
            createHistogram: node_test_1.mock.fn(() => ({ record: node_test_1.mock.fn() })),
        }));
        telemetryMetrics = new metrics_1.MetricRecorder();
    });
    (0, node_test_1.afterEach)(() => {
        node_test_1.mock.restoreAll();
    });
    (0, node_test_1.test)("should create a counter and add a value", () => {
        const counter = telemetryMetrics.counter(counters_1.TelemetryCounters.credentialsRequest, 5);
        (0, expect_1.expect)(counter).toBeDefined();
        (0, expect_1.expect)(counter.add).toHaveBeenCalledWith(5, undefined);
    });
    (0, node_test_1.test)("should create a histogram and record a value", () => {
        const histogram = telemetryMetrics.histogram(histograms_1.TelemetryHistograms.requestDuration, 200);
        (0, expect_1.expect)(histogram).toBeDefined();
        (0, expect_1.expect)(histogram.record).toHaveBeenCalledWith(200, undefined);
    });
    (0, node_test_1.test)("should register meter with current SDK version", () => {
        telemetryMetrics.counter(counters_1.TelemetryCounters.credentialsRequest, 1);
        (0, expect_1.expect)(api_1.metrics.getMeter).toHaveBeenCalledWith("@openfga/sdk", constants_1.default.SdkVersion);
    });
    (0, node_test_1.test)("should handle creating metrics with custom attributes", () => {
        const attributes = attributes_1.TelemetryAttributes.prepare({ "http.host": "example.com" });
        const counter = telemetryMetrics.counter(counters_1.TelemetryCounters.credentialsRequest, 3, attributes);
        (0, expect_1.expect)(counter.add).toHaveBeenCalledWith(3, attributes);
    });
});
//# sourceMappingURL=metrics.test.js.map