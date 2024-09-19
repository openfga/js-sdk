import { Counter, Histogram, Meter } from "@opentelemetry/api";
import { TelemetryCounter } from "./counters";
import { TelemetryHistogram } from "./histograms";
import { metrics } from "@opentelemetry/api";

export enum TelemetryMetric {
  CounterCredentialsRequest = "counterCredentialsRequest",
  HistogramRequestDuration = "histogramRequestDuration",
  HistogramQueryDuration = "histogramQueryDuration",
}

export class TelemetryMetrics {
  private _meter: Meter | null = null;
  private _counters: Record<string, Counter> = {};
  private _histograms: Record<string, Histogram> = {};

  constructor(
    meter?: Meter,
    counters?: Record<string, Counter>,
    histograms?: Record<string, Histogram>
  ) {
    this._meter = meter || null;
    this._counters = counters || {};
    this._histograms = histograms || {};
  }

  meter(): Meter {
    if (!this._meter) {
      this._meter = metrics.getMeter("@openfga/sdk", "0.6.3");
    }
    return this._meter;
  }

  counter(counter: TelemetryCounter, value?: number, attributes?: Record<string, any>): Counter {
    if (!this._counters[counter.name]) {
      this._counters[counter.name] = this.meter().createCounter(counter.name, {
        description: counter.description,
        unit: counter.unit,
      });
    }

    if (value !== undefined) {
      this._counters[counter.name].add(value, attributes);
    }

    return this._counters[counter.name];
  }

  histogram(histogram: TelemetryHistogram, value?: number, attributes?: Record<string, any>): Histogram {
    if (!this._histograms[histogram.name]) {
      this._histograms[histogram.name] = this.meter().createHistogram(histogram.name, {
        description: histogram.description,
        unit: histogram.unit,
      });
    }

    if (value !== undefined) {
      this._histograms[histogram.name].record(value, attributes);
    }

    return this._histograms[histogram.name];
  }
}
