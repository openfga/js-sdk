# Streamed List Objects (Local)

This example demonstrates using the js-sdk `streamedListObjects` API against a locally running OpenFGA server that you manage yourself.

Prerequisites:
- Node.js 18+
- An OpenFGA server reachable at `FGA_API_URL` (defaults to `http://localhost:8080`)

Run:
1. From repo root, build the SDK once:
   - `cd js-sdk && npm run build`
2. Set the API URL (optional) and run the example:
   - `cd js-sdk/example/streamed-list-objects-local`
   - `FGA_API_URL=http://localhost:8080 node run.mjs`

What it does:
- Creates a temporary store
- Writes a schema 1.1 model with an assignable relation
- Inserts 3 tuples
- Streams them via `streamedListObjects`
- Cleans up the store
