# Streamed List Objects Example

Demonstrates using `streamedListObjects` to retrieve objects via the streaming API.

## What is StreamedListObjects?

The Streamed ListObjects API is very similar to the ListObjects API, with two key differences:

1. **Streaming Results**: Instead of collecting all objects before returning a response, it streams them to the client as they are collected.
2. **No Pagination Limit**: The number of results returned is only limited by the execution timeout specified in the flag `OPENFGA_LIST_OBJECTS_DEADLINE`.

This makes it ideal for scenarios where you need to retrieve large numbers of objects without being constrained by pagination limits.

## Prerequisites
- OpenFGA server running on `http://localhost:8080` (or set `FGA_API_URL`)

## Running
```bash
# From repo root
npm run build
cd example/streamed-list-objects
npm install
npm start
```

## What it does
- Creates a temporary store
- Writes a simple authorization model
- Adds 2000 tuples
- Streams results via `streamedListObjects`
- Shows progress (first 3 objects and every 500th)
- Cleans up the store

## Key Features Demonstrated

### Async Generator Pattern

The `streamedListObjects` method returns an async generator, which is the idiomatic Node.js way to handle streaming data:

```javascript
for await (const response of fgaClient.streamedListObjects(request)) {
    console.log(`Received: ${response.object}`);
}
```

### Early Break and Cleanup

The streaming implementation properly handles early termination:

```javascript
for await (const response of fgaClient.streamedListObjects(request)) {
    console.log(response.object);
    if (someCondition) {
        break; // Stream is automatically cleaned up
    }
}
```

## Benefits Over ListObjects

- **No Pagination**: Retrieve all objects in a single streaming request
- **Lower Memory**: Objects are processed as they arrive, not held in memory
- **Early Termination**: Can stop streaming at any point without wasting resources
- **Better for Large Results**: Ideal when expecting hundreds or thousands of objects

## Performance Considerations

- Streaming starts immediately - no need to wait for all results
- HTTP connection remains open during streaming
- Properly handles cleanup if consumer stops early
- Supports all the same options as `listObjects` (consistency, contextual tuples, etc.)
