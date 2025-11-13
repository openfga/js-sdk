# Streamed List Objects Example

Demonstrates using `streamedListObjects` to retrieve objects via the streaming API.

## What is StreamedListObjects?

The Streamed ListObjects API is very similar to the ListObjects API, with two key differences:

1. **Streaming Results**: Instead of collecting all objects before returning a response, it streams them to the client as they are collected.
2. **No Pagination Limit**: Returns all results without the 1000-object limit of the standard ListObjects API.

This makes it ideal for scenarios where you need to retrieve large numbers of objects, especially when querying computed relations.

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
- Writes an authorization model with **computed relations**
- Adds 2000 tuples (1000 owners + 1000 viewers)
- Queries the **computed `can_read` relation** via `streamedListObjects`
- Shows all 2000 results (demonstrating computed relations)
- Shows progress (first 3 objects and every 500th)
- Cleans up the store

## Authorization Model

The example demonstrates OpenFGA's **computed relations**:

```
type user

type document
  relations
    define owner: [user]
    define viewer: [user]
    define can_read: owner or viewer  ← COMPUTED RELATION
```

**Why this matters:**
- We write tuples to `owner` and `viewer` (base permissions)
- We query `can_read` (computed from owner OR viewer)
- This shows OpenFGA's power: derived permissions from base relations
- Without OpenFGA, you'd need to duplicate data or run multiple queries

**Example flow:**
1. Write: `user:anne owner document:1-1000`
2. Write: `user:anne viewer document:1001-2000`
3. Query: `streamedListObjects(user:anne, relation:can_read, type:document)`
4. Result: All 2000 documents (because `can_read = owner OR viewer`)

This demonstrates why `streamedListObjects` is valuable - computed relations can return large result sets!

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
