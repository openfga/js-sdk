import { MetricRecorder } from "../../telemetry/metrics";
import { TelemetryCounters } from "../../telemetry/counters";
import { TelemetryHistograms } from "../../telemetry/histograms";
import { TelemetryAttributes } from "../../telemetry/attributes";
import SdkConstants from "../../constants";
import { metrics } from "@opentelemetry/api";
import { afterEach, beforeEach, describe, mock, test } from "node:test";
import { expect } from "../helpers/expect";
import "../setup";

describe("TelemetryMetrics", () => {
  let telemetryMetrics: MetricRecorder;

  beforeEach(() => {
    mock.method(metrics, "getMeter", () => ({
      createCounter: mock.fn(() => ({ add: mock.fn() })),
      createHistogram: mock.fn(() => ({ record: mock.fn() })),
    }) as any);
    telemetryMetrics = new MetricRecorder();
  });

  afterEach(() => {
    mock.restoreAll();
  });

  test("should create a counter and add a value", () => {
    const counter = telemetryMetrics.counter(TelemetryCounters.credentialsRequest, 5);

    expect(counter).toBeDefined();
    expect(counter.add).toHaveBeenCalledWith(5, undefined);
  });

  test("should create a histogram and record a value", () => {
    const histogram = telemetryMetrics.histogram(TelemetryHistograms.requestDuration, 200);

    expect(histogram).toBeDefined();
    expect(histogram.record).toHaveBeenCalledWith(200, undefined);
  });

  test("should register meter with current SDK version", () => {
    telemetryMetrics.counter(TelemetryCounters.credentialsRequest, 1);

    expect((metrics as any).getMeter).toHaveBeenCalledWith("@openfga/sdk", SdkConstants.SdkVersion);
  });

  test("should handle creating metrics with custom attributes", () => {
    const attributes = TelemetryAttributes.prepare({ "http.host": "example.com" });
    const counter = telemetryMetrics.counter(TelemetryCounters.credentialsRequest, 3, attributes);

    expect(counter.add).toHaveBeenCalledWith(3, attributes);
  });
});
