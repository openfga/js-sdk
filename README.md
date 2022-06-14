# JavaScript and Node.js SDK for OpenFGA

[![FOSSA Status](https://app.fossa.com/api/projects/.svg?type=shield)](https://app.fossa.com/projects/?ref=badge_shield)

This is an autogenerated JavaScript SDK for OpenFGA. It provides a wrapper around the [OpenFGA API definition](https://openfga.dev/api), and includes TS typings.

Warning: This SDK comes with no SLAs and is not production-ready!

## Table of Contents

- [About OpenFGA](#about)
- [Resources](#resources)
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Initializing the API Client](#initializing-the-api-client)
  - [Getting your Store ID, Client ID and Client Secret](#getting-your-store-id-client-id-and-client-secret)
  - [Calling the API](#calling-the-api)
    - [Write Authorization Model](#write-authorization-model)
    - [Read a Single Authorization Model](#read-a-single-authorization-model)
    - [Read Authorization Model IDs](#read-authorization-model-ids)
    - [Check](#check)
    - [Write Tuples](#write-tuples)
    - [Delete Tuples](#delete-tuples)
    - [Expand](#expand)
    - [Read](#read)
    - [Read Changes (Watch)](#read-changes-watch)
  - [API Endpoints](#api-endpoints)
  - [Models](#models)
- [Contributing](#contributing)
  - [Issues](#issues)
  - [Pull Requests](#pull-requests) [Note: We are not accepting Pull Requests at this time!]
- [License](#license)

## <a id="about"></a>About OpenFGA

[OpenFGA](https://openfga.dev) is an open source Fine-Grained Authorization solution inspired by [Google's Zanzibar paper](https://research.google/pubs/pub48190/). It was created by the FGA team at [Auth0](https://auth0.com) based on [Auth0 Fine-Grained Authorization (FGA)](https://fga.dev), available under [a permissive license (Apache-2)](https://github.com/openfga/rfcs/blob/main/LICENSE) and welcomes community contributions.

OpenFGA is designed to make it easy for application builders to model their permission layer, and to add and integrate fine-grained authorization into their applications. OpenFGA’s design is optimized for reliability and low latency at a high scale.

It allows in-memory data storage for quick development, as well as pluggable database modules - with initial support for PostgreSQL.

It offers an [HTTP API](https://openfga.dev/docs/api) and has SDKs for programming languages including [Node.js/JavaScript](https://github.com/openfga/js-sdk), [GoLang](https://github.com/openfga/go-sdk) and [.NET](https://github.com/openfga/dotnet-sdk).

More SDKs and integrations such as Rego are planned for the future.

## Resources

- [OpenFGA Documentation](https://openfga.dev/docs)
- [OpenFGA API Documentation](https://openfga.dev/docs/api)
- [Twitter](https://twitter.com/openfga)
- [OpenFGA Discord Community](https://discord.gg/8naAwJfWN6)
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

[Learn how to setup your SDK](https://openfga.dev/docs/getting-started/setup-sdk-client)

Without an API Token

```javascript
const { OpenFgaApi } = require('@openfga/sdk'); // OR import { OpenFgaApi } from '@openfga/sdk';

const openFga = new OpenFgaApi({
  apiScheme: OPENFGA_API_SCHEME, // optional, defaults to "https"
  apiHost: OPENFGA_API_HOST, // required, define without the scheme (e.g. api.openfga.example instead of https://api.openfga.example)
  storeId: OPENFGA_STORE_ID,
});
```

With an API Token

```javascript
const { OpenFgaApi } = require('@openfga/sdk'); // OR import { OpenFgaApi } from '@openfga/sdk';

const openFga = new OpenFgaApi({
  apiScheme: OPENFGA_API_SCHEME, // optional, defaults to "https"
  apiHost: OPENFGA_API_HOST, // required, define without the scheme (e.g. api.openfga.example instead of https://api.openfga.example)
  storeId: OPENFGA_STORE_ID,
  credentials: {
    method: CredentialsMethod.ApiToken,
    config: {
      token: OPENFGA_API_TOKEN,
    }
  }
});
```


### Get your Store ID and optional credentials

You need your store id to call the OpenFGA API (unless it is to create a store or list all stores). You may also configure your credentials if your service requires it.

### Calling the API

#### List Stores

[API Documentation](https://openfga.dev/docs/api#/Stores/ListStores)

```javascript
const { stores } = await openFga.listStores();

// stores = [{ "id": "1uHxCSuTP0VKPYSnkq1pbb1jeZw", "name": "OpenFGA Demo Store", "created_at": "2022-01-01T00:00:00.000Z", "updated_at": "2022-01-01T00:00:00.000Z" }]
```

#### Create Store

[API Documentation](https://openfga.dev/docs/api#/Stores/CreateStore)

```javascript
const { id: storeId } = await openFga.createStore({
  name: "OpenFGA Demo Store",
});

// storeId = "1uHxCSuTP0VKPYSnkq1pbb1jeZw"
```

#### Get Store

[API Documentation](https://openfga.dev/docs/api#/Stores/GetStore)

> Requires a client initialized with a storeId

```javascript
const store = await openFga.getStore({
  name: "OpenFGA Demo Store",
});

// stores = { "id": "1uHxCSuTP0VKPYSnkq1pbb1jeZw", "name": "OpenFGA Demo Store", "created_at": "2022-01-01T00:00:00.000Z", "updated_at": "2022-01-01T00:00:00.000Z" }
```

#### Delete Store

[API Documentation](https://openfga.dev/docs/api#/Stores/DeleteStore)

> Requires a client initialized with a storeId

```javascript
await openFga.deleteStore();
```

#### Write Authorization Model

[API Documentation](https://openfga.dev/docs/api#/Authorization%20Models/WriteAuthorizationModel)

> Requires a client initialized with a storeId

> Note: To learn how to build your authorization model, check the Docs at https://openfga.dev/docs.

> Learn more about [the OpenFGA configuration language](https://openfga.dev/docs/modeling/configuration-language).

```javascript
const { authorization_model_id: id } = await openFga.writeAuthorizationModel({
  type_definitions: [{
    type: "document",
    relations: {
      "writer": { "this": {} },
      "viewer": {
        "union": {
          "child": [
            { "this": {} },
            { "computedUserset": {
               "object": "",
              "relation": "viewer" }
            }
          ]
        }
      }
    } }],
});

// id = "1uHxCSuTP0VKPYSnkq1pbb1jeZw"
```

#### Read a Single Authorization Model

[API Documentation](https://openfga.dev/docs/api#/Authorization%20Models/ReadAuthorizationModel)

> Requires a client initialized with a storeId

```javascript
// Assuming `1uHxCSuTP0VKPYSnkq1pbb1jeZw` is an id of a single model
const { authorization_model: authorizationModel } = await openFga.readAuthorizationModel('1uHxCSuTP0VKPYSnkq1pbb1jeZw');

// authorizationModel = { id: "1uHxCSuTP0VKPYSnkq1pbb1jeZw", type_definitions: [...] }
```

#### Read Authorization Model IDs

[API Documentation](https://openfga.dev/docs/api#/Authorization%20Models/ReadAuthorizationModels)

```javascript
const { authorization_model_ids: authorizationModelIds } = await openFga.readAuthorizationModels();

// authorizationModelIds = ["1uHxCSuTP0VKPYSnkq1pbb1jeZw", "GtQpMohWezFmIbyXxVEocOCxxgq"];
```

#### Check

[API Documentation](https://openfga.dev/docs/api#/Tuples/Check)

> Requires a client initialized with a storeId

> Provide a tuple and ask the OpenFGA API to check for a relationship

```javascript
const result = await openFga.check({
  tuple_key: {
    user: "81684243-9356-4421-8fbf-a4f8d36aa31b",
    relation: "admin",
    object: "workspace:675bcac4-ad38-4fb1-a19a-94a5648c91d6",
  },
});

// result = { allowed: true, resolution: "" }
```

#### Write Tuples

[API Documentation](https://openfga.dev/docs/api#/Tuples/Write)

> Requires a client initialized with a storeId

```javascript
await openFga.write({
  writes: {
    tuple_keys: [{ user: "anne", relation: "viewer", object: "document:roadmap" }],
  },
});

```

#### Delete Tuples

[API Documentation](https://openfga.dev/docs/api#/Tuples/Write)

> Requires a client initialized with a storeId

```javascript
await openFga.write({
  deletes: {
    tuple_keys: [{ user: "anne", relation: "viewer", object: "document:roadmap" }],
  },
});

```

#### Expand

[API Documentation](https://openfga.dev/docs/api#/Debugging/Expand)

> Requires a client initialized with a storeId

```javascript
const { tree } = await openFga.expand({
  tuple_key: {
    relation: "admin",
    object: "workspace:675bcac4-ad38-4fb1-a19a-94a5648c91d6",
  },
});

// tree  = { root: { name: "workspace:675bcac4-ad38-4fb1-a19a-94a5648c91d6#admin", leaf: { users: { users: ["anne", "beth"] } } } }
```

#### Read

[API Documentation](https://openfga.dev/docs/api#/Tuples/Read)

> Requires a client initialized with a storeId

```javascript
// Find if a relationship tuple stating that a certain user is an admin on a certain workspace
const body = {
  tuple_key: {
    user: "81684243-9356-4421-8fbf-a4f8d36aa31b",
    relation: "admin",
    object: "workspace:675bcac4-ad38-4fb1-a19a-94a5648c91d6",
  },
};

// Find all relationship tuples where a certain user has a relationship as any relation to a certain workspace
const body = {
  tuple_key: {
    user: "81684243-9356-4421-8fbf-a4f8d36aa31b",
    object: "workspace:675bcac4-ad38-4fb1-a19a-94a5648c91d6",
  },
};

// Find all relationship tuples where a certain user is an admin on any workspace
const body = {
  tuple_key: {
    user: "81684243-9356-4421-8fbf-a4f8d36aa31b",
    relation: "admin",
    object: "workspace:",
  },
};

// Find all relationship tuples where any user has a relationship as any relation with a particular workspace
const body = {
  tuple_key: {
    object: "workspace:675bcac4-ad38-4fb1-a19a-94a5648c91d6",
  },
};

const { tuples } = await openFga.read(body);

// In all the above situations, the response will be of the form:
// tuples = [{ key: { user, relation, object }, timestamp: ... }]
```

#### Read Changes (Watch)

> Requires a client initialized with a storeId

[API Documentation](https://openfga.dev/docs/api#/Tuples/ReadChanges)

```javascript
const type = 'workspace';
const pageSize = 25;
const continuationToken = 'eyJwayI6IkxBVEVTVF9OU0NPTkZJR19hdXRoMHN0b3JlIiwic2siOiIxem1qbXF3MWZLZExTcUoyN01MdTdqTjh0cWgifQ==';
const response = await openFga.readChanges(type, pageSize, continuationToken);

// response.continuation_token = ...
// response.changes = [
//   { tuple_key: { user, relation, object }, operation: "write", timestamp: ... },
//   { tuple_key: { user, relation, object }, operation: "delete", timestamp: ... }
// ]
```


### API Endpoints

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**check**](#check) | **POST** /stores/{store_id}/check | Check whether a user is authorized to access an object |
| [**createStore**](#createstore) | **POST** /stores | Create a store |
| [**deleteStore**](#deletestore) | **DELETE** /stores/{store_id} | Delete a store |
| [**expand**](#expand) | **POST** /stores/{store_id}/expand | Expand all relationships in userset tree format, and following userset rewrite rules.  Useful to reason about and debug a certain relationship |
| [**getStore**](#getstore) | **GET** /stores/{store_id} | Get a store |
| [**listStores**](#liststores) | **GET** /stores | Get all stores |
| [**read**](#read) | **POST** /stores/{store_id}/read | Get tuples from the store that matches a query, without following userset rewrite rules |
| [**readAssertions**](#readassertions) | **GET** /stores/{store_id}/assertions/{authorization_model_id} | Read assertions for an authorization model ID |
| [**readAuthorizationModel**](#readauthorizationmodel) | **GET** /stores/{store_id}/authorization-models/{id} | Return a particular version of an authorization model |
| [**readAuthorizationModels**](#readauthorizationmodels) | **GET** /stores/{store_id}/authorization-models | Return all the authorization model IDs for a particular store |
| [**readChanges**](#readchanges) | **GET** /stores/{store_id}/changes | Return a list of all the tuple changes |
| [**write**](#write) | **POST** /stores/{store_id}/write | Add or delete tuples from the store |
| [**writeAssertions**](#writeassertions) | **PUT** /stores/{store_id}/assertions/{authorization_model_id} | Upsert assertions for an authorization model ID |
| [**writeAuthorizationModel**](#writeauthorizationmodel) | **POST** /stores/{store_id}/authorization-models | Create a new authorization model |

#### check


| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **body** | [**CheckRequest**](#CheckRequest) |  | |

##### Return type

[**CheckResponse**](#CheckResponse)


#### createStore


| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |


##### Return type

[**CreateStoreResponse**](#CreateStoreResponse)


#### deleteStore


| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |


##### Return type

 (empty response body)


#### expand


| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **body** | [**ExpandRequest**](#ExpandRequest) |  | |

##### Return type

[**ExpandResponse**](#ExpandResponse)


#### getStore


| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |


##### Return type

[**GetStoreResponse**](#GetStoreResponse)


#### listStores


| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **continuationToken** | **string** |  | [default to undefined]|

##### Return type

[**ListStoresResponse**](#ListStoresResponse)


#### read


| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **body** | [**ReadRequest**](#ReadRequest) |  | |

##### Return type

[**ReadResponse**](#ReadResponse)


#### readAssertions


| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **authorizationModelId** | **string** |  | [default to undefined]|

##### Return type

[**ReadAssertionsResponse**](#ReadAssertionsResponse)


#### readAuthorizationModel


| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string** |  | [default to undefined]|

##### Return type

[**ReadAuthorizationModelResponse**](#ReadAuthorizationModelResponse)


#### readAuthorizationModels


| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **pageSize** | **number** |  | [default to undefined]|| **continuationToken** | **string** |  | [default to undefined]|

##### Return type

[**ReadAuthorizationModelsResponse**](#ReadAuthorizationModelsResponse)


#### readChanges


| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **type** | **string** |  | [default to undefined]|| **pageSize** | **number** |  | [default to undefined]|| **continuationToken** | **string** |  | [default to undefined]|

##### Return type

[**ReadChangesResponse**](#ReadChangesResponse)


#### write


| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **body** | [**WriteRequest**](#WriteRequest) |  | |

##### Return type

**object**


#### writeAssertions


| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **authorizationModelId** | **string** |  | [default to undefined]|| **body** | [**WriteAssertionsRequest**](#WriteAssertionsRequest) |  | |

##### Return type

 (empty response body)


#### writeAuthorizationModel


| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **typeDefinitions** | [**TypeDefinitions**](#TypeDefinitions) |  | |

##### Return type

[**WriteAuthorizationModelResponse**](#WriteAuthorizationModelResponse)


### Models

 - [Any](#Any)
 - [Assertion](#Assertion)
 - [AuthorizationModel](#AuthorizationModel)
 - [CheckRequest](#CheckRequest)
 - [CheckResponse](#CheckResponse)
 - [Computed](#Computed)
 - [ContextualTupleKeys](#ContextualTupleKeys)
 - [CreateStoreRequest](#CreateStoreRequest)
 - [CreateStoreResponse](#CreateStoreResponse)
 - [Difference](#Difference)
 - [ErrorCode](#ErrorCode)
 - [ExpandRequest](#ExpandRequest)
 - [ExpandResponse](#ExpandResponse)
 - [GetStoreResponse](#GetStoreResponse)
 - [InternalErrorCode](#InternalErrorCode)
 - [InternalErrorMessageResponse](#InternalErrorMessageResponse)
 - [Leaf](#Leaf)
 - [ListStoresResponse](#ListStoresResponse)
 - [Node](#Node)
 - [Nodes](#Nodes)
 - [NotFoundErrorCode](#NotFoundErrorCode)
 - [ObjectRelation](#ObjectRelation)
 - [PathUnknownErrorMessageResponse](#PathUnknownErrorMessageResponse)
 - [ReadAssertionsResponse](#ReadAssertionsResponse)
 - [ReadAuthorizationModelResponse](#ReadAuthorizationModelResponse)
 - [ReadAuthorizationModelsResponse](#ReadAuthorizationModelsResponse)
 - [ReadChangesResponse](#ReadChangesResponse)
 - [ReadRequest](#ReadRequest)
 - [ReadResponse](#ReadResponse)
 - [Status](#Status)
 - [Store](#Store)
 - [Tuple](#Tuple)
 - [TupleChange](#TupleChange)
 - [TupleKey](#TupleKey)
 - [TupleKeys](#TupleKeys)
 - [TupleOperation](#TupleOperation)
 - [TupleToUserset](#TupleToUserset)
 - [TypeDefinition](#TypeDefinition)
 - [TypeDefinitions](#TypeDefinitions)
 - [Users](#Users)
 - [Userset](#Userset)
 - [UsersetTree](#UsersetTree)
 - [UsersetTreeDifference](#UsersetTreeDifference)
 - [UsersetTreeTupleToUserset](#UsersetTreeTupleToUserset)
 - [Usersets](#Usersets)
 - [ValidationErrorMessageResponse](#ValidationErrorMessageResponse)
 - [WriteAssertionsRequest](#WriteAssertionsRequest)
 - [WriteAuthorizationModelResponse](#WriteAuthorizationModelResponse)
 - [WriteRequest](#WriteRequest)


#### Any

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** |  | [optional] [default to undefined]

#### Assertion

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tuple_key** | [**TupleKey**](#TupleKey) |  | [optional] [default to undefined]
**expectation** | **boolean** |  | [default to undefined]

#### AuthorizationModel

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**type_definitions** | [**TypeDefinition**[]](#TypeDefinition) |  | [optional] [default to undefined]

#### CheckRequest

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tuple_key** | [**TupleKey**](#TupleKey) |  | [optional] [default to undefined]
**contextual_tuples** | [**ContextualTupleKeys**](#ContextualTupleKeys) |  | [optional] [default to undefined]
**authorization_model_id** | **string** |  | [optional] [default to undefined]
**trace** | **boolean** | Defaults to false. Making it true has performance implications. | [optional] [readonly] [default to undefined]

#### CheckResponse

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**allowed** | **boolean** |  | [optional] [default to undefined]
**resolution** | **string** | For internal use only. | [optional] [default to undefined]

#### Computed

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**userset** | **string** |  | [optional] [default to undefined]

#### ContextualTupleKeys

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tuple_keys** | [**TupleKey**[]](#TupleKey) |  | [default to undefined]

#### CreateStoreRequest

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [optional] [default to undefined]

#### CreateStoreResponse

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**name** | **string** |  | [optional] [default to undefined]
**created_at** | **string** |  | [optional] [default to undefined]
**updated_at** | **string** |  | [optional] [default to undefined]

#### Difference

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**base** | [**Userset**](#Userset) |  | [optional] [default to undefined]
**subtract** | [**Userset**](#Userset) |  | [optional] [default to undefined]

#### ErrorCode

##### Enum


* `NoError` (value: `'no_error'`)

* `ValidationError` (value: `'validation_error'`)

* `AuthorizationModelNotFound` (value: `'authorization_model_not_found'`)

* `AuthorizationModelResolutionTooComplex` (value: `'authorization_model_resolution_too_complex'`)

* `InvalidWriteInput` (value: `'invalid_write_input'`)

* `CannotAllowDuplicateTuplesInOneRequest` (value: `'cannot_allow_duplicate_tuples_in_one_request'`)

* `CannotAllowDuplicateTypesInOneRequest` (value: `'cannot_allow_duplicate_types_in_one_request'`)

* `CannotAllowMultipleReferencesToOneRelation` (value: `'cannot_allow_multiple_references_to_one_relation'`)

* `InvalidContinuationToken` (value: `'invalid_continuation_token'`)

* `InvalidTupleSet` (value: `'invalid_tuple_set'`)

* `InvalidCheckInput` (value: `'invalid_check_input'`)

* `InvalidExpandInput` (value: `'invalid_expand_input'`)

* `UnsupportedUserSet` (value: `'unsupported_user_set'`)

* `InvalidObjectFormat` (value: `'invalid_object_format'`)

* `WriteFailedDueToInvalidInput` (value: `'write_failed_due_to_invalid_input'`)

* `AuthorizationModelAssertionsNotFound` (value: `'authorization_model_assertions_not_found'`)

* `LatestAuthorizationModelNotFound` (value: `'latest_authorization_model_not_found'`)

* `TypeNotFound` (value: `'type_not_found'`)

* `RelationNotFound` (value: `'relation_not_found'`)

* `EmptyRelationDefinition` (value: `'empty_relation_definition'`)

* `InvalidUser` (value: `'invalid_user'`)

* `InvalidTuple` (value: `'invalid_tuple'`)

* `UnknownRelation` (value: `'unknown_relation'`)

* `StoreIdInvalidLength` (value: `'store_id_invalid_length'`)

* `AssertionsTooManyItems` (value: `'assertions_too_many_items'`)

* `IdTooLong` (value: `'id_too_long'`)

* `AuthorizationModelIdTooLong` (value: `'authorization_model_id_too_long'`)

* `TupleKeyValueNotSpecified` (value: `'tuple_key_value_not_specified'`)

* `TupleKeysTooManyOrTooFewItems` (value: `'tuple_keys_too_many_or_too_few_items'`)

* `PageSizeInvalid` (value: `'page_size_invalid'`)

* `ParamMissingValue` (value: `'param_missing_value'`)

* `DifferenceBaseMissingValue` (value: `'difference_base_missing_value'`)

* `SubtractBaseMissingValue` (value: `'subtract_base_missing_value'`)

* `ObjectTooLong` (value: `'object_too_long'`)

* `RelationTooLong` (value: `'relation_too_long'`)

* `TypeDefinitionsTooFewItems` (value: `'type_definitions_too_few_items'`)

* `TypeInvalidLength` (value: `'type_invalid_length'`)

* `TypeInvalidPattern` (value: `'type_invalid_pattern'`)

* `RelationsTooFewItems` (value: `'relations_too_few_items'`)

* `RelationsTooLong` (value: `'relations_too_long'`)

* `RelationsInvalidPattern` (value: `'relations_invalid_pattern'`)

* `ObjectInvalidPattern` (value: `'object_invalid_pattern'`)

* `QueryStringTypeContinuationTokenMismatch` (value: `'query_string_type_continuation_token_mismatch'`)

* `ExceededEntityLimit` (value: `'exceeded_entity_limit'`)

* `InvalidContextualTuple` (value: `'invalid_contextual_tuple'`)

* `DuplicateContextualTuple` (value: `'duplicate_contextual_tuple'`)


#### ExpandRequest

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tuple_key** | [**TupleKey**](#TupleKey) |  | [optional] [default to undefined]
**authorization_model_id** | **string** |  | [optional] [default to undefined]

#### ExpandResponse

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tree** | [**UsersetTree**](#UsersetTree) |  | [optional] [default to undefined]

#### GetStoreResponse

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**name** | **string** |  | [optional] [default to undefined]
**created_at** | **string** |  | [optional] [default to undefined]
**updated_at** | **string** |  | [optional] [default to undefined]

#### InternalErrorCode

##### Enum


* `NoInternalError` (value: `'no_internal_error'`)

* `InternalError` (value: `'internal_error'`)

* `Cancelled` (value: `'cancelled'`)

* `DeadlineExceeded` (value: `'deadline_exceeded'`)

* `AlreadyExists` (value: `'already_exists'`)

* `ResourceExhausted` (value: `'resource_exhausted'`)

* `FailedPrecondition` (value: `'failed_precondition'`)

* `Aborted` (value: `'aborted'`)

* `OutOfRange` (value: `'out_of_range'`)

* `Unavailable` (value: `'unavailable'`)

* `DataLoss` (value: `'data_loss'`)


#### InternalErrorMessageResponse

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**code** | [**InternalErrorCode**](#InternalErrorCode) |  | [optional] [default to undefined]
**message** | **string** |  | [optional] [default to undefined]

#### Leaf

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**users** | [**Users**](#Users) |  | [optional] [default to undefined]
**computed** | [**Computed**](#Computed) |  | [optional] [default to undefined]
**tupleToUserset** | [**UsersetTreeTupleToUserset**](#UsersetTreeTupleToUserset) |  | [optional] [default to undefined]

#### ListStoresResponse

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**stores** | [**Store**[]](#Store) |  | [optional] [default to undefined]
**continuation_token** | **string** |  | [optional] [default to undefined]

#### Node

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [optional] [default to undefined]
**leaf** | [**Leaf**](#Leaf) |  | [optional] [default to undefined]
**difference** | [**UsersetTreeDifference**](#UsersetTreeDifference) |  | [optional] [default to undefined]
**union** | [**Nodes**](#Nodes) |  | [optional] [default to undefined]
**intersection** | [**Nodes**](#Nodes) |  | [optional] [default to undefined]

#### Nodes

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**nodes** | [**Node**[]](#Node) |  | [optional] [default to undefined]

#### NotFoundErrorCode

##### Enum


* `NoNotFoundError` (value: `'no_not_found_error'`)

* `UndefinedEndpoint` (value: `'undefined_endpoint'`)

* `StoreIdNotFound` (value: `'store_id_not_found'`)

* `Unimplemented` (value: `'unimplemented'`)


#### ObjectRelation

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**object** | **string** |  | [optional] [default to undefined]
**relation** | **string** |  | [optional] [default to undefined]

#### PathUnknownErrorMessageResponse

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**code** | [**NotFoundErrorCode**](#NotFoundErrorCode) |  | [optional] [default to undefined]
**message** | **string** |  | [optional] [default to undefined]

#### ReadAssertionsResponse

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**authorization_model_id** | **string** |  | [optional] [default to undefined]
**assertions** | [**Assertion**[]](#Assertion) |  | [optional] [default to undefined]

#### ReadAuthorizationModelResponse

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**authorization_model** | [**AuthorizationModel**](#AuthorizationModel) |  | [optional] [default to undefined]

#### ReadAuthorizationModelsResponse

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**authorization_models** | [**AuthorizationModel**[]](#AuthorizationModel) |  | [optional] [default to undefined]
**continuation_token** | **string** |  | [optional] [default to undefined]

#### ReadChangesResponse

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**changes** | [**TupleChange**[]](#TupleChange) |  | [optional] [default to undefined]
**continuation_token** | **string** |  | [optional] [default to undefined]

#### ReadRequest

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tuple_key** | [**TupleKey**](#TupleKey) |  | [optional] [default to undefined]
**authorization_model_id** | **string** |  | [optional] [default to undefined]
**page_size** | **number** |  | [optional] [default to undefined]
**continuation_token** | **string** |  | [optional] [default to undefined]

#### ReadResponse

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tuples** | [**Tuple**[]](#Tuple) |  | [optional] [default to undefined]
**continuation_token** | **string** |  | [optional] [default to undefined]

#### Status

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**code** | **number** |  | [optional] [default to undefined]
**message** | **string** |  | [optional] [default to undefined]
**details** | [**Any**[]](#Any) |  | [optional] [default to undefined]

#### Store

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**name** | **string** |  | [optional] [default to undefined]
**created_at** | **string** |  | [optional] [default to undefined]
**updated_at** | **string** |  | [optional] [default to undefined]
**deleted_at** | **string** |  | [optional] [default to undefined]

#### Tuple

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**key** | [**TupleKey**](#TupleKey) |  | [optional] [default to undefined]
**timestamp** | **string** |  | [optional] [default to undefined]

#### TupleChange

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tuple_key** | [**TupleKey**](#TupleKey) |  | [optional] [default to undefined]
**operation** | [**TupleOperation**](#TupleOperation) |  | [optional] [default to undefined]
**timestamp** | **string** |  | [optional] [default to undefined]

#### TupleKey

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**object** | **string** |  | [optional] [default to undefined]
**relation** | **string** |  | [optional] [default to undefined]
**user** | **string** |  | [optional] [default to undefined]

#### TupleKeys

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tuple_keys** | [**TupleKey**[]](#TupleKey) |  | [default to undefined]

#### TupleOperation

##### Enum


* `Write` (value: `'TUPLE_OPERATION_WRITE'`)

* `Delete` (value: `'TUPLE_OPERATION_DELETE'`)


#### TupleToUserset

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tupleset** | [**ObjectRelation**](#ObjectRelation) |  | [optional] [default to undefined]
**computedUserset** | [**ObjectRelation**](#ObjectRelation) |  | [optional] [default to undefined]

#### TypeDefinition

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **string** |  | [default to undefined]
**relations** | [**Record<string, Userset**>](#Userset) |  | [default to undefined]

#### TypeDefinitions

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type_definitions** | [**TypeDefinition**[]](#TypeDefinition) |  | [optional] [default to undefined]

#### Users

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**users** | **string** |  | [optional] [default to undefined]

#### Userset

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**this** | **object** | A DirectUserset is a sentinel message for referencing the direct members specified by an object/relation mapping. | [optional] [default to undefined]
**computedUserset** | [**ObjectRelation**](#ObjectRelation) |  | [optional] [default to undefined]
**tupleToUserset** | [**TupleToUserset**](#TupleToUserset) |  | [optional] [default to undefined]
**union** | [**Usersets**](#Usersets) |  | [optional] [default to undefined]
**intersection** | [**Usersets**](#Usersets) |  | [optional] [default to undefined]
**difference** | [**Difference**](#Difference) |  | [optional] [default to undefined]

#### UsersetTree

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**root** | [**Node**](#Node) |  | [optional] [default to undefined]

#### UsersetTreeDifference

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**base** | [**Node**](#Node) |  | [optional] [default to undefined]
**subtract** | [**Node**](#Node) |  | [optional] [default to undefined]

#### UsersetTreeTupleToUserset

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**tupleset** | **string** |  | [optional] [default to undefined]
**computed** | [**Computed**[]](#Computed) |  | [optional] [default to undefined]

#### Usersets

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**child** | [**Userset**[]](#Userset) |  | [optional] [default to undefined]

#### ValidationErrorMessageResponse

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**code** | [**ErrorCode**](#ErrorCode) |  | [optional] [default to undefined]
**message** | **string** |  | [optional] [default to undefined]

#### WriteAssertionsRequest

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**assertions** | [**Assertion**[]](#Assertion) |  | [default to undefined]

#### WriteAuthorizationModelResponse

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**authorization_model_id** | **string** |  | [optional] [default to undefined]

#### WriteRequest

##### Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**writes** | [**TupleKeys**](#TupleKeys) |  | [optional] [default to undefined]
**deletes** | [**TupleKeys**](#TupleKeys) |  | [optional] [default to undefined]
**authorization_model_id** | **string** |  | [optional] [default to undefined]



## Contributing

### Issues

If you have found a bug or if you have a feature request, please report them at this repository [issues](https://github.com/openfga/js-sdk/issues) section. Please do not report security vulnerabilities on the public GitHub issue tracker.

### Pull Requests

Pull Requests are not currently open, please [raise an issue](https://github.com/openfga/js-sdk/issues) or contact a team member on https://discord.gg/8naAwJfWN6 if there is a feature you'd like us to implement.

## Author

[OpenFGA](https://github.com/openfga)

## License

This project is licensed under the Apache-2.0 license. See the [LICENSE](https://github.com/openfga/js-sdk/blob/main/LICENSE) file for more info.

The code in this repo was auto generated by [OpenAPI Generator](https://github.com/OpenAPITools/openapi-generator) from a template based on the [typescript-axios template](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator/src/main/resources/typescript-axios) and [go template](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator/src/main/resources/go), licensed under the [Apache License 2.0](https://github.com/OpenAPITools/openapi-generator/blob/master/LICENSE).
