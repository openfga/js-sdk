import { FgaValidationError } from "../errors";
import { TelemetryAttribute } from "./attributes";
import { TelemetryMetric } from "./metrics";

export interface TelemetryMetricConfig {
  attributes: Set<TelemetryAttribute>;
}

export interface TelemetryConfig {
  metrics: Record<TelemetryMetric, TelemetryMetricConfig>;
}

export class TelemetryMetricConfiguration implements TelemetryMetricConfig {
  constructor(
    public attributes: Set<TelemetryAttribute> = TelemetryConfiguration.defaultAttributes
  ) {}
}

export class TelemetryConfiguration implements TelemetryConfig {
  public static readonly defaultAttributes = new Set<TelemetryAttribute>([
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
  
  public static readonly validAttriburtes = new Set<TelemetryAttribute>([
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

  constructor(
    public metrics: Record<TelemetryMetric, TelemetryMetricConfig> = {
      [TelemetryMetric.CounterCredentialsRequest]: new TelemetryMetricConfiguration(),
      [TelemetryMetric.HistogramRequestDuration]: new TelemetryMetricConfiguration(),
      [TelemetryMetric.HistogramQueryDuration]: new TelemetryMetricConfiguration(),
    },
  ) {}

  public ensureValid(): void {
    const validAttrs = TelemetryConfiguration.validAttriburtes;

    const counterConfigAttrs = this.metrics.counterCredentialsRequest?.attributes || new Set<TelemetryAttribute>;
    counterConfigAttrs.forEach(counterConfigAttr => {
      if (!validAttrs.has(counterConfigAttr)) {
        throw new FgaValidationError(`Configuration.telemtry.metrics.counterCredentialsRequest attribute '${counterConfigAttrs}' is not a valid attribute`);
      }
    });

    const histogramRequestDurationConfigAttrs = this.metrics.histogramRequestDuration?.attributes || new Set<TelemetryAttribute>;
    histogramRequestDurationConfigAttrs.forEach(histogramRequestDurationAttr => {
      if (!validAttrs.has(histogramRequestDurationAttr)) {
        throw new FgaValidationError(`Configuration.telemtry.metrics.histogramRequestDuration attribute '${histogramRequestDurationAttr}' is not a valid attribute`);
      }
    });

    const histogramQueryDurationConfigAttrs = this.metrics.histogramQueryDuration?.attributes || new Set<TelemetryAttribute>;
    histogramQueryDurationConfigAttrs.forEach(histogramQueryDurationConfigAttr => {
      if (!validAttrs.has(histogramQueryDurationConfigAttr)) {
        throw new FgaValidationError(`Configuration.telemtry.metrics.histogramQueryDuration attribute '${histogramQueryDurationConfigAttrs}' is not a valid attribute`);
      }
    });
  }
}
