import { describe, test } from "node:test";
import "../setup";
import { expect, spyOn } from "../helpers/test";

import { Meter } from "@opentelemetry/api";
import SdkConstants from "../../constants";
import { TelemetryAttributes } from "../../telemetry/attributes";
import { TelemetryCounters } from "../../telemetry/counters";
import { TelemetryHistograms } from "../../telemetry/histograms";
import { MetricRecorder } from "../../telemetry/metrics";

describe("TelemetryMetrics", () => {
  function createRecorder() {
    const counter = { add: () => undefined };
    const histogram = { record: () => undefined };
    const counterAdd = spyOn(counter, "add");
    const histogramRecord = spyOn(histogram, "record");
    const meter = {
      createCounter: () => counter,
      createHistogram: () => histogram,
    } as unknown as Meter;
    const recorder = new MetricRecorder();
    const meterMethod = spyOn(recorder, "meter").mockReturnValue(meter);

    return { counter, counterAdd, histogram, histogramRecord, meterMethod, recorder };
  }

  test("should create a counter and add a value", () => {
    const { counterAdd, recorder } = createRecorder();
    const metric = recorder.counter(TelemetryCounters.credentialsRequest, 5);

    expect(metric).toBeDefined();
    expect(counterAdd).toHaveBeenCalledWith(5, undefined);
  });

  test("should create a histogram and record a value", () => {
    const { histogramRecord, recorder } = createRecorder();
    const metric = recorder.histogram(TelemetryHistograms.requestDuration, 200);

    expect(metric).toBeDefined();
    expect(histogramRecord).toHaveBeenCalledWith(200, undefined);
  });

  test("should register meter with current SDK version", () => {
    const { meterMethod, recorder } = createRecorder();
    recorder.counter(TelemetryCounters.credentialsRequest, 1);

    expect(meterMethod).toHaveBeenCalledTimes(1);
    expect(SdkConstants.SdkVersion).toBeDefined();
  });

  test("should handle creating metrics with custom attributes", () => {
    const { counterAdd, recorder } = createRecorder();
    const attributes = TelemetryAttributes.prepare({ "http.host": "example.com" });
    recorder.counter(TelemetryCounters.credentialsRequest, 3, attributes);

    expect(counterAdd).toHaveBeenCalledWith(3, attributes);
  });
});
