# OpenTelemetry

This SDK produces [metrics](https://opentelemetry.io/docs/concepts/signals/metrics/) using [OpenTelemetry](https://opentelemetry.io/) that allow you to view data such as request timings. These metrics also include attributes for the model and store ID, as well as the API called to allow you to build reporting.

When an OpenTelemetry SDK instance is configured, the metrics will be exported and sent to the collector configured as part of your applications configuration. If you are not using OpenTelemetry, the metric functionality is a no-op and the events are never sent.

In cases when metrics events are sent, they will not be viewable outside of infrastructure configured in your application, and are never available to the OpenFGA team or contributors.

## Metrics

### Supported Metrics

| Metric Name                     | Type      | Enabled by default | Description                                                                     |
|---------------------------------|-----------|--------------------|---------------------------------------------------------------------------------|
| `fga-client.request.duration`   | Histogram | Yes                | The total request time for FGA requests                                         |
| `fga-client.query.duration`     | Histogram | Yes                | The amount of time the FGA server took to process the request                   |
|` fga-client.credentials.request`| Counter   | Yes                | The total number of times a new token was requested when using ClientCredentials|

### Supported attributes

| Attribute Name                 |  Type     | Enabled by default | Description                                                                         |
|--------------------------------|-----------|--------------------|-------------------------------------------------------------------------------------|
| `fga-client.response.model_id` | `string`  | Yes                | The authorization model ID that the FGA server used                                 |
| `fga-client.request.method`    | `string`  | Yes                | The FGA method/action that was performed                                            |
| `fga-client.request.store_id`  | `string`  | Yes                | The store ID that was sent as part of the request                                   |
| `fga-client.request.model_id`  | `string`  | Yes                | The authorization model ID that was sent as part of the request, if any             |
| `fga-client.request.client_id` | `string`  | Yes                | The client ID associated with the request, if any                                   |
| `fga-client.user`              | `string`  | No                 | The user that is associated with the action of the request for check and list users |
| `http.status_code `            | `int`     | Yes                | The status code of the response                                                     |
| `http.request.method`          | `string`  | No                 | The HTTP method for the request                                                     |
| `http.host`                    | `string`  | Yes                | Host identifier of the origin the request was sent to                               |
| `user_agent.original`          | `string`  | Yes                | The user agent used in the query                                                    |
| `url.full`                     | `string`  | No                 | The full URL of the request                                                         |
| `url.scheme`                   | `string`  | No                 | HTTP Scheme of the request (http/https)                                             |
| `http.request.resend_count`    | `int`     | Yes                | The number of retries attempted                                                     |
| `http.client.request.duration` | `int`     | No                 | Time taken by the FGA server to process and evaluate the request, rounded to the nearest milliseconds   |
| `http.server.request.duration` | `int`     | No                 | The number of retries attempted                                                     |

## Default attributes

Not all attributes are enabled by default.

Some attributes, like `fga-client.user` have been disabled by default due to their high cardinality, which may result for very high costs when using some SaaS metric collectors. If you expect to have a high cardinality for a specific attribute, you can disable it by updating the telemetry configuration accordingly.

If your configuration does not specify a given metric, the default attributes for that metric will be used.


```javascript
// define desired telemetry options
const telemetryConfig = {
  metrics: {
    counterCredentialsRequest: {
      attributes: new Set([
        TelemetryAttribute.UrlScheme,
        TelemetryAttribute.UserAgentOriginal,
        TelemetryAttribute.HttpRequestMethod,
        TelemetryAttribute.FgaClientRequestClientId,
        TelemetryAttribute.FgaClientRequestStoreId,
        TelemetryAttribute.FgaClientRequestModelId,
        TelemetryAttribute.HttpRequestResendCount,
      ])
    },
    histogramRequestDuration: {
      attributes: new Set([
        TelemetryAttribute.HttpResponseStatusCode,
        TelemetryAttribute.UserAgentOriginal,
        TelemetryAttribute.FgaClientRequestMethod,
        TelemetryAttribute.FgaClientRequestClientId,
        TelemetryAttribute.FgaClientRequestStoreId,
        TelemetryAttribute.FgaClientRequestModelId,
        TelemetryAttribute.HttpRequestResendCount,
      ])
    },
    histogramQueryDuration: {
      attributes: new Set([
        TelemetryAttribute.HttpResponseStatusCode,
        TelemetryAttribute.UserAgentOriginal,
        TelemetryAttribute.FgaClientRequestMethod,
        TelemetryAttribute.FgaClientRequestClientId,
        TelemetryAttribute.FgaClientRequestStoreId,
        TelemetryAttribute.FgaClientRequestModelId,
        TelemetryAttribute.HttpRequestResendCount,
      ])
    }
  }
};

const fgaClient = new OpenFgaClient({
  apiUrl: process.env.FGA_API_URL,
  storeId: process.env.FGA_STORE_ID,
  authorizationModelId: process.env.FGA_MODEL_ID,
  credentials,
  telemetry: telemetryConfig,
});

```

## Example

There is an [example project](https://github.com/openfga/js-sdk/blob/main/example/opentelemetry) that provides some guidance on how to configure OpenTelemetry available in the examples directory.