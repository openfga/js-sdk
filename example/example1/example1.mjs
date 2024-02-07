import { Credentials, CredentialsMethod, FgaApiValidationError, OpenFgaClient, TypeName } from "@openfga/sdk";

async function main () {
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
  const initialStores = await fgaClient.listStores();
  console.log(`Stores count: ${initialStores.stores.length}`);

  console.log("Creating Test Store");
  const createdStore = await fgaClient.createStore({name: "Test Store"});
  const store = createdStore;
  console.log(`Test Store ID: ${store.id}`);

  // Set the store ID
  fgaClient.storeId = store.id;

  console.log("Listing Stores");
  const { stores } = await fgaClient.listStores();
  console.log(`Stores count: ${stores.length}`);
  
  console.log("Getting Current Store");
  const currentStore = await fgaClient.getStore();
  console.log(`Current Store Name ${currentStore.name}`);
  
  console.log("Reading Authorization Models");
  const { authorization_models } = await fgaClient.readAuthorizationModels();
  console.log(`Models Count: ${authorization_models.length}`);

  console.log("Reading Latest Authorization Model");
  const { authorization_model } = await fgaClient.readLatestAuthorizationModel();
  if (authorization_model) {
    console.log(`Latest Authorization Model ID: ${latestModel.authorization_model.id}`);
  } else {
    console.log("Latest Authorization Model not found");
  }

  console.log("Writing an Authorization Model");
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
  const authorizationModelId = model.authorization_model_id;
  console.log(`Authorization Model ID: ${authorizationModelId}`);

  console.log("Reading Authorization Models");
  const models = await fgaClient.readAuthorizationModels();
  console.log(`Models Count: ${models.authorization_models.length}`);

  console.log("Reading Latest Authorization Model");
  const latestModel = await fgaClient.readLatestAuthorizationModel();
  console.log(`Latest Authorization Model ID: ${latestModel.authorization_model.id}`);

  console.log("Writing Tuples");
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

  // Set the model ID
  fgaClient.authorizationModelId = authorizationModelId;

  console.log("Reading Tuples");
  const { tuples } = await fgaClient.read();
  console.log(`Read Tuples: ${JSON.stringify(tuples)}`);

  console.log("Reading Tuple Changes");
  const { changes } = await fgaClient.readChanges();
  console.log(`Tuple Changes: ${JSON.stringify(changes)}`);

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
      throw error;
    }
  }

  console.log("Checking for access with context");
  const { allowed } = await fgaClient.check({
    user: "user:anne",
    relation: "viewer",
    object: "document:roadmap",
    context: {
      ViewCount: 100
    }
  });
  console.log(`Allowed: ${allowed}`);
 
  console.log("Writing Assertions");
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
  
  console.log("Reading Assertions");
  const { assertions} = await fgaClient.readAssertions();
  console.log(`Assertions: ${JSON.stringify(assertions)}`);
  
  console.log("Deleting Current Store");
  await fgaClient.deleteStore();
  console.log(`Deleted Store Count: ${store.id}`);  
}

main()
  .catch(error => {
    console.error(`error: ${error}`);
    process.exitCode = 1;
  });