import { MetricRecorder } from "../../telemetry/metrics";
import { TelemetryCounters } from "../../telemetry/counters";
import { TelemetryHistograms } from "../../telemetry/histograms";
import { TelemetryAttributes } from "../../telemetry/attributes";

jest.mock("@opentelemetry/api", () => ({
  metrics: {
    getMeter: jest.fn().mockReturnValue({
      createCounter: jest.fn().mockReturnValue({ add: jest.fn() }),
      createHistogram: jest.fn().mockReturnValue({ record: jest.fn() }),
    }),
  },
}));

describe("TelemetryMetrics", () => {
  let telemetryMetrics: MetricRecorder;

  beforeEach(() => {
    telemetryMetrics = new MetricRecorder();
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

  test("should handle creating metrics with custom attributes", () => {
    const attributes = TelemetryAttributes.prepare({ "http.host": "example.com" });
    const counter = telemetryMetrics.counter(TelemetryCounters.credentialsRequest, 3, attributes);

    expect(counter.add).toHaveBeenCalledWith(3, attributes);
  });
});
