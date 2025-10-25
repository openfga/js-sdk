# Streamed List Objects Example

This example demonstrates working with [OpenFGA's `/streamed-list-objects` endpoint](https://openfga.dev/api/service#/Relationship%20Queries/StreamedListObjects) using the JavaScript SDK's `streamedListObjects()` method.

## Prerequisites

- Node.js 16.15.0+
- OpenFGA running on `localhost:8080`

You can start OpenFGA with Docker by running the following command:

```bash
docker pull openfga/openfga && docker run -it --rm -p 8080:8080 openfga/openfga run
```

## Running the example

No additional setup is required to run this example. Simply run the following command:

```bash
node streamedListObjects.mjs
```

## About this example

This example:
1. Creates a temporary store
2. Writes an authorization model (defined in `model.json`)
3. Writes 2000 relationship tuples to the store
4. Calls both `/streamed-list-objects` (streaming) and `/list-objects` (standard) endpoints
5. Compares the results

The streaming endpoint allows retrieving more than 1000 objects (the default limit for the standard endpoint), and streams results as they are found rather than waiting for all results to be collected.

