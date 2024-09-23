import { TelemetryConfiguration, TelemetryMetricConfig } from "../../telemetry/configuration";
import { TelemetryAttribute } from "../../telemetry/attributes";
import { TelemetryMetric } from "../../telemetry/metrics";

describe("TelemetryConfiguration", () => {
  test("should use defaults if not all metrics defined", () => {
    const config = new TelemetryConfiguration({
      [TelemetryMetric.CounterCredentialsRequest]: {},
      [TelemetryMetric.HistogramQueryDuration]: {
        attributes: new Set<TelemetryAttribute>([
          TelemetryAttribute.FgaClientRequestClientId,
          TelemetryAttribute.HttpResponseStatusCode,
          TelemetryAttribute.UrlScheme,
          TelemetryAttribute.HttpRequestMethod,
        ])
      }
    });

    expect(config.metrics?.counterCredentialsRequest?.attributes).toEqual(undefined);
    expect(config.metrics?.histogramQueryDuration?.attributes).toEqual(new Set<TelemetryAttribute>(
      new Set<TelemetryAttribute>([
        TelemetryAttribute.FgaClientRequestClientId,
        TelemetryAttribute.HttpResponseStatusCode,
        TelemetryAttribute.UrlScheme,
        TelemetryAttribute.HttpRequestMethod,
      ])));
    expect(config.metrics?.histogramRequestDuration?.attributes).toEqual(undefined);
  });

  test("should use defaults", () => {
    const config = new TelemetryConfiguration();

    expect(config.metrics?.counterCredentialsRequest?.attributes).toEqual(TelemetryConfiguration.defaultAttributes);
    expect(config.metrics?.histogramQueryDuration?.attributes).toEqual(TelemetryConfiguration.defaultAttributes);
    expect(config.metrics?.histogramRequestDuration?.attributes).toEqual(TelemetryConfiguration.defaultAttributes);
  }); 

  test("should be undefined if empty object passed", () => {
    const config = new TelemetryConfiguration({});

    expect(config.metrics?.counterCredentialsRequest?.attributes).toEqual(undefined);
    expect(config.metrics?.histogramQueryDuration?.attributes).toEqual(undefined);
    expect(config.metrics?.histogramRequestDuration?.attributes).toEqual(undefined);
  }); 
});
