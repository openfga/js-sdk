# Streamed List Objects Example

Demonstrates using `streamedListObjects` to retrieve objects via the streaming API.

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
- Adds 3 tuples
- Streams results via `streamedListObjects`
- Cleans up the store