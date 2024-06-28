# OpenTelemetry

This SDK produces [metrics](https://opentelemetry.io/docs/concepts/signals/metrics/) using [OpenTelemetry](https://opentelemetry.io/) that allow you to view data such as request timings. These metrics also include attributes for the model and store ID, as well as the API called to allow you to build reporting.

When an OpenTelemetry SDK instance is configured, the metrics will be exported and sent to the collector configured as part of your applications configuration. If you are not using OpenTelemetry, the metric functionality is a no-op and the events are never sent.

In cases when metrics events are sent, they will not be viewable outside of infrastructure configured in your application, and are never available to the OpenFGA team or contributors.

## Metrics

### Supported Metrics

| Metric Name                     | Type      | Description                                                                     |
|---------------------------------|-----------|---------------------------------------------------------------------------------|
| `fga-client.request.duration`   | Histogram | The total request time for FGA requests                                         |
| `fga-client.query.duration`     | Histogram | The amount of time the FGA server took to process the request                   |
|` fga-client.credentials.request`| Counter   | The total number of times a new token was requested when using ClientCredentials|

### Supported attributes

| Attribute Name                 |  Type     | Description                                                                         |
|--------------------------------|----------|-------------------------------------------------------------------------------------|
| `fga-client.response.model_id` | `string` | The authorization model ID that the FGA server used                                 |
| `fga-client.request.method`    | `string` | The FGA method/action that was performed                                            |
| `fga-client.request.store_id`  | `string` | The store ID that was sent as part of the request                                   |
| `fga-client.request.model_id`  | `string` | The authorization model ID that was sent as part of the request, if any             |
| `fga-client.request.client_id` | `string` | The client ID associated with the request, if any                                   |
| `fga-client.user`              | `string` | The user that is associated with the action of the request for check and list users |
| `http.status_code `            | `int`    | The status code of the response                                                     |
| `http.method`                  | `string` | The HTTP method for the request                                                     |
| `http.host`                    | `string` | Host identifier of the origin the request was sent to                               |