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
            define can_read: [user]
        `;

    const model = transformer.transformDSLToJSONObject(dslString);

    console.log("Writing authorization model");
    const { authorization_model_id: authorizationModelId } = await clientWithStore.writeAuthorizationModel(model);

    const fga = new OpenFgaClient(new ClientConfiguration({ apiUrl, storeId, authorizationModelId }));

    console.log("Writing tuples");
    await fga.write({
        writes: [
            { user: "user:anne", relation: "can_read", object: "document:1" },
            { user: "user:anne", relation: "can_read", object: "document:2" },
            { user: "user:anne", relation: "can_read", object: "document:3" }
        ]
    });

    console.log("Streaming objects...");
    let count = 0;
    for await (const response of fga.streamedListObjects(
        { user: "user:anne", relation: "can_read", type: "document" },
        { consistency: ConsistencyPreference.HigherConsistency }
    )) {
        console.log(`- ${response.object}`)
        count++;
    }
    console.log(`\u2713 Streamed count: ${count}`);

    console.log("Cleaning up...");
    await fga.deleteStore();
    console.log("Done");
}

main().catch(_err => {
    process.exit(1);
});