# `FgaApiAuthenticationError` Extends `FgaError` Instead of `FgaApiError` — Broken Error Hierarchy

## Bug Description

Every API error class (`FgaApiValidationError`, `FgaApiNotFoundError`, `FgaApiRateLimitExceededError`, `FgaApiInternalError`) extends `FgaApiError`, which adds structured properties like `statusCode`, `method`, `requestURL`, `responseData`, etc.

However, `FgaApiAuthenticationError` extends `FgaError` directly:

```ts
export class FgaApiAuthenticationError extends FgaError {
```

This means:
1. `catch (e) { if (e instanceof FgaApiError) }` will **not** catch authentication errors
2. The class re-declares all API error properties independently, missing any future additions to `FgaApiError`

## Steps to Reproduce

```ts
try {
    // Make a request that returns 401
} catch (err) {
    console.log(err instanceof FgaApiError); // false — should be true!
    console.log(err instanceof FgaApiAuthenticationError); // true
}
```

## Expected Behavior

`FgaApiAuthenticationError` should extend `FgaApiError` so that `instanceof FgaApiError` catches all API errors including authentication errors.

## Actual Behavior

`FgaApiAuthenticationError` extends `FgaError`, breaking the error hierarchy. Generic `catch` blocks checking `instanceof FgaApiError` miss authentication errors.
