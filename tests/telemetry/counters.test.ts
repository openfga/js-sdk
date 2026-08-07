import { TelemetryCounters } from "../../telemetry/counters";
import { describe, test } from "node:test";
import { expect } from "../helpers/expect";

describe("TelemetryCounters", () => {
  test("should have correct counter details", () => {
    expect(TelemetryCounters.credentialsRequest.name).toBe("fga-client.credentials.request");
    expect(TelemetryCounters.credentialsRequest.unit).toBe("milliseconds");
    expect(TelemetryCounters.credentialsRequest.description).toBe("The number of times an access token is requested.");
  });
});
