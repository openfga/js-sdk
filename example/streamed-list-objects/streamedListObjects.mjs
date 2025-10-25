import { OpenFgaClient } from "../../dist/index.js";
import { readFileSync } from "fs";

async function createStore(fgaClient) {
    console.log("Creating temporary store");
    const store = await fgaClient.createStore({ name: "Streamed List Objects Demo Store" });
    console.log(`Created store: ${store.id}\n`);
    return store.id;
}

async function writeModel(fgaClient) {
    console.log("Writing authorization model");
    const model = JSON.parse(readFileSync("./model.json", "utf8"));
    const response = await fgaClient.writeAuthorizationModel(model);
    console.log(`Created authorization model: ${response.authorization_model_id}\n`);
    return response.authorization_model_id;
}

async function writeTuples(fgaClient, quantity) {
    console.log(`Writing ${quantity} tuples to the store`);
    const chunks = Math.floor(quantity / 100);

    for (let chunk = 0; chunk < chunks; ++chunk) {
        const tuples = [];
        for (let t = 0; t < 100; ++t) {
            tuples.push({
                user: "user:anne",
                relation: "owner",
                object: `document:${chunk * 100 + t}`
            });
        }
        await fgaClient.writeTuples(tuples);
    }
    console.log(`Done writing ${quantity} tuples\n`);
    return quantity;
}

async function streamedListObjects(fgaClient, request) {
    console.log("Calling /streamed-list-objects endpoint...");
    const results = [];

    // Note: streamedListObjects() is an async generator
    // We can process results as they arrive, or collect them all like this
    for await (const response of fgaClient.streamedListObjects(request)) {
        results.push(response.object);
    }

    return results;
}

async function listObjects(fgaClient, request) {
    console.log("Calling /list-objects endpoint for comparison...");
    const response = await fgaClient.listObjects(request);
    return response.objects;
}

async function main() {
    const fgaClient = new OpenFgaClient({
        apiUrl: process.env.FGA_API_URL || "http://localhost:8080"
    });

    try {
        // Create temporary store
        const storeId = await createStore(fgaClient);
        fgaClient.storeId = storeId;

        // Write authorization model
        const modelId = await writeModel(fgaClient);
        fgaClient.authorizationModelId = modelId;

        // Write test data
        await writeTuples(fgaClient, 2000);

        // Prepare request to list all documents owned by user:anne
        const request = {
            type: "document",
            relation: "owner",
            user: "user:anne"
        };

        // Test streaming endpoint
        const streamedResults = await streamedListObjects(fgaClient, request);
        console.log(`✓ Streamed endpoint returned ${streamedResults.length} objects\n`);

        // Test standard endpoint for comparison
        const standardResults = await listObjects(fgaClient, request);
        console.log(`✓ Standard endpoint returned ${standardResults.length} objects\n`);

        console.log("Comparison:");
        console.log(`  Streaming: ${streamedResults.length} objects`);
        console.log(`  Standard:  ${standardResults.length} objects (max 1000)`);
        console.log(`\nStreaming endpoint retrieved all ${streamedResults.length} objects successfully!`);

        // Cleanup
        console.log("\nCleaning up...");
        await fgaClient.deleteStore();
        console.log("Deleted temporary store");

    } catch (error) {
        console.error("Error:", error);
        process.exitCode = 1;
    }
}

main();

