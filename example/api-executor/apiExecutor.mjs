// This example demonstrates how to use the low-level executeApiRequest and
// executeStreamedApiRequest methods on OpenFgaClient to call real OpenFGA API
// endpoints — both standard request/response and streaming.
//
// These methods let you make raw HTTP calls to any OpenFGA endpoint while still
// honoring the client configuration (authentication, telemetry, retries, and
// error handling).
//
// It exercises the following operations against a live OpenFGA server:
//
//  1.  ListStores                — GET    /stores
//  2.  CreateStore               — POST   /stores
//  3.  GetStore                  — GET    /stores/{store_id}
//  4.  WriteAuthorizationModel   — POST   /stores/{store_id}/authorization-models
//  5.  WriteTuples               — POST   /stores/{store_id}/write
//  6.  ReadTuples                — POST   /stores/{store_id}/read
//  7.  Check                     — POST   /stores/{store_id}/check
//  8.  ListObjects               — POST   /stores/{store_id}/list-objects
//  9.  StreamedListObjects       — POST   /stores/{store_id}/streamed-list-objects  (streaming)
//  10. DeleteStore               — DELETE /stores/{store_id}
//
// For the recommended high-level typed approach, see the example1 and
// streamed-list-objects examples.

import { OpenFgaClient, parseNDJSONStream } from "../../dist/index.js";

const apiUrl = process.env.FGA_API_URL || "http://localhost:8080";

function handleError(context, err) {
  console.error(`\nError in ${context}: ${err.message || err}`);
  console.error("\nMake sure OpenFGA is running on localhost:8080 (or set FGA_API_URL)");
  console.error("Run: docker run -p 8080:8080 openfga/openfga:latest run");
  process.exit(1);
}

async function main() {
  // We create an SDK client only to use its executeApiRequest /
  // executeStreamedApiRequest methods. All actual API calls below go through
  // the generic executor rather than the typed convenience methods.
  const fgaClient = new OpenFgaClient({ apiUrl });

  console.log("=== OpenFGA executeApiRequest Example ===\n");

  // -----------------------------------------------------------------
  // 1. ListStores (GET /stores) — raw executeApiRequest
  // -----------------------------------------------------------------
  console.log("1. ListStores (GET /stores)");
  let listStoresResp;
  try {
    listStoresResp = await fgaClient.executeApiRequest({
      operationName: "ListStores",
      method: "GET",
      path: "/stores",
    });
  } catch (err) {
    handleError("ListStores", err);
  }
  console.log(`   Stores count: ${listStoresResp.stores?.length ?? 0}\n`);

  // -----------------------------------------------------------------
  // 2. CreateStore (POST /stores)
  // -----------------------------------------------------------------
  console.log("2. CreateStore (POST /stores)");
  let createStoreResp;
  try {
    createStoreResp = await fgaClient.executeApiRequest({
      operationName: "CreateStore",
      method: "POST",
      path: "/stores",
      body: { name: "api-executor-example" },
    });
  } catch (err) {
    handleError("CreateStore", err);
  }
  const storeId = createStoreResp.id;
  console.log(`   Store ID: ${storeId} | Name: ${createStoreResp.name}\n`);

  // -----------------------------------------------------------------
  // 3. GetStore (GET /stores/{store_id}) — path parameters
  // -----------------------------------------------------------------
  console.log("3. GetStore (GET /stores/{store_id})");
  let getStoreResp;
  try {
    getStoreResp = await fgaClient.executeApiRequest({
      operationName: "GetStore",
      method: "GET",
      path: "/stores/{store_id}",
      pathParams: { store_id: storeId },
    });
  } catch (err) {
    handleError("GetStore", err);
  }
  console.log(`   Name: ${getStoreResp.name} | Created: ${getStoreResp.created_at}\n`);

  // -----------------------------------------------------------------
  // 4. WriteAuthorizationModel (POST /stores/{store_id}/authorization-models)
  // -----------------------------------------------------------------
  console.log("4. WriteAuthorizationModel");
  let writeModelResp;
  try {
    writeModelResp = await fgaClient.executeApiRequest({
      operationName: "WriteAuthorizationModel",
      method: "POST",
      path: "/stores/{store_id}/authorization-models",
      pathParams: { store_id: storeId },
      body: {
        schema_version: "1.1",
        type_definitions: [
          {
            type: "user",
            relations: {},
          },
          {
            type: "document",
            relations: {
              reader: { this: {} },
              writer: { this: {} },
            },
            metadata: {
              relations: {
                reader: {
                  directly_related_user_types: [{ type: "user" }],
                },
                writer: {
                  directly_related_user_types: [{ type: "user" }],
                },
              },
            },
          },
        ],
      },
    });
  } catch (err) {
    handleError("WriteAuthorizationModel", err);
  }
  const modelId = writeModelResp.authorization_model_id;
  console.log(`   Model ID: ${modelId}\n`);

  // -----------------------------------------------------------------
  // 5. WriteTuples (POST /stores/{store_id}/write)
  // -----------------------------------------------------------------
  console.log("5. WriteTuples");
  try {
    await fgaClient.executeApiRequest({
      operationName: "Write",
      method: "POST",
      path: "/stores/{store_id}/write",
      pathParams: { store_id: storeId },
      body: {
        writes: {
          tuple_keys: [
            { user: "user:alice", relation: "writer", object: "document:roadmap" },
            { user: "user:bob", relation: "reader", object: "document:roadmap" },
          ],
        },
        authorization_model_id: modelId,
      },
    });
  } catch (err) {
    handleError("WriteTuples", err);
  }
  console.log("   Tuples written: user:alice→writer, user:bob→reader on document:roadmap\n");

  // -----------------------------------------------------------------
  // 6. ReadTuples (POST /stores/{store_id}/read)
  // -----------------------------------------------------------------
  console.log("6. ReadTuples (POST /stores/{store_id}/read)");
  let readResp;
  try {
    readResp = await fgaClient.executeApiRequest({
      operationName: "Read",
      method: "POST",
      path: "/stores/{store_id}/read",
      pathParams: { store_id: storeId },
      body: {
        tuple_key: {
          object: "document:roadmap",
        },
      },
    });
  } catch (err) {
    handleError("ReadTuples", err);
  }
  console.log(`   Found ${readResp.tuples?.length ?? 0} tuple(s):`);
  for (const t of readResp.tuples || []) {
    console.log(`     - ${t.key.user} is ${t.key.relation} of ${t.key.object}`);
  }
  console.log();

  // -----------------------------------------------------------------
  // 7. Check (POST /stores/{store_id}/check) — with custom header
  // -----------------------------------------------------------------
  console.log("7. Check (with custom header)");
  let checkResp;
  try {
    checkResp = await fgaClient.executeApiRequest({
      operationName: "Check",
      method: "POST",
      path: "/stores/{store_id}/check",
      pathParams: { store_id: storeId },
      headers: { "X-Request-ID": "example-check-123" },
      body: {
        tuple_key: {
          user: "user:alice",
          relation: "writer",
          object: "document:roadmap",
        },
        authorization_model_id: modelId,
      },
    });
  } catch (err) {
    handleError("Check (alice)", err);
  }
  console.log(`   user:alice writer document:roadmap → Allowed: ${checkResp.allowed}`);

  // Also check a user who should NOT have access
  let checkResp2;
  try {
    checkResp2 = await fgaClient.executeApiRequest({
      operationName: "Check",
      method: "POST",
      path: "/stores/{store_id}/check",
      pathParams: { store_id: storeId },
      body: {
        tuple_key: {
          user: "user:bob",
          relation: "writer",
          object: "document:roadmap",
        },
        authorization_model_id: modelId,
      },
    });
  } catch (err) {
    handleError("Check (bob)", err);
  }
  console.log(`   user:bob   writer document:roadmap → Allowed: ${checkResp2.allowed}\n`);

  // -----------------------------------------------------------------
  // 8. ListObjects (POST /stores/{store_id}/list-objects)
  // -----------------------------------------------------------------
  console.log("8. ListObjects");
  let listObjectsResp;
  try {
    listObjectsResp = await fgaClient.executeApiRequest({
      operationName: "ListObjects",
      method: "POST",
      path: "/stores/{store_id}/list-objects",
      pathParams: { store_id: storeId },
      body: {
        authorization_model_id: modelId,
        user: "user:alice",
        relation: "writer",
        type: "document",
      },
    });
  } catch (err) {
    handleError("ListObjects", err);
  }
  console.log(`   Objects user:alice can write: ${JSON.stringify(listObjectsResp.objects)}\n`);

  // -----------------------------------------------------------------
  // 9. StreamedListObjects (POST /stores/{store_id}/streamed-list-objects)
  //    Write more tuples first so we have something meaningful to stream.
  // -----------------------------------------------------------------
  console.log("9. StreamedListObjects (executeStreamedApiRequest)");
  console.log("   Writing 200 additional tuples for streaming demo...");
  for (let batch = 0; batch < 2; batch++) {
    const tupleKeys = [];
    for (let i = 1; i <= 100; i++) {
      tupleKeys.push({
        user: "user:alice",
        relation: "reader",
        object: `document:doc-${batch * 100 + i}`,
      });
    }
    try {
      await fgaClient.executeApiRequest({
        operationName: "Write",
        method: "POST",
        path: "/stores/{store_id}/write",
        pathParams: { store_id: storeId },
        body: {
          writes: { tuple_keys: tupleKeys },
          authorization_model_id: modelId,
        },
      });
    } catch (err) {
      handleError("Write (batch)", err);
    }
  }

  try {
    const streamResp = await fgaClient.executeStreamedApiRequest({
      operationName: "StreamedListObjects",
      method: "POST",
      path: "/stores/{store_id}/streamed-list-objects",
      pathParams: { store_id: storeId },
      body: {
        authorization_model_id: modelId,
        user: "user:alice",
        relation: "reader",
        type: "document",
      },
    });

    // Unwrap axios CallResult to get the raw Node.js stream
    const source = streamResp?.$response?.data ?? streamResp;

    let count = 0;
    for await (const item of parseNDJSONStream(source)) {
      if (item && item.result && item.result.object) {
        count++;
        if (count <= 3 || count % 50 === 0) {
          console.log(`     Object: ${item.result.object}`);
        }
      }
    }
    console.log(`   ✓ Streamed ${count} objects\n`);

    // Ensure underlying HTTP connection closes
    if (source && typeof source.destroy === "function") {
      try { source.destroy(); } catch { /* ignore */ }
    }
  } catch (err) {
    handleError("StreamedListObjects", err);
  }

  // -----------------------------------------------------------------
  // 10. DeleteStore (DELETE /stores/{store_id})
  // -----------------------------------------------------------------
  console.log("10. DeleteStore (cleanup)");
  try {
    await fgaClient.executeApiRequest({
      operationName: "DeleteStore",
      method: "DELETE",
      path: "/stores/{store_id}",
      pathParams: { store_id: storeId },
    });
  } catch (err) {
    handleError("DeleteStore", err);
  }
  console.log(`    Store ${storeId} deleted\n`);

  console.log("=== All examples completed successfully! ===");
}

main().catch((err) => {
  handleError("main", err);
});

