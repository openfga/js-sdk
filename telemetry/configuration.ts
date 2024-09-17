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

export class TelemetryMetricConfiguration {
  constructor(
    public attributes: Set<TelemetryAttribute> = defaultAttributes
  ) {}
}

export class TelemetryMetricsConfiguration {
  constructor(
    public counterCredentialsRequest: TelemetryMetricConfiguration = new TelemetryMetricConfiguration(),
    public histogramRequestDuration: TelemetryMetricConfiguration = new TelemetryMetricConfiguration(),
    public histogramQueryDuration: TelemetryMetricConfiguration = new TelemetryMetricConfiguration()
  ) {}
}

export class TelemetryConfiguration {
  constructor(public metrics: TelemetryMetricsConfiguration = new TelemetryMetricsConfiguration()) {}

  // TODO move validation to a method here, like this (causing usage issues currently):
  // isValid(): boolean {
  //   return true;
  //   // if (!this.metrics) {
  //   //   return true;
  //   // }
  // ...
  // }
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
