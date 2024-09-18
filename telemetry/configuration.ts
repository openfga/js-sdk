import { TelemetryAttribute } from "./attributes";


const defaultAttributes = new Set<TelemetryAttribute>([
  TelemetryAttribute.HttpHost,
  TelemetryAttribute.HttpResponseStatusCode,
  TelemetryAttribute.UserAgentOriginal,
  TelemetryAttribute.FgaClientRequestMethod,
  TelemetryAttribute.FgaClientRequestClientId,
  TelemetryAttribute.FgaClientRequestStoreId,
  TelemetryAttribute.FgaClientRequestModelId,
  TelemetryAttribute.HttpRequestResendCount,
  TelemetryAttribute.FgaClientResponseModelId,

  // These metrics are not included by default because they are usually less useful
  // TelemetryAttribute.UrlScheme,
  // TelemetryAttribute.HttpRequestMethod,
  // TelemetryAttribute.UrlFull,
  // TelemetryAttribute.HttpClientRequestDuration,
  // TelemetryAttribute.HttpServerRequestDuration

  // This not included by default as it has a very high cardinality which could increase costs for users
  // TelemetryAttribute.FgaClientUser
]);

export class TelemetryMetricConfiguration implements TelemetryMetricConfig {
  constructor(
    public attributes: Set<TelemetryAttribute> = defaultAttributes
  ) {}
}

// Drop this whole class. Do this logic in the calling class (TelemetryCOnfiguration)
export class TelemetryMetricsConfiguration implements MetricsConfig {
  //  instead of taking 3 individual metrics, accept a map. e.g., 
  // ["counterCredentialsRequest": TelemetryMetricConfig]
  // only constructor will change
  constructor(
    public counterCredentialsRequest: TelemetryMetricConfig = new TelemetryMetricConfiguration(),
    public histogramRequestDuration: TelemetryMetricConfig = new TelemetryMetricConfiguration(),
    public histogramQueryDuration: TelemetryMetricConfig = new TelemetryMetricConfiguration()
  ) {
    if (!(counterCredentialsRequest instanceof TelemetryMetricConfiguration)) {
      counterCredentialsRequest = new TelemetryMetricConfiguration(counterCredentialsRequest.attributes);
    }
    if (!(histogramRequestDuration instanceof TelemetryMetricConfiguration)) {
      histogramRequestDuration = new TelemetryMetricConfiguration(histogramRequestDuration.attributes);
    }
    if (!(histogramQueryDuration instanceof TelemetryMetricConfiguration)) {
      histogramQueryDuration = new TelemetryMetricConfiguration(histogramQueryDuration.attributes);
    }
  }
}

export interface TelemetryMetricConfig {
  attributes: Set<TelemetryAttribute>;
}

export interface MetricsConfig {
  counterCredentialsRequest: TelemetryMetricConfiguration;
  histogramRequestDuration: TelemetryMetricConfiguration;
  histogramQueryDuration: TelemetryMetricConfiguration;
}

export interface TelemetryConfig {
  metrics: MetricsConfig
}

export class TelemetryConfiguration implements TelemetryConfig {
  constructor(public metrics: MetricsConfig = new TelemetryMetricsConfiguration()) {
    if (!(metrics instanceof TelemetryMetricsConfiguration)) {
      // metrics = {"counterCredentialsRequest": new TelemetryMetricConfiguration(metrics.counterCredentialsRequest.attributes) }
      metrics = new TelemetryMetricsConfiguration(metrics.counterCredentialsRequest, metrics.histogramRequestDuration, metrics.histogramQueryDuration);
    }
  }

  // TODO move validation to a method here, like this (causing usage issues currently):
  isValid(): boolean {
    return true;
    // if (!this.metrics) {
    //   return true;
    // }

  }
}

export function validAttributes(): Set<TelemetryAttribute> {
  return new Set<TelemetryAttribute>([
    TelemetryAttribute.HttpHost,
    TelemetryAttribute.HttpResponseStatusCode,
    TelemetryAttribute.UserAgentOriginal,
    TelemetryAttribute.FgaClientRequestMethod,
    TelemetryAttribute.FgaClientRequestClientId,
    TelemetryAttribute.FgaClientRequestStoreId,
    TelemetryAttribute.FgaClientRequestModelId,
    TelemetryAttribute.HttpRequestResendCount,
    TelemetryAttribute.FgaClientResponseModelId,
    TelemetryAttribute.UrlScheme,
    TelemetryAttribute.HttpRequestMethod,
    TelemetryAttribute.UrlFull,
    TelemetryAttribute.HttpClientRequestDuration,
    TelemetryAttribute.HttpServerRequestDuration,
    TelemetryAttribute.FgaClientUser
  ]);
}
