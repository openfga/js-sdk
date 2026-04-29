# Changelog


## [0.9.6](https://github.com/openfga/js-sdk/compare/v0.9.5...v0.9.6) (2026-04-29)


### ⚠ BREAKING CHANGES

* support server-side batch check endpoiont ([#185](https://github.com/openfga/js-sdk/issues/185))
* remove excluded users from ListUsers response ([#112](https://github.com/openfga/js-sdk/issues/112))
* remove excluded users from ListUsers response
* support for conditions ([#39](https://github.com/openfga/js-sdk/issues/39))
* support for conditions

### Added

* add APIExecutor dedicated examples ([#385](https://github.com/openfga/js-sdk/issues/385)) ([e1faea8](https://github.com/openfga/js-sdk/commit/e1faea8a9c0ee004346fdb0125adcefcc5d711b2))
* Add APIExecutor for calling arbitrary API endpoints ([#298](https://github.com/openfga/js-sdk/issues/298)) ([7e95579](https://github.com/openfga/js-sdk/commit/7e95579cd7c71b5df3a0263e65dd10a6219502aa))
* add example project ([3cf2ddb](https://github.com/openfga/js-sdk/commit/3cf2ddb90c6403e1846ca067b9cadb66b9aae16b))
* add example project ([#63](https://github.com/openfga/js-sdk/issues/63)) ([198b0f5](https://github.com/openfga/js-sdk/commit/198b0f5786dca633702eb826bcd303aed15a1ba8))
* add opentelemetry metrics reporting ([56197f3](https://github.com/openfga/js-sdk/commit/56197f3878db388e639d20c5554f8eda5937ee70)), closes [#108](https://github.com/openfga/js-sdk/issues/108)
* add opentelemetry metrics reporting ([#117](https://github.com/openfga/js-sdk/issues/117)) ([1a6bffb](https://github.com/openfga/js-sdk/commit/1a6bffbb1a69127edb1b638842b3dc24333493e5))
* add support for contextual tuples in Expand ([bfd4679](https://github.com/openfga/js-sdk/commit/bfd46795c9077a64b1b3684278cf4ed33388c459))
* add support for handling `Retry-After` header ([#267](https://github.com/openfga/js-sdk/issues/267)) ([351b3d0](https://github.com/openfga/js-sdk/commit/351b3d079fb3e49b6d6c0273949794a668822f69))
* add support for modular models metadata ([acd53b9](https://github.com/openfga/js-sdk/commit/acd53b9762ee21d02d77ffb9e275d4f8b1c4b1af))
* add support for StreamedListObjects ([#280](https://github.com/openfga/js-sdk/issues/280)) ([c639c5d](https://github.com/openfga/js-sdk/commit/c639c5dede4e7493c7ec9774c8c7a653f5e620cb))
* add support for write conflict settings ([#276](https://github.com/openfga/js-sdk/issues/276)) ([b365647](https://github.com/openfga/js-sdk/commit/b365647f3a42095b9a6aeb99be5f0a2412258dfe))
* **api:** allow passing in storeId as a param ([59329b3](https://github.com/openfga/js-sdk/commit/59329b358d1a482a28273adbc560e01fb06e9d93))
* enhancements to OpenTelemetry support ([721a44a](https://github.com/openfga/js-sdk/commit/721a44a6d2e2b373c2021d3f1075699298ff4348))
* enhancements to OpenTelemetry support ([#149](https://github.com/openfga/js-sdk/issues/149)) ([66ebf75](https://github.com/openfga/js-sdk/commit/66ebf75091ecdfa50143a68494f87d5fb5efcb36))
* List Stores Name Filter ([#265](https://github.com/openfga/js-sdk/issues/265)) ([a61ccf6](https://github.com/openfga/js-sdk/commit/a61ccf6b29ee8931b10af3f027ef44778f6e78b0))
* rename ModelObject to FgaObject ([1e4a4de](https://github.com/openfga/js-sdk/commit/1e4a4dee353ce41645423d6c3ae934f5729ca932))
* Report a per-http call metric ([#303](https://github.com/openfga/js-sdk/issues/303)) ([932d4ab](https://github.com/openfga/js-sdk/commit/932d4abaae241b47972a199a7922eade688b855f))
* support apiUrl configuration option ([847c6a4](https://github.com/openfga/js-sdk/commit/847c6a4120b6f5da0b9647558a5995ba8fd99388))
* support apiUrl configuration option ([#60](https://github.com/openfga/js-sdk/issues/60)) ([a4960c8](https://github.com/openfga/js-sdk/commit/a4960c804226bff551f513fe5bcb7fc0aa89e1d5))
* support client assertion for client credentials authentication ([#228](https://github.com/openfga/js-sdk/issues/228)) ([7303103](https://github.com/openfga/js-sdk/commit/73031036a52b054409e3168bf90733299a41a28b))
* support custom OIDC token endpoint URL ([#285](https://github.com/openfga/js-sdk/issues/285)) ([2903cf0](https://github.com/openfga/js-sdk/commit/2903cf04f00d05f6aea79f83a13ed7ceeb72658d))
* support for conditions ([39ad588](https://github.com/openfga/js-sdk/commit/39ad58843484961fb52a60ac2b8ab1341b7447f0))
* support for conditions ([#39](https://github.com/openfga/js-sdk/issues/39)) ([f651f8b](https://github.com/openfga/js-sdk/commit/f651f8b3e006e490abcf15c7c22cbcaf9e846993))
* support list users ([#97](https://github.com/openfga/js-sdk/issues/97)) ([9b4fe29](https://github.com/openfga/js-sdk/commit/9b4fe29723f5ad5e58382fb6be32cfcc9ca05458))
* support ListUsers ([45e5a64](https://github.com/openfga/js-sdk/commit/45e5a64ef1ea9e3861bd05a25bcf509f6c3cec10))
* support server-side batch check endpoiont ([#185](https://github.com/openfga/js-sdk/issues/185)) ([18c8f03](https://github.com/openfga/js-sdk/commit/18c8f03263d42a7d72cd789e74fab50862a4b024))
* support start_time parameter on read_changes ([f7494df](https://github.com/openfga/js-sdk/commit/f7494df2054de670c15d4154d52666f366bee907))
* support start_time parameter on read_changes ([#186](https://github.com/openfga/js-sdk/issues/186)) ([7a95727](https://github.com/openfga/js-sdk/commit/7a95727f32132b2baa49f0f5901d1af355f28022))
* support usage of the consistency option ([bacbd79](https://github.com/openfga/js-sdk/commit/bacbd793bbc872ce6b3b2880b35f4cd211fae568))
* support usage of the consistency option ([#129](https://github.com/openfga/js-sdk/issues/129)) ([ded34ef](https://github.com/openfga/js-sdk/commit/ded34eff5619413def3b876b7fd8eb8757b60b25))


### Fixed

* apply expiry buffer before reusing cached tokens ([#331](https://github.com/openfga/js-sdk/issues/331)) ([e3879c3](https://github.com/openfga/js-sdk/commit/e3879c38a655d90174efb7a4d17d7339806d4808))
* code coverage reporting ([21a5c26](https://github.com/openfga/js-sdk/commit/21a5c265c617b3f55a14cf866d72de32b6b0c759))
* code coverage reporting ([9a16a54](https://github.com/openfga/js-sdk/commit/9a16a54540ef1284b618a4630f04269ce4e378a7))
* Correctly set authorization model id when calling batch checks ([#372](https://github.com/openfga/js-sdk/issues/372)) ([bbc8bde](https://github.com/openfga/js-sdk/commit/bbc8bdec04475b7707542b09be4e31fa9666dd2f))
* **deps:** pin axios to 1.14.0 and fix brace-expansion audit vulnerability ([#363](https://github.com/openfga/js-sdk/issues/363)) ([1a1639f](https://github.com/openfga/js-sdk/commit/1a1639fe5d9f3615cf3066c7d9e6db81533f337c))
* **deps:** pin axios to 1.14.0 to avoid compromised 1.14.1 ([1a1639f](https://github.com/openfga/js-sdk/commit/1a1639fe5d9f3615cf3066c7d9e6db81533f337c))
* do not call read auth model on batch check/write calls ([c3d91ae](https://github.com/openfga/js-sdk/commit/c3d91aeca431f86dbc288db25879d8233630c3c0))
* error correctly if apiUrl is not provided ([1542c54](https://github.com/openfga/js-sdk/commit/1542c54de2ddbc8fd6736956274bd8cb64dc3baf))
* error correctly if apiUrl is not provided ([#161](https://github.com/openfga/js-sdk/issues/161)) ([ac1e4bb](https://github.com/openfga/js-sdk/commit/ac1e4bb3993caf20ae18ebc95988e9750bf6394f))
* honor explicit msg in FgaError constructor ([#325](https://github.com/openfga/js-sdk/issues/325)) ([5470381](https://github.com/openfga/js-sdk/commit/54703819952c2761d0f156d1387f4973a02691f8))
* improved config validation & token exchange error handling ([1c93cd7](https://github.com/openfga/js-sdk/commit/1c93cd785053d93243f6bbe62bafe4c7305aa314))
* list relations should throw when an underlying check errors ([7491a54](https://github.com/openfga/js-sdk/commit/7491a54ead382e22cd49a279fb2ea050e9076926))
* list relations should throw when an underlying check errors ([#32](https://github.com/openfga/js-sdk/issues/32)) ([9766218](https://github.com/openfga/js-sdk/commit/97662188a8f81381ec2e9dd0e40b6a013a26dd32))
* make body in readChanges optional ([ae4a696](https://github.com/openfga/js-sdk/commit/ae4a69618c8ca96f5f33031a6f890663444507b1))
* make body in readChanges optional ([#62](https://github.com/openfga/js-sdk/issues/62)) ([3997f23](https://github.com/openfga/js-sdk/commit/3997f233b992b5cfd8eb81818d664a7024c98483))
* make FgaApiAuthenticationError inherit from FgaApiError ([#327](https://github.com/openfga/js-sdk/issues/327)) ([10e5e54](https://github.com/openfga/js-sdk/commit/10e5e54fca8cadff41b776381dc02178c98ec8c3))
* **metrics:** add missing request model id attribute ([56aa225](https://github.com/openfga/js-sdk/commit/56aa2255cbaf941ff38c7d08b94f9897591d153b))
* **metrics:** add missing request model id attribute ([#122](https://github.com/openfga/js-sdk/issues/122)) ([7575bde](https://github.com/openfga/js-sdk/commit/7575bde1955d23312b7d3f6b402cbf694a425614))
* package.json & package-lock.json to reduce vulnerabilities ([bb84b66](https://github.com/openfga/js-sdk/commit/bb84b66a1d5028189c9d3ed3280361619c0b658c))
* prevent token refresh thundering herd ([#333](https://github.com/openfga/js-sdk/issues/333)) ([025346f](https://github.com/openfga/js-sdk/commit/025346ffe020fd31f3cdaf9f2d874bbcf01f3691))
* raw response in client check ([9ddda5e](https://github.com/openfga/js-sdk/commit/9ddda5e4dd3e91c5a7c79354ba3a3785645a9858))
* raw response in client check ([#31](https://github.com/openfga/js-sdk/issues/31)) ([ddf5f76](https://github.com/openfga/js-sdk/commit/ddf5f76b342c21af95366ccfa49df2eec1344a7d))
* resolve circular import ([1708f0e](https://github.com/openfga/js-sdk/commit/1708f0e1c59400f7b4012d2c8b4ab7a8e204f58d))
* resolve circular import ([#86](https://github.com/openfga/js-sdk/issues/86)) ([06c579e](https://github.com/openfga/js-sdk/commit/06c579eaeb7fd37cad2c15e397c73d6623342927))
* set keep-alive to true ([54e2ff0](https://github.com/openfga/js-sdk/commit/54e2ff032affe65351ecb205bc62a8a4b8e8e153))
* set keep-alive to true ([#30](https://github.com/openfga/js-sdk/issues/30)) ([12414f3](https://github.com/openfga/js-sdk/commit/12414f3eabc16306adde5e8fa7b61e82d6c2fe7c))
* set the consistency parameter correctly in OpenFGAClient ([a2cceeb](https://github.com/openfga/js-sdk/commit/a2cceeb2956dc8bc6c153ae6eda2efbf693a48c9))
* set the consistency parameter correctly in OpenFGAClient ([#143](https://github.com/openfga/js-sdk/issues/143)) ([9b56137](https://github.com/openfga/js-sdk/commit/9b5613761d0b98d986902f6a0256b80611b23fad))
* token expiry calculation  ([#27](https://github.com/openfga/js-sdk/issues/27)) ([3846609](https://github.com/openfga/js-sdk/commit/3846609762c510ff315eca5650e7f34869b2e5b2))
* update link to `SECURITY.md` ([b0e4f79](https://github.com/openfga/js-sdk/commit/b0e4f79aefca4209e96fbed00afb779a99c7fe22))
* update SDK contributing docs ([1296ee9](https://github.com/openfga/js-sdk/commit/1296ee92038097318943327b15c25e32e1d478c1))
* upgrade axios from 1.6.0 to 1.6.1 ([d217165](https://github.com/openfga/js-sdk/commit/d217165c4bf4aa4d2f968383f140fca61fe325e7))
* upgrade axios from 1.6.1 to 1.6.2 ([cf73e6d](https://github.com/openfga/js-sdk/commit/cf73e6d4edeab754c8b6f08991f8153c7b6a0892))
* use correct content type for token request ([7e1dcdd](https://github.com/openfga/js-sdk/commit/7e1dcdd8f872d74565fb15373b147f701ac57070))
* use correct content type for token request ([#65](https://github.com/openfga/js-sdk/issues/65)) ([8741983](https://github.com/openfga/js-sdk/commit/874198378b0b158124e98f891760c536e8f03a07))
* use current SDK version in telemetry meter ([#335](https://github.com/openfga/js-sdk/issues/335)) ([9e55466](https://github.com/openfga/js-sdk/commit/9e55466e98e33820b49b6215202a8a26efd071c9))
* use provided axios instance in credentials refresh ([691afea](https://github.com/openfga/js-sdk/commit/691afea3fa47ed8dd7a653707b1af1362d908dca))


### Changed

* check if node via process.versions ([#222](https://github.com/openfga/js-sdk/issues/222)) ([170cc2e](https://github.com/openfga/js-sdk/commit/170cc2e269b41dce8963add4f066757cf5dcc753)), closes [#219](https://github.com/openfga/js-sdk/issues/219)
* move telemetry code to separate file to remove circular dependency ([daf0206](https://github.com/openfga/js-sdk/commit/daf02065468be1b15331cbe9141bb7981c3437cf))
* remove unnecessary async functions ([03dd54a](https://github.com/openfga/js-sdk/commit/03dd54a24fd3d7b1da82550490c50b9c5e4cf1d2))
* remove usage of patch file for handling telemetry attributes ([1da00b5](https://github.com/openfga/js-sdk/commit/1da00b5379cfcdbe8f9c6fb0c6e5a7fecda0a27b))
* remove usage of patch file for handling telemetry attributes ([#172](https://github.com/openfga/js-sdk/issues/172)) ([97eac20](https://github.com/openfga/js-sdk/commit/97eac20acb2152a6444e9a2dae704f47f5d2186d))


### Documentation

* correct casing for contextual tuples ([5057ded](https://github.com/openfga/js-sdk/commit/5057ded41d9582a02fda31aaf603ad1ed7c758f0))
* correct casing for contextual tuples ([#94](https://github.com/openfga/js-sdk/issues/94)) ([35f7cec](https://github.com/openfga/js-sdk/commit/35f7cecb7a16ddc75d86adda006dd9d13925e55c))
* fix typo in batch check API docs link ([30b43b4](https://github.com/openfga/js-sdk/commit/30b43b4a72a6c9bd9dc52b4396e6553855fe655b))
* fix typo in batch check API docs link ([#198](https://github.com/openfga/js-sdk/issues/198)) ([7942fbc](https://github.com/openfga/js-sdk/commit/7942fbc4eab075df679c46faf057981d9eb7a2df))
* improve docstring ([f3db4d5](https://github.com/openfga/js-sdk/commit/f3db4d53c7de7b6678d7c79c71242b65c47399fe))
* include information about the opentelemetry data produced ([847c456](https://github.com/openfga/js-sdk/commit/847c456fbe20e5800ae53eee1867bb1f579b75ed))
* missing import in ClientCredentials example ([1c635ca](https://github.com/openfga/js-sdk/commit/1c635ca3c60914844971bb9be40db4db7076ba2a))
* parse raw stream ([#389](https://github.com/openfga/js-sdk/issues/389)) ([7331c56](https://github.com/openfga/js-sdk/commit/7331c56609bf40ed73cb4badc1f404720ea2634a))
* update read docstring ([3604a0f](https://github.com/openfga/js-sdk/commit/3604a0f6cbc9b00bb7ba646cba40ef27adaf4d26))
* Update README for batch check ([#197](https://github.com/openfga/js-sdk/issues/197)) ([bb8b469](https://github.com/openfga/js-sdk/commit/bb8b4694c76da15de405f24947629a1a8922e897))
* update README for server batch check ([41a7c49](https://github.com/openfga/js-sdk/commit/41a7c4939eb7cf61638b6d60287c6a88ce4f300f))


### Miscellaneous

* release 0.9.6 ([7426f8d](https://github.com/openfga/js-sdk/commit/7426f8d7212153f716926c8afe3488298329b037))
* remove excluded users from ListUsers response ([cc4e4b4](https://github.com/openfga/js-sdk/commit/cc4e4b409b59d1d177fb75dc41882f41c6d6af74))
* remove excluded users from ListUsers response ([#112](https://github.com/openfga/js-sdk/issues/112)) ([2c78c5d](https://github.com/openfga/js-sdk/commit/2c78c5d8af8b1599c7069943e4f24dc451a3f073))

## [0.9.5](https://github.com/openfga/js-sdk/compare/v0.9.4...v0.9.5) (2026-04-10)


### Fixed

* Correctly set authorization model id when calling batch checks ([#372](https://github.com/openfga/js-sdk/issues/372)) ([bbc8bde](https://github.com/openfga/js-sdk/commit/bbc8bdec04475b7707542b09be4e31fa9666dd2f))

## v0.9.4

### [v0.9.4](https://github.com/openfga/js-sdk/compare/v0.9.3...v0.9.4) (2026-03-31)

- fix(deps): pin axios to 1.14.0 and fix brace-expansion audit vulnerability (#363) - [details](https://socket.dev/blog/axios-npm-package-compromised)

## v0.9.3

### [v0.9.3](https://github.com/openfga/js-sdk/compare/v0.9.2...v0.9.3) (2026-02-27)

- feat: add `executeApiRequest` and `executeStreamedApiRequest` methods to `OpenFgaClient` for calling arbitrary API endpoints with full SDK support (authentication, retries, telemetry, error handling). See [documentation](https://github.com/openfga/js-sdk#calling-other-endpoints) for more. (#298, #345) - thanks @Abishek-Newar!
- fix: use current SDK version in telemetry meter (#335)
- fix: disable httprequestduration metric by default to avoid high cardinality (#344)
- fix: apply expiry buffer before reusing cached tokens (#331)
- chore!: drop support for Node.js v16 & 18. We recommend updating to a node-runtime that is [supported upstream](https://nodejs.org/en/about/previous-releases) - currently 20 (maintenance), 22 (maintenance), 24 (LTS) and 25 (current).
  The minimum supported version of Node.js is now v20. This is in line with our [stated supported environments](./SUPPORTED_RUNTIMES.md)

## v0.9.2

### [v0.9.2](https://github.com/openfga/js-sdk/compare/v0.9.1...v0.9.2) (2026-02-10)

- feat: add support for [streamedListObjects](https://openfga.dev/api/service#/Relationship%20Queries/StreamedListObjects). See [documentation](https://github.com/openfga/js-sdk#streamed-list-objects)
- chore: remove node url dependency blocking browser usage (#300)
- feat: Report a per-http call metric (#303)

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
