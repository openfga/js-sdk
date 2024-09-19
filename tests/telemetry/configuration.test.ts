import { TelemetryMetricConfiguration, TelemetryConfiguration, TelemetryMetricConfig } from "../../telemetry/configuration";
import { TelemetryAttribute } from "../../telemetry/attributes";

describe("TelemetryMetricConfiguration", () => {
  test("should create a default TelemetryMetricConfiguration instance", () => {
    const config = new TelemetryMetricConfiguration();

    expect(config.attributes.has(TelemetryAttribute.HttpHost));
    expect(config.attributes.has(TelemetryAttribute.HttpResponseStatusCode));
    expect(config.attributes.has(TelemetryAttribute.UserAgentOriginal));
    expect(config.attributes.has(TelemetryAttribute.HttpRequestMethod));
    expect(config.attributes.has(TelemetryAttribute.FgaClientRequestMethod));
    expect(config.attributes.has(TelemetryAttribute.FgaClientRequestClientId));
    expect(config.attributes.has(TelemetryAttribute.FgaClientRequestStoreId));
    expect(config.attributes.has(TelemetryAttribute.FgaClientRequestModelId));
    expect(config.attributes.has(TelemetryAttribute.HttpRequestResendCount));
    expect(config.attributes.has(TelemetryAttribute.FgaClientResponseModelId));

    // should not be there
    expect(config.attributes.has(TelemetryAttribute.UrlScheme)).toBe(false);
    expect(config.attributes.has(TelemetryAttribute.HttpRequestMethod)).toBe(false);
    expect(config.attributes.has(TelemetryAttribute.UrlFull)).toBe(false);
    expect(config.attributes.has(TelemetryAttribute.FgaClientUser)).toBe(false);
  });

  test("should return correct attributes based on enabled properties", () => {
    const config = new TelemetryMetricConfiguration(
      new Set<TelemetryAttribute>([
        TelemetryAttribute.FgaClientRequestClientId,
        TelemetryAttribute.HttpResponseStatusCode,
        TelemetryAttribute.UrlScheme,
        TelemetryAttribute.HttpRequestMethod,
      ])
    );

    const attributes = config.attributes;

    expect(attributes.size).toBe(4);
    expect(attributes.has(TelemetryAttribute.FgaClientRequestClientId));
    expect(attributes.has(TelemetryAttribute.HttpResponseStatusCode));
    expect(attributes.has(TelemetryAttribute.UrlScheme));
    expect(attributes.has(TelemetryAttribute.HttpRequestMethod));
  });
});

describe("TelemetryConfiguration", () => {
  test("should create a default TelemetryConfiguration instance", () => {
    const config = new TelemetryConfiguration();

    const counters = config.metrics.counterCredentialsRequest;
    expect(counters).toBeInstanceOf(TelemetryMetricConfiguration);
    expect(counters.attributes).toEqual(TelemetryConfiguration.defaultAttributes);
    
    const histogramQueryDuration = config.metrics.histogramQueryDuration;
    expect(histogramQueryDuration).toBeInstanceOf(TelemetryMetricConfiguration);
    expect(histogramQueryDuration.attributes).toEqual(TelemetryConfiguration.defaultAttributes);

    const histogramRequestDuration = config.metrics.histogramRequestDuration;
    expect(counters).toBeInstanceOf(TelemetryMetricConfiguration);
    expect(counters.attributes).toEqual(TelemetryConfiguration.defaultAttributes);
  });

  // TODO verify behavior for only specifying some of the metrics, what should the others be set to?
});
