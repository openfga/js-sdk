import { TelemetryHistograms } from "../../telemetry/histograms";

describe("TelemetryHistograms", () => {
  test("should have correct histogram details for request duration", () => {
    expect(TelemetryHistograms.requestDuration.name).toBe("fga-client.request.duration");
    expect(TelemetryHistograms.requestDuration.unit).toBe("milliseconds");
    expect(TelemetryHistograms.requestDuration.description).toBe("How long it took for a request to be fulfilled.");
  });

  test("should have correct histogram details for query duration", () => {
    expect(TelemetryHistograms.queryDuration.name).toBe("fga-client.query.duration");
    expect(TelemetryHistograms.queryDuration.unit).toBe("milliseconds");
    expect(TelemetryHistograms.queryDuration.description).toBe("How long it took to perform a query request.");
  });
});
