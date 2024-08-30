export interface TelemetryHistogram {
  name: string;
  unit: string;
  description: string;
}

export class TelemetryHistograms {
  static requestDuration: TelemetryHistogram = {
    name: 'fga-client.request.duration',
    unit: 'milliseconds',
    description: 'How long it took for a request to be fulfilled.',
  };

  static queryDuration: TelemetryHistogram = {
    name: 'fga-client.query.duration',
    unit: 'milliseconds',
    description: 'How long it took to perform a query request.',
  };
}
