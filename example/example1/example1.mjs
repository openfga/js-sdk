import { Credentials, CredentialsMethod, FgaApiValidationError, OpenFgaClient, TypeName } from "@openfga/sdk";

let credentials;
if (process.env.FGA_CLIENT_ID) {
  credentials = new Credentials({
    method: CredentialsMethod.ClientCredentials,
    config: {
      clientId: process.env.FGA_CLIENT_ID,
      clientSecret: process.env.FGA_CLIENT_SECRET,
      apiAudience: process.env.FGA_API_AUDIENCE,
      apiTokenIssuer: process.env.FGA_API_TOKEN_ISSUER
    }
  });
}

const fgaClient = new OpenFgaClient({
  apiUrl: process.env.FGA_API_URL || "http://localhost:8080",
  storeId: process.env.FGA_STORE_ID, // not needed when calling `createStore` or `listStores`
  authorizationModelId: process.env.FGA_AUTHORIZATION_MODEL_ID, // optional, recommended for production,
  credentials
});

console.log("Listing stores");
try {
  const stores = await fgaClient.listStores();
  console.log(`Stores count: ${stores.stores.length}`);
} catch (error) {
  console.error(`error: ${error}`);
  process.exit(1);
}

console.log("Creating Test Store");
let store;
try {
  const createdStore = await fgaClient.createStore({name: "Test Store"});
  store = createdStore;
  console.log(`Test Store ID: ${store.id}`);
  fgaClient.storeId = store.id;
} catch (error) {
  console.error(`error: ${error}`);
  process.exit(1);
}

console.log("Listing Stores");
try {
  const stores = await fgaClient.listStores();
  console.log(`Stores count: ${stores.stores.length}`);
} catch (error) {
  console.error(`error: ${error}`);
  process.exit(1);
}

console.log("Getting Current Store");
try {
  const currentStore = await fgaClient.getStore();
  console.log(`Current Store Name ${currentStore.name}`);
} catch (error) {
  console.error(`error: ${error}`);
  process.exit(1);
}

console.log("Reading Authorization Models");
try {
  const models = await fgaClient.readAuthorizationModels();
  console.log(`Models Count: ${models.authorization_models.length}`);
} catch (error) {
  console.error(`error: ${error}`);
  process.exit(1);
}

console.log("Reading Latest Authorization Model");
try {
  const latestModel = await fgaClient.readLatestAuthorizationModel();
  if (latestModel.authorization_model) {
    console.log(`Latest Authorization Model ID: ${latestModel.authorization_model.id}`);
  } else {
    console.log("Latest Authorization Model not found");
  }
} catch (error) {
  console.error(`error: ${error}`);
  process.exit(1);
}

let authorizationModelId;
console.log("Writing an Authorization Model");
try {
  const model = await fgaClient.writeAuthorizationModel({
    schema_version: "1.1",
    type_definitions: [
      {
        type: "user"
      },
      {
        type: "document",
        relations: {
          writer: { this: {} },
          viewer: {
            union: {
              child: [
                { this: {} },
                {
                  computedUserset: {
                    relation: "writer"
                  }
                }
              ]
            }
          }
        },
        metadata: {
          relations: {
            writer: {
              directly_related_user_types: [
                { type: "user" },
                { type: "user", condition: "ViewCountLessThan200" }
              ]
            },
            viewer: {
              directly_related_user_types: [
                { type: "user" }
              ]
            }
          }
        }
      },
    ],
    conditions: {
      "ViewCountLessThan200": {
        name: "ViewCountLessThan200",
        expression: "ViewCount < 200",
        parameters: {
          ViewCount: {
            type_name: TypeName.Int
          },
          Type: {
            type_name: TypeName.String
          },
          Name: {
            type_name: TypeName.String
          }
        }
      }
    }
  });
  authorizationModelId = model.authorization_model_id;
  console.log(`Authorization Model ID: ${authorizationModelId}`);
} catch (error) {
  console.error(`error: ${error}`);
  process.exit(1);
}

console.log("Reading Authorization Models");
try {
  const models = await fgaClient.readAuthorizationModels();
  console.log(`Models Count: ${models.authorization_models.length}`);
} catch (error) {
  console.error(`error: ${error}`);
  process.exit(1);
}

console.log("Reading Latest Authorization Model");
try {
  const latestModel = await fgaClient.readLatestAuthorizationModel();
  console.log(`Latest Authorization Model ID: ${latestModel.authorization_model.id}`);
} catch (error) {
  console.error(`error: ${error}`);
  process.exit(1);
}

console.log("Writing Tuples");
try {
  await fgaClient.write({
    writes: [
      {
        user: "user:anne",
        relation: "writer",
        object: "document:roadmap",
        condition: {
          name: "ViewCountLessThan200",
          context: {
            Name: "Roadmap",
            Type: "document"
          }
        }
      }
    ]
  }, { authorizationModelId });
  console.log("Done Writing Tuples");
} catch (error) {
  console.error(`error: ${error}`);
  process.exit(1);
}

// Set the model ID
fgaClient.authorizationModelId = authorizationModelId;

console.log("Reading Tuples");
try {
  const { tuples } = await fgaClient.read();
  console.log(`Read Tuples: ${JSON.stringify(tuples)}`);
} catch (error) {
  console.error(`error: ${error}`);
  process.exit(1);
}

console.log("Reading Tuple Changes");
try {
  const { changes } = await fgaClient.readChanges();
  console.log(`Tuple Changes: ${JSON.stringify(changes)}`);
} catch (error) {
  console.error(`error: ${error}`);
  process.exit(1);
}

console.log("Checking for access");
try {
  const { allowed } = await fgaClient.check({
    user: "user:anne",
    relation: "viewer",
    object: "document:roadmap"
  });
  console.log(`Allowed: ${allowed}`);
} catch (error) {
  if (error instanceof FgaApiValidationError) {
    console.log(`Failed due to ${error.apiErrorMessage}`);
  } else {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
}

console.log("Checking for access with context");
try {
  const { allowed } = await fgaClient.check({
    user: "user:anne",
    relation: "viewer",
    object: "document:roadmap",
    context: {
      ViewCount: 100
    }
  });
  console.log(`Allowed: ${allowed}`);
} catch (error) {
  console.error(`error: ${error}`);
  process.exit(1);
}

console.log("Writing Assertions");
try {
  await fgaClient.writeAssertions([
    {
      user: "user:carl",
      relation: "writer",
      object: "document:budget",
      expectation: true
    },
    {
      user: "user:carl",
      relation: "writer",
      object: "document:roadmap",
      expectation: false
    }
  ]);
  console.log("Assertions Updated");
} catch (error) {
  console.error(`error: ${error}`);
  process.exit(1);
}

console.log("Reading Assertions");
try {
  const { assertions} = await fgaClient.readAssertions();
  console.log(`Assertions: ${JSON.stringify(assertions)}`);
} catch (error) {
  console.error(`error: ${error}`);
  process.exit(1);
}

console.log("Deleting Current Store");
try {
  await fgaClient.deleteStore();
  console.log(`Deleted Store Count: ${store.id}`);
} catch (error) {
  console.error(`error: ${error}`);
  process.exit(1);
}
