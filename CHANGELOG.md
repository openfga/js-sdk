# Changelog

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
    e.g. response that was `{"object_ids":["roadmap"]}`, will now be `{"objects":["document:roadmap"]}`

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
