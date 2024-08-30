import { URL } from 'url';

export interface TelemetryAttribute {
  name: string;
}

export class TelemetryAttributes {
  static fgaClientRequestClientId: TelemetryAttribute = { name: 'fga-client.request.client_id' };
  static fgaClientRequestMethod: TelemetryAttribute = { name: 'fga-client.request.method' };
  static fgaClientRequestModelId: TelemetryAttribute = { name: 'fga-client.request.model_id' };
  static fgaClientRequestStoreId: TelemetryAttribute = { name: 'fga-client.request.store_id' };
  static fgaClientResponseModelId: TelemetryAttribute = { name: 'fga-client.response.model_id' };
  static fgaClientUser: TelemetryAttribute = { name: 'fga-client.user' };
  static httpClientRequestDuration: TelemetryAttribute = { name: 'http.client.request.duration' };
  static httpHost: TelemetryAttribute = { name: 'http.host' };
  static httpRequestMethod: TelemetryAttribute = { name: 'http.request.method' };
  static httpRequestResendCount: TelemetryAttribute = { name: 'http.request.resend_count' };
  static httpResponseStatusCode: TelemetryAttribute = { name: 'http.response.status_code' };
  static httpServerRequestDuration: TelemetryAttribute = { name: 'http.server.request.duration' };
  static urlScheme: TelemetryAttribute = { name: 'url.scheme' };
  static urlFull: TelemetryAttribute = { name: 'url.full' };
  static userAgentOriginal: TelemetryAttribute = { name: 'user_agent.original' };

  prepare(
    attributes?: Record<string, string | number>,
    filter?: string[]
  ): Record<string, string | number> {
    const response: Record<string, string | number> = {};

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        if (filter && !filter.includes(key)) return;
        response[key] = value;
      });
    }

    return Object.fromEntries(Object.entries(response).sort());
  }

  fromRequest({
    userAgent,
    fgaMethod,
    httpMethod,
    url,
    resendCount,
    start,
    credentials,
    attributes = {},
  }: {
    userAgent?: string;
    fgaMethod?: string;
    httpMethod?: string;
    url?: string;
    resendCount?: number;
    start?: number;
    credentials?: any;
    attributes?: Record<string, string | number>;
  }): Record<string, string | number> {
    if (fgaMethod) attributes[TelemetryAttributes.fgaClientRequestMethod.name] = fgaMethod;
    if (userAgent) attributes[TelemetryAttributes.userAgentOriginal.name] = userAgent;
    if (httpMethod) attributes[TelemetryAttributes.httpRequestMethod.name] = httpMethod;

    if (url) {
      const parsedUrl = new URL(url);
      attributes[TelemetryAttributes.httpHost.name] = parsedUrl.hostname;
      attributes[TelemetryAttributes.urlScheme.name] = parsedUrl.protocol;
      attributes[TelemetryAttributes.urlFull.name] = url;
    }

    if (start) attributes[TelemetryAttributes.httpClientRequestDuration.name] = Date.now() - start;
    if (resendCount) attributes[TelemetryAttributes.httpRequestResendCount.name] = resendCount;
    if (credentials && credentials.method === 'client_credentials') {
      attributes[TelemetryAttributes.fgaClientRequestClientId.name] = credentials.configuration.clientId;
    }

    return attributes;
  }

  fromResponse({
    response,
    credentials,
    attributes = {},
  }: {
    response: any;
    credentials?: any;
    attributes?: Record<string, string | number>;
  }): Record<string, string | number> {
    if (response?.status) attributes[TelemetryAttributes.httpResponseStatusCode.name] = response.status;

    const responseHeaders = response?.headers || {};
    const responseModelId = responseHeaders['openfga-authorization-model-id'];
    const responseQueryDuration = responseHeaders['fga-query-duration-ms'];

    if (responseModelId) attributes[TelemetryAttributes.fgaClientResponseModelId.name] = responseModelId;
    if (responseQueryDuration) attributes[TelemetryAttributes.httpServerRequestDuration.name] = responseQueryDuration;

    if (credentials && credentials.method === 'client_credentials') {
      attributes[TelemetryAttributes.fgaClientRequestClientId.name] = credentials.configuration.clientId;
    }

    return attributes;
  }
}
