import { ClientConfiguration, OpenFgaClient, ConsistencyPreference } from "../../dist/index.js";
import { transformer } from "@openfga/syntax-transformer";

const apiUrl = process.env.FGA_API_URL || "http://localhost:8080";

async function main() {
    const client = new OpenFgaClient(new ClientConfiguration({ apiUrl }));

    console.log("Creating temporary store");
    const { id: storeId } = await client.createStore({ name: "streamed-list-objects" });

    const clientWithStore = new OpenFgaClient(new ClientConfiguration({ apiUrl, storeId }));

    const dslString = `
        model
        schema 1.1

        type user

        type document
        relations
            define owner: [user]
            define viewer: [user]
            define can_read: owner or viewer
        `;

    const model = transformer.transformDSLToJSONObject(dslString);

    console.log("Writing authorization model");
    const { authorization_model_id: authorizationModelId } = await clientWithStore.writeAuthorizationModel(model);

    const fga = new OpenFgaClient(new ClientConfiguration({ apiUrl, storeId, authorizationModelId }));

    console.log("Writing tuples (1000 as owner, 1000 as viewer)");
    const writes = [];

    // Write 1000 documents where anne is the owner
    for (let i = 1; i <= 1000; i++) {
        writes.push({ user: "user:anne", relation: "owner", object: `document:${i}` });
    }

    // Write 1000 documents where anne is a viewer
    for (let i = 1001; i <= 2000; i++) {
        writes.push({ user: "user:anne", relation: "viewer", object: `document:${i}` });
    }

    await fga.write({ writes });
    console.log(`Wrote ${writes.length} tuples`);

    console.log("Streaming objects via computed 'can_read' relation...");
    let count = 0;
    for await (const response of fga.streamedListObjects(
        { user: "user:anne", relation: "can_read", type: "document" },  // can_read is computed: owner OR viewer
        { consistency: ConsistencyPreference.HigherConsistency }
    )) {
        count++;
        if (count <= 3 || count % 500 === 0) {
            console.log(`- ${response.object}`);
        }
    }
    console.log(`\u2713 Streamed ${count} objects`);

    console.log("Cleaning up...");
    await fga.deleteStore();
    console.log("Done");
}

main().catch(err => {
    console.error("Error:", err.message || err);
    if (err.message && err.message.includes("ECONNREFUSED")) {
        console.error("Is OpenFGA server running on", apiUrl, "?");
    }
    process.exit(1);
});