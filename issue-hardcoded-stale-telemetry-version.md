# `MetricRecorder.meter()` Uses Hardcoded Stale Version `"0.6.3"`

## Bug Description

The `MetricRecorder.meter()` method in `telemetry/metrics.ts` creates an OpenTelemetry meter with a hardcoded version string `"0.6.3"`:

```ts
this._meter = metrics.getMeter("@openfga/sdk", "0.6.3");
```

The actual SDK version is `0.9.0` (as defined in `configuration.ts` and `package.json`). This means all telemetry data is tagged with the wrong version, making version-based filtering and dashboarding unreliable.

## Steps to Reproduce

1. Create a `MetricRecorder` instance
2. Call `meter()` to get the OpenTelemetry meter
3. Observe that `getMeter` is called with version `"0.6.3"` instead of `"0.9.0"`

## Expected Behavior

The meter should be created with the actual SDK version (`"0.9.0"`).

## Actual Behavior

The meter is created with the stale hardcoded version `"0.6.3"`.

## Suggested Fix

Use the SDK version from `configuration.ts` or `package.json` instead of the hardcoded string.
