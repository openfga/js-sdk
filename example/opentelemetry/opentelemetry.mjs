import "dotenv/config";
import { CredentialsMethod, FgaApiValidationError, OpenFgaClient } from "@openfga/sdk";

let credentials;
if (process.env.FGA_CLIENT_ID) {
  credentials = {
    method: CredentialsMethod.ClientCredentials,
    config: {
      clientId: process.env.FGA_CLIENT_ID,
      clientSecret: process.env.FGA_CLIENT_SECRET,
      apiAudience: process.env.FGA_API_AUDIENCE,
      apiTokenIssuer: process.env.FGA_API_TOKEN_ISSUER
    }
  };
}

const fgaClient = new OpenFgaClient({
  apiUrl: process.env.FGA_API_URL,
  storeId: process.env.FGA_STORE_ID,
  authorizationModelId: process.env.FGA_MODEL_ID,
  credentials
});

async function main () {

  setTimeout(async () => {
    try {
      await main();
    } catch (error) {
      console.log(error);
    }
  }, 20000);

  console.log("Reading Authorization Models");
  const { authorization_models } = await fgaClient.readAuthorizationModels();
  console.log(`Models Count: ${authorization_models.length}`);

  console.log("Reading Tuples");
  const { tuples } = await fgaClient.read();
  console.log(`Tuples count: ${tuples.length}`);


  const checkRequests = Math.floor(Math.random() * 10);
  console.log(`Making ${checkRequests} checks`);
  for (let index = 0; index < checkRequests; index++) {
    console.log("Checking for access" + index);
    try {
      const { allowed } = await fgaClient.check({
        user: "user:anne",
        relation: "owner",
        object: "folder:foo"
      });
      console.log(`Allowed: ${allowed}`);
    } catch (error) {
      if (error instanceof FgaApiValidationError) {
        console.log(`Failed due to ${error.apiErrorMessage}`);
      } else {
        throw error;
      }
    }
  }

  console.log("writing tuple");
  await fgaClient.write({
    writes: [
      {
        user: "user:anne",
        relation: "owner",
        object: "folder:date-"+Date.now(),
      }
    ]
  });
}


main()
  .catch(error => {
    console.error(`error: ${error}`);
    process.exitCode = 1;
  });
