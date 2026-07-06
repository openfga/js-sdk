# API Executor Example

Demonstrates how to use the low-level `executeApiRequest` and `executeStreamedApiRequest` methods on `OpenFgaClient` to call real OpenFGA API endpoints — both standard request/response and streaming.

These methods let you make raw HTTP calls to any OpenFGA endpoint while still honoring the client configuration (authentication, telemetry, retries, and error handling).

## When to Use

- You want to call a **new endpoint** that is not yet supported by the SDK
- You are using an **earlier version** of the SDK that doesn't yet support a particular endpoint
- You have a **custom endpoint** deployed that extends the OpenFGA API

For the recommended high-level typed approach, see the [example1](../example1/) and [streamed-list-objects](../streamed-list-objects/) examples.

## What It Does

| # | Operation                | Method   | Path                                              |
|---|--------------------------|----------|---------------------------------------------------|
| 1 | ListStores               | `GET`    | `/stores`                                         |
| 2 | CreateStore              | `POST`   | `/stores`                                         |
| 3 | GetStore                 | `GET`    | `/stores/{store_id}`                              |
| 4 | WriteAuthorizationModel  | `POST`   | `/stores/{store_id}/authorization-models`         |
| 5 | WriteTuples              | `POST`   | `/stores/{store_id}/write`                        |
| 6 | ReadTuples               | `POST`   | `/stores/{store_id}/read`                         |
| 7 | Check (custom header)    | `POST`   | `/stores/{store_id}/check`                        |
| 8 | ListObjects              | `POST`   | `/stores/{store_id}/list-objects`                 |
| 9 | StreamedListObjects      | `POST`   | `/stores/{store_id}/streamed-list-objects` (streaming) |
| 10| DeleteStore              | `DELETE` | `/stores/{store_id}`                              |

## Prerequisites

- **Node.js** 16.13.0+
- **OpenFGA server** running on `http://localhost:8080` (or set `FGA_API_URL`)

You can start a local server with:

```bash
docker run -p 8080:8080 openfga/openfga:latest run
```

## Running

```bash
# From the repo root — build the SDK first
npm run build

# Then run the example
cd example/api-executor
npm install
npm start
```

## Key Concepts

### `executeApiRequest`

Make a standard (non-streaming) HTTP request:

```javascript
const response = await fgaClient.executeApiRequest({
  operationName: 'ListStores',   // for telemetry / logging
  method: 'GET',
  path: '/stores',
  queryParams: { page_size: 10 },
});
```

### Path Parameters

Use `{param_name}` placeholders in the path and supply values via `pathParams` — they are automatically URL-encoded:

```javascript
const response = await fgaClient.executeApiRequest({
  operationName: 'GetStore',
  method: 'GET',
  path: '/stores/{store_id}',
  pathParams: { store_id: 'your-store-id' },
});
```

### Custom Headers

Pass per-request headers directly in the request object:

```javascript
const response = await fgaClient.executeApiRequest({
  operationName: 'Check',
  method: 'POST',
  path: '/stores/{store_id}/check',
  pathParams: { store_id: storeId },
  headers: { 'X-Request-ID': 'example-123' },
  body: { /* ... */ },
});
```

### `executeStreamedApiRequest`

For streaming endpoints (e.g. `streamed-list-objects`), use `executeStreamedApiRequest` combined with `parseNDJSONStream`:

```javascript
import { parseNDJSONStream } from '@openfga/sdk';

const streamResp = await fgaClient.executeStreamedApiRequest({
  operationName: 'StreamedListObjects',
  method: 'POST',
  path: '/stores/{store_id}/streamed-list-objects',
  pathParams: { store_id: storeId },
  body: {
    authorization_model_id: modelId,
    user: 'user:alice',
    relation: 'reader',
    type: 'document',
  },
});

const source = streamResp?.$response?.data ?? streamResp;

for await (const item of parseNDJSONStream(source)) {
  console.log(item.result.object);
}
```

## Expected Output

```
=== OpenFGA executeApiRequest Example ===

1. ListStores (GET /stores)
   Stores count: 0

2. CreateStore (POST /stores)
   Store ID: 01J... | Name: api-executor-example

3. GetStore (GET /stores/{store_id})
   Name: api-executor-example | Created: 2025-...

4. WriteAuthorizationModel
   Model ID: 01J...

5. WriteTuples
   Tuples written: user:alice→writer, user:bob→reader on document:roadmap

6. ReadTuples (POST /stores/{store_id}/read)
   Found 2 tuple(s):
     - user:alice is writer of document:roadmap
     - user:bob is reader of document:roadmap

7. Check (with custom header)
   user:alice writer document:roadmap → Allowed: true
   user:bob   writer document:roadmap → Allowed: false

8. ListObjects
   Objects user:alice can write: ["document:roadmap"]

9. StreamedListObjects (executeStreamedApiRequest)
   Writing 200 additional tuples for streaming demo...
     Object: document:doc-1
     Object: document:doc-2
     Object: document:doc-3
     Object: document:doc-50
     Object: document:doc-100
     Object: document:doc-150
     Object: document:doc-200
   ✓ Streamed 200 objects

10. DeleteStore (cleanup)
    Store 01J... deleted

=== All examples completed successfully! ===
```

