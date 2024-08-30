import { TelemetryAttributes, TelemetryAttribute } from './attributes';

export class TelemetryMetricConfiguration {
  constructor(
    public enabled: boolean = true,
    public attrFgaClientRequestClientId: boolean = true,
    public attrFgaClientRequestMethod: boolean = true,
    public attrFgaClientRequestModelId: boolean = true,
    public attrFgaClientRequestStoreId: boolean = true,
    public attrFgaClientResponseModelId: boolean = true,
    public attrFgaClientUser: boolean = false,
    public attrHttpClientRequestDuration: boolean = false,
    public attrHttpHost: boolean = true,
    public attrHttpRequestMethod: boolean = true,
    public attrHttpRequestResendCount: boolean = true,
    public attrHttpResponseStatusCode: boolean = true,
    public attrHttpServerRequestDuration: boolean = false,
    public attrUrlScheme: boolean = true,
    public attrUrlFull: boolean = true,
    public attrUserAgentOriginal: boolean = true
  ) {}

  attributes(): Record<string, boolean> {
    const enabled: Record<string, boolean> = {};

    Object.entries(this).forEach(([key, value]) => {
      if (key.startsWith('attr') && value) {
        let attrKey = key.replace('attr', '') as keyof typeof TelemetryAttributes;
        attrKey = attrKey.charAt(0).toLowerCase() + attrKey.slice(1);

        const telemetryAttribute = TelemetryAttributes[attrKey as keyof typeof TelemetryAttributes] as TelemetryAttribute;

        if (telemetryAttribute) {
          enabled[telemetryAttribute.name] = true;
        }
      }
    });

    return enabled;
  }
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
}
