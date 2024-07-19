import "dotenv/config";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import process from "process";

const sdk = new NodeSDK({
  metricReader: new PeriodicExportingMetricReader({
    exportIntervalMillis: 5000,
    exporter: new OTLPMetricExporter({
      concurrencyLimit: 1,
    }),
  }),
});
sdk.start();

process.on("exit", () => {
  sdk
    .shutdown()
    .then(
      () => console.log("SDK shut down successfully"),
      (err) => console.log("Error shutting down SDK", err)
    )
    .finally(() => process.exit(0));
});