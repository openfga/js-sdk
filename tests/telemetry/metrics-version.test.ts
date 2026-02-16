import { metrics } from "@opentelemetry/api";

jest.mock("@opentelemetry/api", () => ({
  metrics: {
    getMeter: jest.fn().mockReturnValue({
      createCounter: jest.fn().mockReturnValue({ add: jest.fn() }),
      createHistogram: jest.fn().mockReturnValue({ record: jest.fn() }),
    }),
  },
}));

import { MetricRecorder } from "../../telemetry/metrics";

describe("MetricRecorder version", () => {
  it("should use the current SDK version when creating the meter, not a stale hardcoded value", () => {
    const recorder = new MetricRecorder();
    recorder.meter();

    expect(metrics.getMeter).toHaveBeenCalledWith("@openfga/sdk", "0.9.0");
  });
});
