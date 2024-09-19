import { FgaValidationError } from "../errors";
import { TelemetryAttribute } from "./attributes";
import { TelemetryMetric } from "./metrics";

/**
 * Configuration for a telemetry metric.
 * 
 * @interface TelemetryMetricConfig
 * @property {Set<TelemetryAttribute>} attributes - A set of attributes associated with the telemetry metric.
 */
export interface TelemetryMetricConfig {
  attributes: Set<TelemetryAttribute>;
}

/**
 * Represents the overall configuration for telemetry, including various metrics.
 * 
 * @interface TelemetryConfig
 * @property {Record<TelemetryMetric, TelemetryMetricConfig>} metrics - A record mapping telemetry metrics to their configurations.
 */
export interface TelemetryConfig {
  metrics: Record<TelemetryMetric, TelemetryMetricConfig>;
}

/**
 * Provides the configuration for a specific telemetry metric.
 * 
 * @class TelemetryMetricConfiguration
 * @implements {TelemetryMetricConfig}
 * @param {Set<TelemetryAttribute>} [attributes=TelemetryConfiguration.defaultAttributes] - A set of attributes for the metric. Defaults to the standard attributes.
 */
export class TelemetryMetricConfiguration implements TelemetryMetricConfig {
  constructor(
    public attributes: Set<TelemetryAttribute> = TelemetryConfiguration.defaultAttributes
  ) {}
}

/**
 * Manages the overall telemetry configuration, including default and valid attributes.
 * 
 * @class TelemetryConfiguration
 * @implements {TelemetryConfig}
 */
export class TelemetryConfiguration implements TelemetryConfig {

  /**
   * Default attributes for telemetry metrics.
   * 
   * @static
   * @readonly
   * @type {Set<TelemetryAttribute>}
   */
  public static readonly defaultAttributes: Set<TelemetryAttribute> = new Set<TelemetryAttribute>([
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

  /**
   * Valid attributes that can be used in telemetry metrics.
   * 
   * @static
   * @readonly
   * @type {Set<TelemetryAttribute>}
   */
  public static readonly validAttriburtes: Set<TelemetryAttribute> = new Set<TelemetryAttribute>([
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
    TelemetryAttribute.FgaClientUser,
  ]);

  /**
   * Creates an instance of TelemetryConfiguration.
   * 
   * @param {Record<TelemetryMetric, TelemetryMetricConfig>} [metrics] - A record mapping telemetry metrics to their configurations.
   */
  constructor(
    public metrics: Record<TelemetryMetric, TelemetryMetricConfig> = {
      [TelemetryMetric.CounterCredentialsRequest]: new TelemetryMetricConfiguration(),
      [TelemetryMetric.HistogramRequestDuration]: new TelemetryMetricConfiguration(),
      [TelemetryMetric.HistogramQueryDuration]: new TelemetryMetricConfiguration(),
    },
  ) {}

  /**
   * Validates that the configured metrics use only valid attributes.
   * 
   * @throws {FgaValidationError} Throws an error if any attribute in the metric configurations is invalid.
   */
  public ensureValid(): void {
    const validAttrs = TelemetryConfiguration.validAttriburtes;

    const counterConfigAttrs = this.metrics.counterCredentialsRequest?.attributes || new Set<TelemetryAttribute>();
    counterConfigAttrs.forEach(counterConfigAttr => {
      if (!validAttrs.has(counterConfigAttr)) {
        throw new FgaValidationError(`Configuration.telemetry.metrics.counterCredentialsRequest attribute '${counterConfigAttr}' is not a valid attribute`);
      }
    });

    const histogramRequestDurationConfigAttrs = this.metrics.histogramRequestDuration?.attributes || new Set<TelemetryAttribute>();
    histogramRequestDurationConfigAttrs.forEach(histogramRequestDurationAttr => {
      if (!validAttrs.has(histogramRequestDurationAttr)) {
        throw new FgaValidationError(`Configuration.telemetry.metrics.histogramRequestDuration attribute '${histogramRequestDurationAttr}' is not a valid attribute`);
      }
    });

    const histogramQueryDurationConfigAttrs = this.metrics.histogramQueryDuration?.attributes || new Set<TelemetryAttribute>();
    histogramQueryDurationConfigAttrs.forEach(histogramQueryDurationConfigAttr => {
      if (!validAttrs.has(histogramQueryDurationConfigAttr)) {
        throw new FgaValidationError(`Configuration.telemetry.metrics.histogramQueryDuration attribute '${histogramQueryDurationConfigAttr}' is not a valid attribute`);
      }
    });
  }
}
