# JavaScript and Node.js SDK for OpenFGA

[![npm](https://img.shields.io/npm/v/@openfga/sdk.svg?style=flat)](https://www.npmjs.com/package/@openfga/sdk)
[![Release](https://img.shields.io/github/v/release/openfga/js-sdk?sort=semver&color=green)](https://github.com/openfga/js-sdk/releases)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fopenfga%2Fjs-sdk.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fopenfga%2Fjs-sdk?ref=badge_shield)
[![Join our community](https://img.shields.io/badge/slack-cncf_%23openfga-40abb8.svg?logo=slack)](https://openfga.dev/community)
[![Twitter](https://img.shields.io/twitter/follow/openfga?color=%23179CF0&logo=twitter&style=flat-square "@openfga on Twitter")](https://twitter.com/openfga)

This is an autogenerated JavaScript SDK for OpenFGA. It provides a wrapper around the [OpenFGA API definition](https://openfga.dev/api), and includes TS typings.

## Table of Contents

- [About OpenFGA](#about)
- [Resources](#resources)
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Initializing the API Client](#initializing-the-api-client)
  - [Get your Store ID](#get-your-store-id)
  - [Calling the API](#calling-the-api)
    - [Stores](#stores)
      - [List All Stores](#list-stores)
      - [Create a Store](#create-store)
      - [Get a Store](#get-store)
      - [Delete a Store](#delete-store)
    - [Authorization Models](#authorization-models)
      - [Read Authorization Models](#read-authorization-models)
      - [Write Authorization Model](#write-authorization-model)
      - [Read a Single Authorization Model](#read-a-single-authorization-model)
      - [Read the Latest Authorization Model](#read-the-latest-authorization-model)
    - [Relationship Tuples](#relationship-tuples)
      - [Read Relationship Tuple Changes (Watch)](#read-relationship-tuple-changes-watch)
      - [Read Relationship Tuples](#read-relationship-tuples)
      - [Write (Create and Delete) Relationship Tuples](#write-create-and-delete-relationship-tuples)
    - [Relationship Queries](#relationship-queries)
      - [Check](#check)
      - [Batch Check](#batch-check)
      - [Expand](#expand)
      - [List Objects](#list-objects)
      - [List Relations](#list-relations)
      - [List Users](#list-users)
    - [Assertions](#assertions)
      - [Read Assertions](#read-assertions)
      - [Write Assertions](#write-assertions)
  - [Retries](#retries)
  - [API Endpoints](#api-endpoints)
  - [Models](#models)
  - [OpenTelemetry](#opentelemetry)
- [Contributing](#contributing)
  - [Issues](#issues)
  - [Pull Requests](#pull-requests)
- [License](#license)

## About

[OpenFGA](https://openfga.dev) is an open source Fine-Grained Authorization solution inspired by [Google's Zanzibar paper](https://research.google/pubs/pub48190/). It was created by the FGA team at [Auth0](https://auth0.com) based on [Auth0 Fine-Grained Authorization (FGA)](https://fga.dev), available under [a permissive license (Apache-2)](https://github.com/openfga/rfcs/blob/main/LICENSE) and welcomes community contributions.

OpenFGA is designed to make it easy for application builders to model their permission layer, and to add and integrate fine-grained authorization into their applications. OpenFGA’s design is optimized for reliability and low latency at a high scale.


## Resources

- [OpenFGA Documentation](https://openfga.dev/docs)
- [OpenFGA API Documentation](https://openfga.dev/api/service)
- [Twitter](https://twitter.com/openfga)
- [OpenFGA Community](https://openfga.dev/community)
- [Zanzibar Academy](https://zanzibar.academy)
- [Google's Zanzibar Paper (2019)](https://research.google/pubs/pub48190/)

## Installation

Using [npm](https://npmjs.org):

```shell
npm install @openfga/sdk
```

Using [yarn](https://yarnpkg.com):

```shell
yarn add @openfga/sdk
```

## Getting Started

### Initializing the API Client

[Learn how to initialize your SDK](https://openfga.dev/docs/getting-started/setup-sdk-client)

We strongly recommend you initialize the `OpenFgaClient` only once and then re-use it throughout your app, otherwise you will incur the cost of having to re-initialize multiple times or at every request, the cost of reduced connection pooling and re-use, and would be particularly costly in the client credentials flow, as that flow will be performed on every request.

> The `OpenFgaClient` will by default retry API requests up to 3 times on 429 and 5xx errors.

#### No Credentials

```javascript
const { OpenFgaClient } = require('@openfga/sdk'); // OR import { OpenFgaClient } from '@openfga/sdk';

const fgaClient = new OpenFgaClient({
  apiUrl: process.env.FGA_API_URL, // required
  storeId: process.env.FGA_STORE_ID, // not needed when calling `CreateStore` or `ListStores`
  authorizationModelId: process.env.FGA_MODEL_ID, // Optional, can be overridden per request
});
```

#### API Token

```javascript
const { OpenFgaClient, CredentialsMethod } = require('@openfga/sdk'); // OR import { OpenFgaClient, CredentialsMethod } from '@openfga/sdk';

const fgaClient = new OpenFgaClient({
  apiUrl: process.env.FGA_API_URL, // required
  storeId: process.env.FGA_STORE_ID, // not needed when calling `CreateStore` or `ListStores`
  authorizationModelId: process.env.FGA_MODEL_ID, // Optional, can be overridden per request
  credentials: {
    method: CredentialsMethod.ApiToken,
    config: {
      token: process.env.FGA_API_TOKEN, // will be passed as the "Authorization: Bearer ${ApiToken}" request header
    }
  }
});
```

#### Client Credentials

```javascript
const { OpenFgaClient, CredentialsMethod } = require('@openfga/sdk'); // OR import { OpenFgaClient, CredentialsMethod } from '@openfga/sdk';

const fgaClient = new OpenFgaClient({
  apiUrl: process.env.FGA_API_URL, // required
  storeId: process.env.FGA_STORE_ID, // not needed when calling `CreateStore` or `ListStores`
  authorizationModelId: process.env.FGA_MODEL_ID, // Optional, can be overridden per request
  credentials: {
    method: CredentialsMethod.ClientCredentials,
    config: {
      apiTokenIssuer: process.env.FGA_API_TOKEN_ISSUER,
      apiAudience: process.env.FGA_API_AUDIENCE,
      clientId: process.env.FGA_CLIENT_ID,
      clientSecret: process.env.FGA_CLIENT_SECRET,
    }
  }
});
```


### Get your Store ID

You need your store id to call the OpenFGA API (unless it is to call the [CreateStore](#create-store) or [ListStores](#list-stores) methods).

If your server is configured with [authentication enabled](https://openfga.dev/docs/getting-started/setup-openfga#configuring-authentication), you also need to have your credentials ready.

### Calling the API

> Note regarding casing in the OpenFgaClient:
> All input parameters are in `camelCase`, all response parameters will match the API and are in `snake_case`.

> Note: The Client interface might see several changes over the next few months as we get more feedback before it stabilizes.

#### Stores

##### List Stores

Get a paginated list of stores.

[API Documentation](https://openfga.dev/api/service#/Stores/ListStores)

```javascript
const options = { pageSize: 10, continuationToken: "..." };

const { stores } = await fgaClient.listStores(options);

// stores = [{ "id": "01FQH7V8BEG3GPQW93KTRFR8JB", "name": "FGA Demo Store", "created_at": "2022-01-01T00:00:00.000Z", "updated_at": "2022-01-01T00:00:00.000Z" }]
```

##### Create Store

Initialize a store.

[API Documentation](https://openfga.dev/api/service#/Stores/CreateStore)

```javascript
const { id: storeId } = await fgaClient.createStore({
  name: "FGA Demo Store",
});

// storeId = "01FQH7V8BEG3GPQW93KTRFR8JB"
```

##### Get Store

Get information about the current store.

[API Documentation](https://openfga.dev/api/service#/Stores/GetStore)

```javascript
const store = await fgaClient.getStore();

// store = { "id": "01FQH7V8BEG3GPQW93KTRFR8JB", "name": "FGA Demo Store", "created_at": "2022-01-01T00:00:00.000Z", "updated_at": "2022-01-01T00:00:00.000Z" }
```

##### Delete Store

Delete a store.

[API Documentation](https://openfga.dev/api/service#/Stores/DeleteStore)

```javascript
await fgaClient.deleteStore();
```

#### Authorization Models

##### Read Authorization Models

Read all authorization models in the store.

[API Documentation](https://openfga.dev/api/service#/Authorization%20Models/ReadAuthorizationModels)

>  Requires a client initialized with a storeId

```javascript
const options = { pageSize: 10, continuationToken: "..." };

const { authorization_models: authorizationModels } = await fgaClient.readAuthorizationModels(options);

/*
authorizationModels = [
 { id: "01GXSA8YR785C4FYS3C0RTG7B1", schema_version: "1.1", type_definitions: [...] },
 { id: "01GXSBM5PVYHCJNRNKXMB4QZTW", schema_version: "1.1", type_definitions: [...] }];
*/
```

##### Write Authorization Model

Create a new authorization model.

[API Documentation](https://openfga.dev/api/service#/Authorization%20Models/WriteAuthorizationModel)

> Note: To learn how to build your authorization model, check the Docs at https://openfga.dev/docs.

> Learn more about [the OpenFGA configuration language](https://openfga.dev/docs/configuration-language).

> You can use the [OpenFGA Syntax Transformer](https://github.com/openfga/syntax-transformer) to convert between the friendly DSL and the JSON authorization model.

```javascript
const { authorization_model_id: id } = await fgaClient.writeAuthorizationModel({
  schema_version: "1.1",
  type_definitions: [{
      type: "user",
    }, {
    type: "document",
    relations: {
      "writer": { "this": {} },
      "viewer": {
        "union": {
          "child": [
            { "this": {} },
            { "computedUserset": {
               "object": "",
              "relation": "writer" }
            }
          ]
        }
      }
    } }],
});

// id = "01GXSA8YR785C4FYS3C0RTG7B1"
```

##### Read a Single Authorization Model

Read a particular authorization model.

```javascript
const options = {};

// To override the authorization model id for this request
options.authorizationModelId = "01GXSA8YR785C4FYS3C0RTG7B1";

const { authorization_model: authorizationModel } = await fgaClient.readAuthorizationModel(options);

// authorizationModel = { id: "01GXSA8YR785C4FYS3C0RTG7B1", schema_version: "1.1", type_definitions: [...] }
```

##### Read the Latest Authorization Model

Reads the latest authorization model (note: this ignores the model id in configuration).

[API Documentation](https://openfga.dev/api/service#/Authorization%20Models/ReadAuthorizationModel)

```javascript
const { authorization_model: authorizationModel } = await fgaClient.readLatestAuthorizationModel();

// authorizationModel = { id: "01GXSA8YR785C4FYS3C0RTG7B1", schema_version: "1.1", type_definitions: [...] }
```

#### Relationship Tuples

##### Read Relationship Tuple Changes (Watch)

Reads the list of historical relationship tuple writes and deletes.

[API Documentation](https://openfga.dev/api/service#/Relationship%20Tuples/ReadChanges)

```javascript
const type = 'document';
const startTime = "2022-01-01T00:00:00Z"
const options = {
  pageSize: 25,
  continuationToken: 'eyJwayI6IkxBVEVTVF9OU0NPTkZJR19hdXRoMHN0b3JlIiwic2siOiIxem1qbXF3MWZLZExTcUoyN01MdTdqTjh0cWgifQ==',
};

const response = await fgaClient.readChanges({ type, startTime }, options);

// response.continuation_token = ...
// response.changes = [
//   { tuple_key: { user, relation, object }, operation: "writer", timestamp: ... },
//   { tuple_key: { user, relation, object }, operation: "viewer", timestamp: ... }
// ]
```

##### Read Relationship Tuples

Reads the relationship tuples stored in the database. It does not evaluate nor exclude invalid tuples according to the authorization model.

[API Documentation](https://openfga.dev/api/service#/Relationship%20Tuples/Read)

```javascript
// Find if a relationship tuple stating that a certain user is a viewer of a certain document
const body = {
  user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
  relation: "viewer",
  object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
};

// Find all relationship tuples where a certain user has any relation to a certain document
const body = {
  user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
  object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
};

// Find all relationship tuples where a certain user is a viewer of any document
const body = {
  user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
  relation: "viewer",
  object: "document:",
};

// Find all relationship tuples where a certain user has any relation with any document
const body = {
  user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
  object: "document:",
};

// Find all relationship tuples where any user has any relation with a particular document
const body = {
  object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
};

// Read all stored relationship tuples
const body = {};

const { tuples } = await fgaClient.read(body);

// In all the above situations, the response will be of the form:
// tuples = [{ key: { user, relation, object }, timestamp: ... }]
```

##### Write (Create and Delete) Relationship Tuples

Create and/or delete relationship tuples to update the system state.

[API Documentation](https://openfga.dev/api/service#/Relationship%20Tuples/Write)

###### Transaction mode (default)

By default, write runs in a transaction mode where any invalid operation (deleting a non-existing tuple, creating an existing tuple, one of the tuples was invalid) or a server error will fail the entire operation.

```javascript
const options = {};

// To override the authorization model id for this request
options.authorizationModelId = "01GXSA8YR785C4FYS3C0RTG7B1";

await fgaClient.write({
  writes: [{ user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b", relation: "viewer", object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a" }],
  deletes: [{ user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b", relation: "editor", object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a" }],
}, options);

// Convenience functions are available
await fgaClient.writeTuples([{ user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b", relation: "viewer", object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a" }], options);
await fgaClient.deleteTuples([{ user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b", relation: "editor", object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a" }], options);

// if any error is encountered in the transaction mode, an error will be thrown
```

###### Non-transaction mode

The SDK will split the writes into separate requests and send them in parallel chunks (default = 1 item per chunk, each chunk is a transaction).

```
// if you'd like to disable the transaction mode for writes (requests will be sent in parallel writes)
options.transaction = {
  disable: true,
  maxPerChunk: 1, // defaults to 1 - each chunk is a transaction (even in non-transaction mode)
  maxParallelRequests: 10, // max requests to issue in parallel
};

const response = await fgaClient.write({
  writes: [{ user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b", relation: "viewer", object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a" }],
  deletes: [{ user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b", relation: "editor", object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a" }],
}, options);

/*
response = {
  writes: [{ tuple_key: { user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b", relation: "viewer", object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a", status: "success" } }],
  deletes: [{ tuple_key: { user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b", relation: "editor", object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a", status: "failure", err: <FgaError ...>  } }],
};
*/
```

#### Relationship Queries

##### Check

Check if a user has a particular relation with an object.

[API Documentation](https://openfga.dev/api/service#/Relationship%20Queries/Check)

```javascript
const options = {
  // if you'd like to override the authorization model id for this request
  authorizationModelId: "01GXSA8YR785C4FYS3C0RTG7B1",
};

const result = await fgaClient.check({
  user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
  relation: "viewer",
  object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
}, options);

// result = { allowed: true }
```

##### Batch Check

Similar to [check](#check), but instead of checking a single user-object relationship, accepts a list of relationships to check. Requires OpenFGA version 1.8.0 or greater.

[API Documentation](https://openfga.dev/api/service#/Relationship%20Queries/BatchCheck)

```javascript
const options = {
  // if you'd like to override the authorization model id for this request
  authorizationModelId: "01GXSA8YR785C4FYS3C0RTG7B1",
}

const corrId = randomUUID();
const { result } = await fgaClient.batchCheck({
    checks: [
      {
        // should have access
        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
        relation: "viewer",
        object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
        context: {
          ViewCount: 100
        },
        // optional correliationId to associate request and response. One will be generated
        // if not provided
        correlationId: corrId,
      },
      {
        // should NOT have access
        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
        relation: "viewer",
        object: "document:7772ab2a-d83f-756d-9397-c5ed9f3cb888",
      }
    ]
  }, options);

  const userAllowed = result.filter(r => r.correlationId === corrId);
  console.log(`User is allowed access to ${userAllowed.length} documents`);
  userAllowed.forEach(item => {
    console.log(`User is allowed access to ${item.request.object}`);
  });
  /*
  {
    "result": [
      {
        "allowed": true,
        "request": {
          "user": "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
          "relation": "viewer",
          "object": "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
          "correlationId": "4187674b-0ec0-4ed5-abb5-327bd21c89a3"
        },
        "correlationId": "4187674b-0ec0-4ed5-abb5-327bd21c89a3"
      },
      {
        "allowed": true,
        "request": {
          "user": "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
          "relation": "viewer",
          "object": "document:7772ab2a-d83f-756d-9397-c5ed9f3cb888",
          "context": {
            "ViewCount": 100
          },
          "correlationId": "5874b4fb-10f1-4e0c-ae32-559220b06dc8"
        },
        "correlationId": "5874b4fb-10f1-4e0c-ae32-559220b06dc8"
      }
    ]
  }
  */
```

If you are using an OpenFGA version less than 1.8.0, you can use the `clientBatchCheck` function, 
which calls `check` in parallel. 

```javascript
const { responses } = await fgaClient.clientBatchCheck([{
  user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
  relation: "viewer",
  object: "document:0192ab2d-d36e-7cb3-a4a8-5d1d67a300c5",
}, {
  user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
  relation: "member",
  object: "document:0192ab2d-d36e-7cb3-a4a8-5d1d67a300c5",
}, {
  user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
  relation: "viewer",
  object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
  contextualTuples: [{
    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
    relation: "writer",
    object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a"
  }],
}], options);

/*
result = [{
  allowed: false,
  _request: {
    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
    relation: "viewer",
    object: "document:0192ab2d-d36e-7cb3-a4a8-5d1d67a300c5",
  }
}, {
  allowed: false,
  _request: {
    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
    relation: "member",
    object: "document:0192ab2d-d36e-7cb3-a4a8-5d1d67a300c5",
  },
  err: <FgaError ...>
}, {
  allowed: true,
  _request: {
    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
    relation: "viewer",
    object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
    contextualTuples: [{
      user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
      relation: "writer",
      object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a"
    }],
  }},
]
*/
```

#### Expand

Expands the relationships in userset tree format.

[API Documentation](https://openfga.dev/api/service#/Relationship%20Queries/Expand)

```javascript
const options = {};

// To override the authorization model id for this request
options.authorizationModelId = "01GXSA8YR785C4FYS3C0RTG7B1";

const { tree } = await fgaClient.expand({
  relation: "viewer",
  object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
}, options);

// tree  = { root: { name: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a#viewer", leaf: { users: { users: ["user:81684243-9356-4421-8fbf-a4f8d36aa31b", "user:f52a4f7a-054d-47ff-bb6e-3ac81269988f"] } } } }
```

##### List Objects

 List the objects of a particular type that the user has a certain relation to.

[API Documentation](https://openfga.dev/api/service#/Relationship%20Queries/ListObjects)

```javascript
const options = {};

// To override the authorization model id for this request
options.authorizationModelId = "01GXSA8YR785C4FYS3C0RTG7B1";

const response = await fgaClient.listObjects({
  user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
  relation: "viewer",
  type: "document",
  contextualTuples: [{
    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
    relation: "writer",
    object: "document:0192ab2d-d36e-7cb3-a4a8-5d1d67a300c5"
  }],
}, options);

// response.objects = ["document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a"]
```

##### List Relations

List the relations a user has with an object. This wraps around [BatchCheck](#batchcheck) to allow checking multiple relationships at once.

Note: Any error encountered when checking any relation will be treated as `allowed: false`;

```javascript
const options = {};

// To override the authorization model id for this request
options.authorization_model_id = "1uHxCSuTP0VKPYSnkq1pbb1jeZw";

const response = await fgaClient.listRelations({
  user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
  object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
  relations: ["can_view", "can_edit", "can_delete"],
  contextualTuples: [{
    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
    relation: "writer",
    object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a"
  }],
}, options);

// response.relations = ["can_view", "can_edit"]
```

##### List Users

List the users who have a certain relation to a particular type.

[API Documentation](https://openfga.dev/api/service#/Relationship%20Queries/ListUsers)

```js
const options = {};

// To override the authorization model id for this request
options.authorization_model_id = "1uHxCSuTP0VKPYSnkq1pbb1jeZw";

// Only a single filter is allowed for the time being
const userFilters = [{type: "user"}];
// user filters can also be of the form
// const userFilters = [{type: "team", relation: "member"}];

const response = await fgaClient.listUsers({
  object: {
    type: "document",
    id: "roadmap"
  },
  relation: "can_read",
  user_filters: userFilters,
  context: {
    "view_count": 100
  },
  contextualTuples:
    [{
      user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
      relation: "editor",
      object: "folder:product"
    }, {
      user: "folder:product",
      relation: "parent",
      object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a"
    }]
}, options);

// response.users = [{object: {type: "user", id: "81684243-9356-4421-8fbf-a4f8d36aa31b"}}, {userset: { type: "user" }}, ...]
```

#### Assertions

##### Read Assertions

Read assertions for a particular authorization model.

[API Documentation](https://openfga.dev/api/service#/Assertions/Read%20Assertions)

```javascript
const options = {};

// To override the authorization model id for this request
options.authorizationModelId = "01GXSA8YR785C4FYS3C0RTG7B1";

const response = await fgaClient.readAssertions(options);

/*
response.assertions = [{
  user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
  relation: "viewer",
  object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
  expectation: true,
}];
*/
```

##### Write Assertions

Update the assertions for a particular authorization model.

[API Documentation](https://openfga.dev/api/service#/Assertions/Write%20Assertions)

```javascript
const options = {};

// To override the authorization model id for this request
options.authorizationModelId = "01GXSA8YR785C4FYS3C0RTG7B1";

const response = await fgaClient.writeAssertions([{
  user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
  relation: "viewer",
  object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
  expectation: true,
}], options);
```


### Retries

If a network request fails with a 429 or 5xx error from the server, the SDK will automatically retry the request up to 3 times with a minimum wait time of 100 milliseconds between each attempt.

To customize this behavior, create an object with `maxRetry` and `minWaitInMs` properties. `maxRetry` determines the maximum number of retries (up to 15), while `minWaitInMs` sets the minimum wait time between retries in milliseconds.

Apply your custom retry values by setting to `retryParams` on the configuration object passed to the `OpenFgaClient` call.

```javascript
const { OpenFgaClient } = require('@openfga/sdk'); // OR import { OpenFgaClient } from '@openfga/sdk';

const fgaClient = new OpenFgaClient({
  apiUrl: process.env.FGA_API_URL, // required
  storeId: process.env.FGA_STORE_ID, // not needed when calling `CreateStore` or `ListStores`
  authorizationModelId: process.env.FGA_MODEL_ID, // Optional, can be overridden per request
  retryParams: {
    maxRetry: 3, // retry up to 3 times on API requests
    minWaitInMs: 250 // wait a minimum of 250 milliseconds between requests
  }
});
```

### API Endpoints

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**ListStores**](https://openfga.dev/api/service#/Stores/ListStores) | **GET** /stores | List all stores |
| [**CreateStore**](https://openfga.dev/api/service#/Stores/CreateStore) | **POST** /stores | Create a store |
| [**GetStore**](https://openfga.dev/api/service#/Stores/GetStore) | **GET** /stores/{store_id} | Get a store |
| [**DeleteStore**](https://openfga.dev/api/service#/Stores/DeleteStore) | **DELETE** /stores/{store_id} | Delete a store |
| [**ReadAuthorizationModels**](https://openfga.dev/api/service#/Authorization%20Models/ReadAuthorizationModels) | **GET** /stores/{store_id}/authorization-models | Return all the authorization models for a particular store |
| [**WriteAuthorizationModel**](https://openfga.dev/api/service#/Authorization%20Models/WriteAuthorizationModel) | **POST** /stores/{store_id}/authorization-models | Create a new authorization model |
| [**ReadAuthorizationModel**](https://openfga.dev/api/service#/Authorization%20Models/ReadAuthorizationModel) | **GET** /stores/{store_id}/authorization-models/{id} | Return a particular version of an authorization model |
| [**ReadChanges**](https://openfga.dev/api/service#/Relationship%20Tuples/ReadChanges) | **GET** /stores/{store_id}/changes | Return a list of all the tuple changes |
| [**Read**](https://openfga.dev/api/service#/Relationship%20Tuples/Read) | **POST** /stores/{store_id}/read | Get tuples from the store that matches a query, without following userset rewrite rules |
| [**Write**](https://openfga.dev/api/service#/Relationship%20Tuples/Write) | **POST** /stores/{store_id}/write | Add or delete tuples from the store |
| [**Check**](https://openfga.dev/api/service#/Relationship%20Queries/Check) | **POST** /stores/{store_id}/check | Check whether a user is authorized to access an object |
| [**Expand**](https://openfga.dev/api/service#/Relationship%20Queries/Expand) | **POST** /stores/{store_id}/expand | Expand all relationships in userset tree format, and following userset rewrite rules.  Useful to reason about and debug a certain relationship |
| [**ListObjects**](https://openfga.dev/api/service#/Relationship%20Queries/ListObjects) | **POST** /stores/{store_id}/list-objects | [EXPERIMENTAL] Get all objects of the given type that the user has a relation with |
| [**ReadAssertions**](https://openfga.dev/api/service#/Assertions/ReadAssertions) | **GET** /stores/{store_id}/assertions/{authorization_model_id} | Read assertions for an authorization model ID |
| [**WriteAssertions**](https://openfga.dev/api/service#/Assertions/WriteAssertions) | **PUT** /stores/{store_id}/assertions/{authorization_model_id} | Upsert assertions for an authorization model ID |


### Models

[Models](https://github.com/openfga/js-sdk/blob/main/apiModel.ts)


### OpenTelemetry

This SDK supports producing metrics that can be consumed as part of an [OpenTelemetry](https://opentelemetry.io/) setup. For more information, please see [the documentation](https://github.com/openfga/js-sdk/blob/main/docs/opentelemetry.md)

## Contributing

### Issues

If you have found a bug or if you have a feature request, please report them on the [sdk-generator repo](https://github.com/openfga/sdk-generator/issues) issues section. Please do not report security vulnerabilities on the public GitHub issue tracker.

### Pull Requests

While we accept Pull Requests on this repository, the SDKs are autogenerated so please consider additionally submitting your Pull Requests to the [sdk-generator](https://github.com/openfga/sdk-generator) and linking the two PRs together and to the corresponding issue. This will greatly assist the OpenFGA team in being able to give timely reviews as well as deploying fixes and updates to our other SDKs as well. 

## Author

[OpenFGA](https://github.com/openfga)

## License

This project is licensed under the Apache-2.0 license. See the [LICENSE](https://github.com/openfga/js-sdk/blob/main/LICENSE) file for more info.

The code in this repo was auto generated by [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator) from a template based on the [typescript-axios template](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator/src/main/resources/typescript-axios) and [go template](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator/src/main/resources/go), licensed under the [Apache License 2.0](https://github.com/OpenAPITools/openapi-generator/blob/master/LICENSE).
