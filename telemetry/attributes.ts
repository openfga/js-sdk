import { URL } from "url";

export enum TelemetryAttribute {
  FgaClientRequestClientId = "fga-client.request.client_id",
  FgaClientRequestMethod = "fga-client.request.method",
  FgaClientRequestModelId = "fga-client.request.model_id",
  FgaClientRequestStoreId = "fga-client.request.store_id",
  FgaClientResponseModelId  = "fga-client.response.model_id",
  FgaClientUser = "fga-client.user",
  HttpClientRequestDuration = "http.client.request.duration",
  HttpHost = "http.host",
  HttpRequestMethod = "http.request.method",
  HttpRequestResendCount = "http.request.resend_count",
  HttpResponseStatusCode = "http.response.status_code",
  HttpServerRequestDuration = "http.server.request.duration",
  UrlScheme = "url.scheme",
  UrlFull = "url.full",
  UserAgentOriginal = "user_agent.original",
}

export class TelemetryAttributes {
  static prepare(
    attributes?: Record<string, string | number>,
    filter?: Set<TelemetryAttribute>
  ): Record<string, string | number> {
    attributes = attributes || {};
    // ensure we are always using a set
    filter = new Set(filter) || new Set();
    const result: Record<string, string | number> = {};
  
    for (const key in attributes) {
      if (filter.has(key as TelemetryAttribute)) {
        result[key] = attributes[key];
      }
    }
  
    return result;
  }

  static fromRequest({
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
    if (fgaMethod) attributes[TelemetryAttribute.FgaClientRequestMethod] = fgaMethod;
    if (userAgent) attributes[TelemetryAttribute.UserAgentOriginal] = userAgent;
    if (httpMethod) attributes[TelemetryAttribute.HttpRequestMethod] = httpMethod;

    if (url) {
      const parsedUrl = new URL(url);
      attributes[TelemetryAttribute.HttpHost] = parsedUrl.hostname;
      attributes[TelemetryAttribute.UrlScheme] = parsedUrl.protocol;
      attributes[TelemetryAttribute.UrlFull] = url;
    }

    if (start) attributes[TelemetryAttribute.HttpClientRequestDuration] = Math.round(performance.now() - start);
    if (resendCount) attributes[TelemetryAttribute.HttpRequestResendCount] = resendCount;
    if (credentials && credentials.method === "client_credentials") {
      attributes[TelemetryAttribute.FgaClientRequestClientId] = credentials.configuration.clientId;
    }

    return attributes;
  }

  static fromResponse({
    response,
    attributes = {},
  }: {
    response: any;
    attributes?: Record<string, string | number>;
  }): Record<string, string | number> {
    if (response?.status) attributes[TelemetryAttribute.HttpResponseStatusCode] = response.status;

    const responseHeaders = response?.headers || {};
    const responseModelId = responseHeaders["openfga-authorization-model-id"];
    const responseQueryDuration = responseHeaders["fga-query-duration-ms"] ? parseInt(responseHeaders["fga-query-duration-ms"], 10) : undefined;

    if (responseModelId) {
      attributes[TelemetryAttribute.FgaClientResponseModelId] = responseModelId;
    }
    if (typeof responseQueryDuration !== "undefined" && Number.isFinite(responseQueryDuration)) {
      attributes[TelemetryAttribute.HttpServerRequestDuration] = responseQueryDuration as number;
    }

    return attributes;
  }
}
