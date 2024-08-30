import { TelemetryMetricConfiguration, TelemetryConfiguration, TelemetryMetricsConfiguration } from '../../telemetry/configuration';
import { TelemetryAttributes } from '../../telemetry/attributes';

describe('TelemetryMetricConfiguration', () => {
  test('should create a default TelemetryMetricConfiguration instance', () => {
    const config = new TelemetryMetricConfiguration();

    expect(config.enabled).toBe(true);
    expect(config.attrFgaClientRequestClientId).toBe(true);
    expect(config.attrFgaClientRequestMethod).toBe(true);
    expect(config.attrFgaClientRequestModelId).toBe(true);
    expect(config.attrFgaClientRequestStoreId).toBe(true);
    expect(config.attrFgaClientResponseModelId).toBe(true);
    expect(config.attrFgaClientUser).toBe(false);
  });

  test('should return correct attributes based on enabled properties', () => {
    const config = new TelemetryMetricConfiguration(
      true, // enabled
      true, // attrFgaClientRequestClientId
      false, // attrFgaClientRequestMethod
      true, // attrFgaClientRequestModelId
      false, // attrFgaClientRequestStoreId
      true, // attrFgaClientResponseModelId
      false, // attrFgaClientUser
      true, // attrHttpClientRequestDuration
      false, // attrHttpHost
      true, // attrHttpRequestMethod
      true, // attrHttpRequestResendCount
      false, // attrHttpResponseStatusCode
      true, // attrHttpServerRequestDuration
      false, // attrUrlScheme
      true, // attrUrlFull
      false, // attrUserAgentOriginal
    );

    const attributes = config.attributes();

    expect(attributes).toEqual({
      [TelemetryAttributes.fgaClientRequestClientId.name]: true,
      [TelemetryAttributes.fgaClientRequestModelId.name]: true,
      [TelemetryAttributes.fgaClientResponseModelId.name]: true,
      [TelemetryAttributes.httpClientRequestDuration.name]: true,
      [TelemetryAttributes.httpRequestMethod.name]: true,
      [TelemetryAttributes.httpRequestResendCount.name]: true,
      [TelemetryAttributes.httpServerRequestDuration.name]: true,
      [TelemetryAttributes.urlFull.name]: true,
    });
  });
});

describe('TelemetryConfiguration', () => {
  test('should create a default TelemetryConfiguration instance', () => {
    const config = new TelemetryConfiguration();

    expect(config.metrics).toBeInstanceOf(TelemetryMetricsConfiguration);
    expect(config.metrics.counterCredentialsRequest.enabled).toBe(true);
  });

  test('should allow overriding telemetry configuration options', () => {
    const customMetrics = new TelemetryMetricsConfiguration();
    customMetrics.counterCredentialsRequest.enabled = false;

    const config = new TelemetryConfiguration(customMetrics);

    expect(config.metrics.counterCredentialsRequest.enabled).toBe(false);
  });
});
