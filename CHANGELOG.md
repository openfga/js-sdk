# Changelog


## [Unreleased](https://github.com/openfga/js-sdk/compare/v0.9.1...HEAD)

## v0.9.1

### [v0.9.1](https://github.com/openfga/js-sdk/compare/v0.9.0...v0.9.1) (2025-11-05)

- feat: add support for handling Retry-After header (#267)
- feat: add support for conflict options for Write operations: (#276)
  The client now supports setting `conflict` on `ClientWriteRequestOpts` to control behavior when writing duplicate tuples or deleting non-existent tuples. This feature requires OpenFGA server [v1.10.0](https://github.com/openfga/openfga/releases/tag/v1.10.0) or later.
  See [Conflict Options for Write Operations](./README.md#conflict-options-for-write-operations) for more.

## v0.9.0

### [v0.9.0](https://github.com/openfga/js-sdk/compare/v0.8.1...v0.9.0) (2025-06-04)

- feat: support client assertion for client credentials authentication (#228)

## v0.8.1

### [v0.8.1](https://github.com/openfga/js-sdk/compare/v0.8.0...v0.8.1) (2025-04-24)

- fix: change check for Node.js environment to fix issue where `process.title` cannot be read (#222)

## v0.8.0

### [0.8.0](https://github.com/openfga/js-sdk/compare/v0.7.0...v0.8.0) (2025-01-14)

- feat!: add support for server-side `BatchCheck` method. This is a more efficient way to check on multiple tuples than calling the existing client-side `BatchCheck`. Using this method requires an OpenFGA [v1.8.0+](https://github.com/openfga/openfga/releases/tag/v1.8.0) server.
    - The existing `BatchCheck` method has been renamed to `clientBatchCheck` and it now bundles the results in a field called `result` instead of `responses`.
    - The existing `BatchCheckResponse` has been renamed to `ClientBatchCheckResponse`.
- feat: add support for  startTime` parameter in `ReadChanges` endpoint
- feat: support contextual tuples and context in assertions
- feat: support contextual tuples in Expand
- fix: error correctly if apiUrl is not provided - thanks @Waheedsys (#161)
- fix: use provided axios instance in credentials refresh - thanks @Siddhant-K-code (#193)
- fix!: The minimum node version required by this SDK is now v16.15.0
- chore(docs): various cleanup and improvements - thanks @tmsagarofficial (#164), @vil02 (https://github.com/openfga/sdk-generator/pull/424, https://github.com/openfga/sdk-generator/pull/422), @sccalabr (https://github.com/openfga/sdk-generator/pull/433)

BREAKING CHANGES:
- The minimum node version required by this SDK is now v16.15.0
- Usage of the existing `batchCheck` method should now use the `clientBatchCheck` method. The existing `BatchCheckResponse` has been renamed to `ClientBatchCheckResponse` and it now bundles the results in a field called `result` instead of `responses`.

## v0.7.0

### [0.7.0](https://github.com/openfga/js-sdk/compare/v0.6.3...v0.7.0) (2024-08-30)

- feat!: enhancements to OpenTelemetry support (#149)

BREAKING CHANGE:

This version changes the way in which telemetry is configured and reported. See #149 for additional information.

## v0.6.3

### [0.6.3](https://github.com/openfga/js-sdk/compare/v0.6.2...v0.6.3) (2024-08-28)

- fix: set the consistency parameter correctly in OpenFgaClient (#143)

## v0.6.2

### [0.6.2](https://github.com/openfga/js-sdk/compare/v0.6.1...v0.6.2) (2024-07-31)
- feat: add support for specifying consistency when evaluating or reading (#129)
  Note: To use this feature, you need to be running OpenFGA v1.5.7+ with the experimental flag
  `enable-consistency-params` enabled. See the [v1.5.7 release notes](https://github.com/openfga/openfga/releases/tag/v1.5.7) for details.

## v0.6.1

### [0.6.1](https://github.com/openfga/js-sdk/compare/v0.6.0...v0.6.1) (2024-07-11)
- fix(metrics): add missing request model id attribute (#122)

> [!IMPORTANT]
> In this release we have changed our TypeScript compile target to ES2020 to align with our stated supported environments

## v0.6.0

### [0.6.0](https://github.com/openfga/js-sdk/compare/v0.5.0...v0.6.0) (2024-06-28)
- feat: add opentelemetry metrics reporting (#117)

## v0.5.0

### [0.5.0](https://github.com/openfga/js-sdk/compare/v0.4.0...v0.5.0) (2024-06-14)
- chore!: remove excluded users from ListUsers response

BREAKING CHANGE:

This version removes the `excluded_users` property from the `ListUsersResponse` and `ClientListUsersResponse` interfaces,
for more details see the [associated API change](https://github.com/openfga/api/pull/171).

## v0.4.0

### [0.4.0](https://github.com/openfga/js-sdk/compare/v0.3.5...v0.4.0) (2024-04-30)

- feat: support the [ListUsers](https://github.com/openfga/rfcs/blob/main/20231214-listUsers-api.md) endpoint (#97)
- feat!: support overriding storeId per request (#97)
    `OpenFgaClient` now supports specifying the storeId in the options to override it per request

    [BREAKING CHANGE] the underlying `OpenFgaApi` now expects `storeId` as the first param on relevant methods,
    if you are still using this class, make sure you update your references when needed.

## v0.3.5

### [0.3.5](https://github.com/openfga/js-sdk/compare/v0.3.4...v0.3.5) (2024-03-19)

- feat: add support for modular models metadata

## v0.3.4

### [0.3.4](https://github.com/openfga/js-sdk/compare/v0.3.3...v0.3.4) (2024-03-15)

- chore: bump deps. resolves [CVE-2024-28849](https://nvd.nist.gov/vuln/detail/CVE-2024-28849) in
[follow-redirects](https://www.npmjs.com/package/follow-redirects)

## v0.3.3

### [0.3.3](https://github.com/openfga/js-sdk/compare/v0.3.2...v0.3.3) (2024-02-26)

- fix: do not call ReadAuthorizationModel on BatchCheck or non-Transactional Write

## v0.3.2

### [0.3.2](https://github.com/openfga/js-sdk/compare/v0.3.1...v0.3.2) (2024-02-13)

- feat: add example project
- feat: add support for `apiUrl` configuration option and deprecate `apiScheme` and `apiHost`
- fix: use correct content type for token request
- fix: make body in `readChanges` optional

## v0.3.1

### [0.3.1](https://github.com/openfga/js-sdk/compare/v0.3.0...v0.3.1) (2024-01-26)

- chore: use latest API interfaces
- chore: dependency updates

## v0.3.0

### [0.3.0](https://github.com/openfga/js-sdk/compare/v0.2.10...v0.3.0) (2023-12-11)

- feat: support for [conditions](https://openfga.dev/blog/conditional-tuples-announcement)
- chore: use latest API interfaces
- chore: dependency updates

## v0.2.10

### [0.2.10](https://github.com/openfga/js-sdk/compare/v0.2.9...v0.2.10) (2023-11-01)

- chore(deps): update dependencies
  updates axios to `^1.6.0` to resolve [SNYK-JS-AXIOS-6032459](https://security.snyk.io/vuln/SNYK-JS-AXIOS-6032459)

## v0.2.9

### [0.2.9](https://github.com/openfga/js-sdk/compare/v0.2.8...v0.2.9) (2023-10-20)

- chore(deps): update dependencies

## v0.2.8

### [0.2.8](https://github.com/openfga/js-sdk/compare/v0.2.7...v0.2.8) (2023-08-18)

- fix: set http keep-alive to true
- fix: list relations should throw when an underlying check errors
- fix: return raw response in client check
- chore(deps): update dependencies

## v0.2.7

### [0.2.7](https://github.com/openfga/js-sdk/compare/v0.2.6...v0.2.7) (2023-08-16)

- fix(credentials): fix calculation of token expiry
- chore(deps): update dependencies

## v0.2.6

### [0.2.6](https://github.com/openfga/js-sdk/compare/v0.2.5...v0.2.6) (2023-05-19)

- feat(validation): ensure storeId and authorizationModelId are in valid ulid format
- fix(client): ensure that the api connection is valid
- fix(credentials): retry on client credential exchange in case of errors
- chore(deps): update dependencies

## v0.2.5

### [0.2.5](https://github.com/openfga/js-sdk/compare/v0.2.4...v0.2.5) (2023-04-21)

- feat(client): implement `listRelations` to check what relationships a user has with an object
- feat!: `schema_version` is now required when calling `WriteAuthorizationModel`
- fix(client): proper parallel limit for batch fns (BatchCheck, etc..)
- chore(ci): publish provenance data
- chore(deps): update dependencies

## v0.2.4

### [0.2.4](https://github.com/openfga/js-sdk/compare/v0.2.3...v0.2.4) (2023-03-09)

- fix(client): OpenFgaClient `read` was not passing in pagination options
- feat(client): implement sleep in batch calls to lower the possibility of hitting rate limits

## v0.2.3

### [0.2.3](https://github.com/openfga/js-sdk/compare/v0.2.2...v0.2.3) (2023-03-07)

- feat(client): client wrapper with a slightly changed interface
- feat(client): implement `batchCheck` to check multiple tuples in parallel
- feat(client): add support for a non-transactional `Write`
- chore(config): bump default max retries to 5
- fix: retry on 5xx errors
- chore!: request Node >= 14.7.0

Checkout the [README](https://github.com/openfga/js-sdk/blob/main/README.md) for more on how to use the new OpenFgaClient.

## v0.2.2

### [0.2.2](https://github.com/openfga/js-sdk/compare/v0.2.1...v0.2.2) (2023-01-23)

- fix(credentials): resolve client credentials token not being cached
- chore(deps): upgrade dev dependencies

## v0.2.1

### [0.2.1](https://github.com/openfga/js-sdk/compare/v0.2.0...v0.2.1) (2023-01-17)

- chore(deps): upgrade dev dependencies, resolves npm audit issue

## v0.2.0

### [0.2.0](https://github.com/openfga/js-sdk/compare/v0.1.1...v0.2.0) (2022-12-14)

Updated to include support for [OpenFGA 0.3.0](https://github.com/openfga/openfga/releases/tag/v0.3.0)

Changes:
- [BREAKING] feat(list-objects)!: response has been changed to include the object type
    e.g. response that was `{"object_ids":["roadmap"]}`, will now be `{"objects":["document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a"]}`

Fixes:
- fix(models): update interfaces that had incorrectly optional fields to make them required

Chore:
- chore(deps): update dev dependencies

## v0.1.1

### [0.1.1](https://github.com/openfga/js-sdk/compare/v0.1.0...v0.1.1) (2022-11-15)

Regenerate to include support for [restricting wildcards](https://github.com/openfga/rfcs/pull/8) in authorization models.

## v0.1.0

### [0.1.0](https://github.com/openfga/js-sdk/compare/v0.0.2...v0.1.0) (2022-09-29)

- BREAKING: exported type `TypeDefinitions` is now `WriteAuthorizationModelRequest`
    This is only a breaking change on the SDK, not the API. It was changed to conform to the proto changes in [openfga/api](https://github.com/openfga/api/pull/27).
    It makes the type name more consistent and less confusing (normally people would incorrectly assume TypeDefinitions = TypeDefinition[]).
- chore(deps): upgrade dependencies

## v0.0.2

### [0.0.2](https://github.com/openfga/js-sdk/compare/v0.0.1...v0.0.2) (2022-08-15)

Support for [ListObjects API]](https://openfga.dev/api/service#/Relationship%20Queries/ListObjects)

You call the API and receive the list of object ids from a particular type that the user has a certain relation with.

For example, to find the list of documents that Anne can read:

```javascript
const response = await openFgaApi.listObjects({
  user: "anne",
  relation: "can_read",
  type: "document"
});

// response.object_ids = ["roadmap"]
```

## v0.0.1

### [0.0.1](https://github.com/openfga/js-sdk/releases/tag/v0.0.1) (2022-06-15)

Initial OpenFGA JS SDK release
- Support for [OpenFGA](https://github.com/openfga/openfga) API
  - CRUD stores
  - Create, read & list authorization models
  - Writing and Reading Tuples
  - Checking authorization
  - Using Expand to understand why access was granted
