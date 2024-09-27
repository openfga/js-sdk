export interface TelemetryCounter {
  name: string;
  unit: string;
  description: string;
}

export class TelemetryCounters {
  static credentialsRequest: TelemetryCounter = {
    name: "fga-client.credentials.request",
    unit: "milliseconds",
    description: "The number of times an access token is requested.",
  };
}
