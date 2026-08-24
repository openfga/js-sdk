"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nock_1 = __importDefault(require("nock"));
const node_stream_1 = require("node:stream");
const node_test_1 = require("node:test");
const index_1 = require("../index");
const helpers_1 = require("./helpers");
const expect_1 = require("./helpers/expect");
const nocks = (0, helpers_1.getNocks)(nock_1.default);
(0, node_test_1.afterEach)(() => {
    node_test_1.mock.restoreAll();
});
(0, node_test_1.describe)("OpenFGA Client", () => {
    (0, node_test_1.describe)("Using the OpenFGA Client", () => {
        let fgaClient;
        (0, node_test_1.before)(() => {
            fgaClient = new index_1.OpenFgaClient({ ...helpers_1.baseConfig, credentials: { method: index_1.CredentialsMethod.None } });
        });
        (0, node_test_1.describe)("Configuration", () => {
            (0, node_test_1.it)("should throw an error if the storeId is not in a valid format", async () => {
                (0, expect_1.expect)(() => new index_1.OpenFgaClient({ ...helpers_1.baseConfig, storeId: "abcsa" })).toThrow(index_1.FgaValidationError);
            });
            (0, node_test_1.it)("should require storeId when calling endpoints that require it", () => {
                const fgaClient = new index_1.OpenFgaClient({ ...helpers_1.baseConfig, storeId: undefined, credentials: undefined });
                (0, expect_1.expect)(fgaClient.readAuthorizationModels()).rejects.toThrow();
            });
            (0, node_test_1.it)("should accept the store and model IDs on initialization", async () => {
                const fgaClient = new index_1.OpenFgaClient({
                    apiUrl: helpers_1.defaultConfiguration.apiUrl,
                    storeId: helpers_1.defaultConfiguration.storeId,
                    authorizationModelId: helpers_1.defaultConfiguration.authorizationModelId,
                });
                (0, expect_1.expect)(fgaClient.storeId).toBe(helpers_1.defaultConfiguration.storeId);
                (0, expect_1.expect)(fgaClient.authorizationModelId).toBe(helpers_1.defaultConfiguration.authorizationModelId);
            });
            (0, node_test_1.it)("should allow updating the storeId after initialization", async () => {
                const fgaClient = new index_1.OpenFgaClient({
                    apiUrl: helpers_1.defaultConfiguration.apiUrl
                });
                (0, expect_1.expect)(fgaClient.storeId).toBe(undefined);
                fgaClient.storeId = helpers_1.defaultConfiguration.storeId;
                (0, expect_1.expect)(fgaClient.storeId).toBe(helpers_1.defaultConfiguration.storeId);
            });
            (0, node_test_1.it)("should allow updating the authorizationModelId after initialization", async () => {
                const fgaClient = new index_1.OpenFgaClient({
                    apiUrl: helpers_1.defaultConfiguration.apiUrl,
                    storeId: helpers_1.defaultConfiguration.storeId,
                });
                (0, expect_1.expect)(fgaClient.authorizationModelId).toBe(undefined);
                fgaClient.authorizationModelId = helpers_1.defaultConfiguration.authorizationModelId;
                (0, expect_1.expect)(fgaClient.authorizationModelId).toBe(helpers_1.defaultConfiguration.authorizationModelId);
            });
        });
        /* Stores */
        (0, node_test_1.describe)("ListStores", () => {
            (0, node_test_1.it)("should properly call the ListStores API", async () => {
                const store = { id: "some-id", name: "some-name" };
                nocks.listStores(helpers_1.defaultConfiguration.getBasePath(), {
                    continuation_token: "",
                    stores: [{
                            ...store,
                            created_at: "2023-11-02T15:27:47.951Z",
                            updated_at: "2023-11-02T15:27:47.951Z",
                            deleted_at: "2023-11-02T15:27:47.951Z",
                        }],
                });
                const response = await fgaClient.listStores();
                (0, expect_1.expect)(response.stores).toHaveLength(1);
                (0, expect_1.expect)(response.stores?.[0]).toMatchObject(store);
            });
            (0, node_test_1.it)("should properly call the ListStores API with name filter", async () => {
                const store = { id: "some-id", name: "test-store" };
                nocks.listStores(helpers_1.defaultConfiguration.getBasePath(), {
                    continuation_token: "",
                    stores: [{
                            ...store,
                            created_at: "2023-11-02T15:27:47.951Z",
                            updated_at: "2023-11-02T15:27:47.951Z",
                            deleted_at: "2023-11-02T15:27:47.951Z",
                        }],
                }, 200, { name: "test-store" });
                const response = await fgaClient.listStores({ name: "test-store" });
                (0, expect_1.expect)(response.stores).toHaveLength(1);
                (0, expect_1.expect)(response.stores?.[0]).toMatchObject(store);
            });
        });
        (0, node_test_1.describe)("CreateStore", () => {
            (0, node_test_1.it)("should create a store", async () => {
                const store = { id: "some-id", name: "some-name" };
                nocks.createStore(helpers_1.defaultConfiguration.getBasePath(), {
                    ...store,
                    created_at: "2023-11-02T15:27:47.951Z",
                    updated_at: "2023-11-02T15:27:47.951Z",
                });
                const response = await fgaClient.createStore(store);
                (0, expect_1.expect)(response).toMatchObject(store);
            });
        });
        (0, node_test_1.describe)("GetStore", () => {
            (0, node_test_1.it)("should properly call the GetStore API", async () => {
                const store = { id: helpers_1.defaultConfiguration.storeId, name: "some-name" };
                nocks.getStore(store.id, helpers_1.defaultConfiguration.getBasePath(), {
                    ...store,
                    created_at: "2023-11-02T15:27:47.951Z",
                    updated_at: "2023-11-02T15:27:47.951Z",
                });
                const response = await fgaClient.getStore();
                (0, expect_1.expect)(response).toMatchObject(store);
            });
            (0, node_test_1.it)("should allow overriding the store ID", async () => {
                const overriddenStoreId = "01HWD53SDGYRXHBXTYA10PF6T4";
                const store = { id: overriddenStoreId, name: "some-name" };
                nocks.getStore(store.id, helpers_1.defaultConfiguration.getBasePath(), {
                    ...store,
                    created_at: "2023-11-02T15:27:47.951Z",
                    updated_at: "2023-11-02T15:27:47.951Z",
                });
                const response = await fgaClient.getStore({ storeId: overriddenStoreId });
                (0, expect_1.expect)(response).toMatchObject(store);
            });
        });
        (0, node_test_1.describe)("DeleteStore", () => {
            (0, node_test_1.it)("should properly call the DeleteStore API", async () => {
                nocks.deleteStore(helpers_1.defaultConfiguration.storeId);
                await fgaClient.deleteStore();
            });
        });
        /* Authorization Models */
        (0, node_test_1.describe)("ReadAuthorizationModels", () => {
            (0, node_test_1.it)("should properly call the ReadAuthorizationModels API", async () => {
                nocks.readAuthorizationModels(helpers_1.defaultConfiguration.storeId);
                const data = await fgaClient.readAuthorizationModels();
                (0, expect_1.expect)(data).toMatchObject({
                    authorization_models: expect_1.expect.arrayContaining([]),
                });
            });
        });
        (0, node_test_1.describe)("WriteAuthorizationModel", () => {
            (0, node_test_1.it)("should properly call the WriteAuthorizationModel API", async () => {
                const authorizationModel = {
                    schema_version: "1.1",
                    type_definitions: [
                        { type: "workspace", relations: { admin: { this: {} } } },
                    ],
                };
                nocks.writeAuthorizationModel(helpers_1.baseConfig.storeId, authorizationModel);
                const data = await fgaClient.writeAuthorizationModel(authorizationModel);
                (0, expect_1.expect)(data).toMatchObject({ id: expect_1.expect.any(String) });
            });
        });
        (0, node_test_1.describe)("ReadAuthorizationModel", () => {
            (0, node_test_1.it)("should properly call the ReadAuthorizationModel API", async () => {
                const modelId = "01H0THVNGCSAZ6SAQVTHPH3F0Q";
                nocks.readSingleAuthzModel(helpers_1.defaultConfiguration.storeId, modelId);
                const data = await fgaClient.readAuthorizationModel({ authorizationModelId: modelId });
                (0, expect_1.expect)(data).toMatchObject({
                    authorization_model: {
                        id: expect_1.expect.any(String),
                        schema_version: "1.1",
                        type_definitions: expect_1.expect.arrayContaining([]),
                    },
                });
            });
        });
        (0, node_test_1.describe)("ReadLatestAuthorizationModel", () => {
            (0, node_test_1.it)("should properly call the ReadLatestAuthorizationModel API", async () => {
                const modelId = "01H0THVNGCSAZ6SAQVTHPH3F0Q";
                (0, nock_1.default)(helpers_1.defaultConfiguration.getBasePath())
                    .get(`/stores/${helpers_1.defaultConfiguration.storeId}/authorization-models`)
                    .query({ page_size: 1 })
                    .reply(200, {
                    authorization_models: [{ id: modelId, schema_version: "1.1", type_definitions: [] }],
                });
                const data = await fgaClient.readLatestAuthorizationModel();
                (0, expect_1.expect)(data).toMatchObject({
                    authorization_model: {
                        id: expect_1.expect.any(String),
                        schema_version: "1.1",
                        type_definitions: expect_1.expect.arrayContaining([]),
                    },
                });
            });
        });
        /* Relationship Tuples */
        (0, node_test_1.describe)("ReadChanges", () => {
            (0, node_test_1.it)("should properly call the ReadChanges API", async () => {
                const type = "repo";
                const pageSize = 25;
                const startTime = "2022-01-01T00:00:00Z";
                const continuationToken = "eyJwayI6IkxBVEVTVF9OU0NPTkZJR19hdXRoMHN0b3JlIiwic2siOiIxem1qbXF3MWZLZExTcUoyN01MdTdqTjh0cWgifQ==";
                nocks.readChanges(helpers_1.baseConfig.storeId, type, pageSize, continuationToken, startTime);
                const response = await fgaClient.readChanges({ type, startTime }, { pageSize, continuationToken });
                (0, expect_1.expect)(response).toMatchObject({ changes: expect_1.expect.arrayContaining([]) });
            });
            (0, node_test_1.it)("should properly call the ReadChanges API with no type", async () => {
                const pageSize = 25;
                const continuationToken = "eyJwayI6IkxBVEVTVF9OU0NPTkZJR19hdXRoMHN0b3JlIiwic2siOiIxem1qbXF3MWZLZExTcUoyN01MdTdqTjh0cWgifQ==";
                const startTime = "2022-01-01T00:00:00Z";
                nocks.readChanges(helpers_1.baseConfig.storeId, "", pageSize, continuationToken, "");
                const response = await fgaClient.readChanges(undefined, { pageSize, continuationToken });
                (0, expect_1.expect)(response).toMatchObject({ changes: expect_1.expect.arrayContaining([]) });
            });
        });
        (0, node_test_1.describe)("Read", () => {
            (0, node_test_1.it)("should properly call the Read API", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                nocks.read(helpers_1.baseConfig.storeId, tuple, undefined, index_1.ConsistencyPreference.HigherConsistency);
                const data = await fgaClient.read(tuple, { consistency: index_1.ConsistencyPreference.HigherConsistency });
                (0, expect_1.expect)(data).toMatchObject({});
            });
        });
        (0, node_test_1.describe)("Write", () => {
            (0, node_test_1.it)("should properly call the Write API", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                nocks.write(helpers_1.baseConfig.storeId);
                const data = await fgaClient.write({
                    writes: [tuple],
                }, {
                    authorizationModelId: "01GXSA8YR785C4FYS3C0RTG7B1",
                });
                (0, expect_1.expect)(data).toMatchObject({});
            });
            (0, node_test_1.it)("should properly chunk the calls when called in non-transaction mode", async () => {
                const tuples = [{
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:1",
                    }, {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:2",
                    }];
                const scope0 = nocks.write(helpers_1.baseConfig.storeId).matchHeader("X-OpenFGA-Client-Method", "Write");
                const scope1 = nocks.write(helpers_1.baseConfig.storeId).matchHeader("X-OpenFGA-Client-Method", "Write");
                const scope2 = nocks.write(helpers_1.baseConfig.storeId).matchHeader("X-OpenFGA-Client-Method", "Write");
                const modelId = "01GXSA8YR785C4FYS3C0RTG7B1";
                const scope3 = nocks.readSingleAuthzModel(helpers_1.defaultConfiguration.storeId, modelId);
                (0, expect_1.expect)(scope0.isDone()).toBe(false);
                (0, expect_1.expect)(scope1.isDone()).toBe(false);
                (0, expect_1.expect)(scope2.isDone()).toBe(false);
                const data = await fgaClient.write({
                    writes: tuples,
                }, {
                    authorizationModelId: modelId,
                    transaction: { disable: true },
                });
                (0, expect_1.expect)(scope0.isDone()).toBe(true);
                (0, expect_1.expect)(scope1.isDone()).toBe(true);
                (0, expect_1.expect)(scope2.isDone()).toBe(false);
                (0, expect_1.expect)(scope3.isDone()).toBe(false);
                (0, expect_1.expect)(data).toMatchObject({});
                // NOTE: manually clean pending mocks as we assert on _not_ being matched above.
                nock_1.default.cleanAll();
            });
            (0, node_test_1.it)("should not fail the request on errors in non-transaction mode", async () => {
                const tuples = [{
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:1",
                    }, {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:2",
                    }, {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "reader",
                        object: "workspace:3",
                    }];
                const scope0 = nocks.write(helpers_1.baseConfig.storeId).matchHeader("X-OpenFGA-Client-Method", "Write");
                const scope1 = nocks.write(helpers_1.baseConfig.storeId).matchHeader("X-OpenFGA-Client-Method", "Write");
                const scope2 = nocks.write(helpers_1.baseConfig.storeId, helpers_1.defaultConfiguration.getBasePath(), {
                    "code": "validation_error",
                    "message": "relation &#39;workspace#reader&#39; not found"
                }, 400).matchHeader("X-OpenFGA-Client-Method", "Write");
                const modelId = "01GXSA8YR785C4FYS3C0RTG7B1";
                const scope3 = nocks.readSingleAuthzModel(helpers_1.defaultConfiguration.storeId, modelId);
                (0, expect_1.expect)(scope0.isDone()).toBe(false);
                (0, expect_1.expect)(scope1.isDone()).toBe(false);
                (0, expect_1.expect)(scope2.isDone()).toBe(false);
                const data = await fgaClient.write({
                    writes: tuples,
                }, {
                    authorizationModelId: modelId,
                    transaction: { disable: true },
                });
                (0, expect_1.expect)(scope0.isDone()).toBe(true);
                (0, expect_1.expect)(scope1.isDone()).toBe(true);
                (0, expect_1.expect)(scope2.isDone()).toBe(true);
                (0, expect_1.expect)(scope3.isDone()).toBe(false);
                (0, expect_1.expect)(data.writes.length).toBe(3);
                (0, expect_1.expect)(data.deletes.length).toBe(0);
                (0, expect_1.expect)(data.writes.find(tuple => tuple.tuple_key.object === tuples[0].object)?.status).toBe(index_1.ClientWriteStatus.SUCCESS);
                (0, expect_1.expect)(data.writes.find(tuple => tuple.tuple_key.object === tuples[1].object)?.status).toBe(index_1.ClientWriteStatus.SUCCESS);
                (0, expect_1.expect)(data.writes.find(tuple => tuple.tuple_key.object === tuples[2].object)?.status).toBe(index_1.ClientWriteStatus.FAILURE);
                // NOTE: manually clean pending mocks as we assert on _not_ being matched above.
                nock_1.default.cleanAll();
            });
            (0, node_test_1.it)("should throw an error if auth fails in not transaction mode", async () => {
                const authModelId = "01GXSA8YR785C4FYS3C0RTG7B1";
                const tuples = [{
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:1",
                    }];
                const scope0 = nocks.write(helpers_1.baseConfig.storeId, helpers_1.defaultConfiguration.getBasePath(), {}, 401).matchHeader("X-OpenFGA-Client-Method", "Write");
                const scope1 = (0, nock_1.default)(helpers_1.defaultConfiguration.getBasePath())
                    .get(`/stores/${helpers_1.baseConfig.storeId}/authorization-models/${authModelId}`)
                    .reply(401, {});
                try {
                    const tuples = [{
                            user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                            relation: "admin",
                            object: "workspace:1",
                        }];
                    await fgaClient.write({
                        writes: tuples,
                    }, {
                        authorizationModelId: authModelId,
                        transaction: { disable: true },
                    });
                }
                catch (err) {
                    (0, expect_1.expect)(err).toBeInstanceOf(index_1.FgaApiAuthenticationError);
                }
                finally {
                    (0, expect_1.expect)(scope0.isDone()).toBe(true);
                    (0, expect_1.expect)(scope1.isDone()).toBe(false);
                }
                // NOTE: manually clean pending mocks as we assert on _not_ being matched above.
                nock_1.default.cleanAll();
            });
            (0, node_test_1.it)("should properly call the Write API when providing one empty array", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                nocks.write(helpers_1.baseConfig.storeId);
                const data = await fgaClient.write({
                    writes: [tuple],
                    deletes: []
                }, {
                    authorizationModelId: "01GXSA8YR785C4FYS3C0RTG7B1",
                });
                (0, expect_1.expect)(data.writes.length).toBe(1);
                (0, expect_1.expect)(data.deletes.length).toBe(0);
            });
            (0, node_test_1.describe)("with conflict options", () => {
                (0, node_test_1.it)("should pass onDuplicateWrites Ignore option to API", async () => {
                    const tuple = {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:1",
                    };
                    const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                    await fgaClient.write({
                        writes: [tuple],
                    }, {
                        conflict: {
                            onDuplicateWrites: index_1.ClientWriteRequestOnDuplicateWrites.Ignore,
                        }
                    });
                    (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                        writes: {
                            tuple_keys: [tuple],
                            on_duplicate: "ignore",
                        },
                    }), expect_1.expect.any(Object));
                    mockWrite.mock.restore();
                });
                (0, node_test_1.it)("should pass onDuplicateWrites Error option to API", async () => {
                    const tuple = {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:1",
                    };
                    const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                    await fgaClient.write({
                        writes: [tuple],
                    }, {
                        conflict: {
                            onDuplicateWrites: index_1.ClientWriteRequestOnDuplicateWrites.Error,
                        }
                    });
                    (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                        writes: {
                            tuple_keys: [tuple],
                            on_duplicate: "error",
                        },
                    }), expect_1.expect.any(Object));
                    mockWrite.mock.restore();
                });
                (0, node_test_1.it)("should pass onMissingDeletes Ignore option to API", async () => {
                    const tuple = {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:1",
                    };
                    const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                    await fgaClient.write({
                        deletes: [tuple],
                    }, {
                        conflict: {
                            onMissingDeletes: index_1.ClientWriteRequestOnMissingDeletes.Ignore,
                        }
                    });
                    (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                        deletes: {
                            tuple_keys: [tuple],
                            on_missing: "ignore",
                        },
                    }), expect_1.expect.any(Object));
                    mockWrite.mock.restore();
                });
                (0, node_test_1.it)("should pass onMissingDeletes Error option to API", async () => {
                    const tuple = {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:1",
                    };
                    const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                    await fgaClient.write({
                        deletes: [tuple],
                    }, {
                        conflict: {
                            onMissingDeletes: index_1.ClientWriteRequestOnMissingDeletes.Error,
                        }
                    });
                    (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                        deletes: {
                            tuple_keys: [tuple],
                            on_missing: "error",
                        },
                    }), expect_1.expect.any(Object));
                    mockWrite.mock.restore();
                });
                (0, node_test_1.it)("should pass both conflict options to API", async () => {
                    const writeTuple = {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:1",
                    };
                    const deleteTuple = {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:2",
                    };
                    const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                    await fgaClient.write({
                        writes: [writeTuple],
                        deletes: [deleteTuple],
                    }, {
                        conflict: {
                            onDuplicateWrites: index_1.ClientWriteRequestOnDuplicateWrites.Ignore,
                            onMissingDeletes: index_1.ClientWriteRequestOnMissingDeletes.Error,
                        }
                    });
                    (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                        writes: {
                            tuple_keys: [writeTuple],
                            on_duplicate: "ignore",
                        },
                        deletes: {
                            tuple_keys: [deleteTuple],
                            on_missing: "error",
                        },
                    }), expect_1.expect.any(Object));
                    mockWrite.mock.restore();
                });
                (0, node_test_1.it)("should default to error conflict handling when conflict options are not specified", async () => {
                    const writeTuple = {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:1",
                    };
                    const deleteTuple = {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:2",
                    };
                    const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                    await fgaClient.write({
                        writes: [writeTuple],
                        deletes: [deleteTuple],
                    });
                    (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                        writes: {
                            tuple_keys: [writeTuple],
                            on_duplicate: "error",
                        },
                        deletes: {
                            tuple_keys: [deleteTuple],
                            on_missing: "error",
                        },
                    }), expect_1.expect.any(Object));
                    mockWrite.mock.restore();
                });
                (0, node_test_1.describe)("matrix tests for writes only", () => {
                    const writeTuple = {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:1",
                    };
                    (0, node_test_1.it)("should handle writes only with onDuplicateWrites Error", async () => {
                        const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                        await fgaClient.write({
                            writes: [writeTuple],
                        }, {
                            conflict: {
                                onDuplicateWrites: index_1.ClientWriteRequestOnDuplicateWrites.Error,
                            }
                        });
                        (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                            writes: {
                                tuple_keys: [writeTuple],
                                on_duplicate: "error",
                            },
                        }), expect_1.expect.any(Object));
                        mockWrite.mock.restore();
                    });
                    (0, node_test_1.it)("should handle writes only with onDuplicateWrites Ignore", async () => {
                        const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                        await fgaClient.write({
                            writes: [writeTuple],
                        }, {
                            conflict: {
                                onDuplicateWrites: index_1.ClientWriteRequestOnDuplicateWrites.Ignore,
                            }
                        });
                        (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                            writes: {
                                tuple_keys: [writeTuple],
                                on_duplicate: "ignore",
                            },
                        }), expect_1.expect.any(Object));
                        mockWrite.mock.restore();
                    });
                });
                (0, node_test_1.describe)("matrix tests for deletes only", () => {
                    const deleteTuple = {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:2",
                    };
                    (0, node_test_1.it)("should handle deletes only with onMissingDeletes Error", async () => {
                        const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                        await fgaClient.write({
                            deletes: [deleteTuple],
                        }, {
                            conflict: {
                                onMissingDeletes: index_1.ClientWriteRequestOnMissingDeletes.Error,
                            }
                        });
                        (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                            deletes: {
                                tuple_keys: [deleteTuple],
                                on_missing: "error",
                            },
                        }), expect_1.expect.any(Object));
                        mockWrite.mock.restore();
                    });
                    (0, node_test_1.it)("should handle deletes only with onMissingDeletes Ignore", async () => {
                        const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                        await fgaClient.write({
                            deletes: [deleteTuple],
                        }, {
                            conflict: {
                                onMissingDeletes: index_1.ClientWriteRequestOnMissingDeletes.Ignore,
                            }
                        });
                        (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                            deletes: {
                                tuple_keys: [deleteTuple],
                                on_missing: "ignore",
                            },
                        }), expect_1.expect.any(Object));
                        mockWrite.mock.restore();
                    });
                });
                (0, node_test_1.describe)("matrix tests for mixed writes and deletes", () => {
                    const writeTuple = {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:1",
                    };
                    const deleteTuple = {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:2",
                    };
                    (0, node_test_1.it)("should handle mixed writes and deletes with (Ignore, Ignore)", async () => {
                        const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                        await fgaClient.write({
                            writes: [writeTuple],
                            deletes: [deleteTuple],
                        }, {
                            conflict: {
                                onDuplicateWrites: index_1.ClientWriteRequestOnDuplicateWrites.Ignore,
                                onMissingDeletes: index_1.ClientWriteRequestOnMissingDeletes.Ignore,
                            }
                        });
                        (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                            writes: {
                                tuple_keys: [writeTuple],
                                on_duplicate: "ignore",
                            },
                            deletes: {
                                tuple_keys: [deleteTuple],
                                on_missing: "ignore",
                            },
                        }), expect_1.expect.any(Object));
                        mockWrite.mock.restore();
                    });
                    (0, node_test_1.it)("should handle mixed writes and deletes with (Ignore, Error)", async () => {
                        const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                        await fgaClient.write({
                            writes: [writeTuple],
                            deletes: [deleteTuple],
                        }, {
                            conflict: {
                                onDuplicateWrites: index_1.ClientWriteRequestOnDuplicateWrites.Ignore,
                                onMissingDeletes: index_1.ClientWriteRequestOnMissingDeletes.Error,
                            }
                        });
                        (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                            writes: {
                                tuple_keys: [writeTuple],
                                on_duplicate: "ignore",
                            },
                            deletes: {
                                tuple_keys: [deleteTuple],
                                on_missing: "error",
                            },
                        }), expect_1.expect.any(Object));
                        mockWrite.mock.restore();
                    });
                    (0, node_test_1.it)("should handle mixed writes and deletes with (Error, Ignore)", async () => {
                        const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                        await fgaClient.write({
                            writes: [writeTuple],
                            deletes: [deleteTuple],
                        }, {
                            conflict: {
                                onDuplicateWrites: index_1.ClientWriteRequestOnDuplicateWrites.Error,
                                onMissingDeletes: index_1.ClientWriteRequestOnMissingDeletes.Ignore,
                            }
                        });
                        (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                            writes: {
                                tuple_keys: [writeTuple],
                                on_duplicate: "error",
                            },
                            deletes: {
                                tuple_keys: [deleteTuple],
                                on_missing: "ignore",
                            },
                        }), expect_1.expect.any(Object));
                        mockWrite.mock.restore();
                    });
                    (0, node_test_1.it)("should handle mixed writes and deletes with (Error, Error)", async () => {
                        const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                        await fgaClient.write({
                            writes: [writeTuple],
                            deletes: [deleteTuple],
                        }, {
                            conflict: {
                                onDuplicateWrites: index_1.ClientWriteRequestOnDuplicateWrites.Error,
                                onMissingDeletes: index_1.ClientWriteRequestOnMissingDeletes.Error,
                            }
                        });
                        (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                            writes: {
                                tuple_keys: [writeTuple],
                                on_duplicate: "error",
                            },
                            deletes: {
                                tuple_keys: [deleteTuple],
                                on_missing: "error",
                            },
                        }), expect_1.expect.any(Object));
                        mockWrite.mock.restore();
                    });
                });
                (0, node_test_1.describe)("with transaction.disable and conflict options", () => {
                    (0, node_test_1.it)("should pass conflict options when transaction is disabled for writes", async () => {
                        const tuple = {
                            user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                            relation: "admin",
                            object: "workspace:1",
                        };
                        const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                        await fgaClient.write({
                            writes: [tuple],
                        }, {
                            transaction: { disable: true },
                            conflict: {
                                onDuplicateWrites: index_1.ClientWriteRequestOnDuplicateWrites.Ignore,
                            }
                        });
                        (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                            writes: {
                                tuple_keys: [tuple],
                                on_duplicate: "ignore",
                            },
                        }), expect_1.expect.any(Object));
                        mockWrite.mock.restore();
                    });
                    (0, node_test_1.it)("should pass conflict options when transaction is disabled for deletes", async () => {
                        const tuple = {
                            user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                            relation: "admin",
                            object: "workspace:1",
                        };
                        const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                        await fgaClient.write({
                            deletes: [tuple],
                        }, {
                            transaction: { disable: true },
                            conflict: {
                                onMissingDeletes: index_1.ClientWriteRequestOnMissingDeletes.Ignore,
                            }
                        });
                        (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                            deletes: {
                                tuple_keys: [tuple],
                                on_missing: "ignore",
                            },
                        }), expect_1.expect.any(Object));
                        mockWrite.mock.restore();
                    });
                    (0, node_test_1.it)("should pass both conflict options when transaction is disabled with mixed writes and deletes", async () => {
                        const writeTuple = {
                            user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                            relation: "admin",
                            object: "workspace:1",
                        };
                        const deleteTuple = {
                            user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                            relation: "admin",
                            object: "workspace:2",
                        };
                        const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                        await fgaClient.write({
                            writes: [writeTuple],
                            deletes: [deleteTuple],
                        }, {
                            transaction: { disable: true },
                            conflict: {
                                onDuplicateWrites: index_1.ClientWriteRequestOnDuplicateWrites.Ignore,
                                onMissingDeletes: index_1.ClientWriteRequestOnMissingDeletes.Error,
                            }
                        });
                        (0, expect_1.expect)(mockWrite).toHaveBeenCalledTimes(2);
                        (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                            writes: {
                                tuple_keys: [writeTuple],
                                on_duplicate: "ignore",
                            },
                        }), expect_1.expect.any(Object));
                        (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                            deletes: {
                                tuple_keys: [deleteTuple],
                                on_missing: "error",
                            },
                        }), expect_1.expect.any(Object));
                        mockWrite.mock.restore();
                    });
                    (0, node_test_1.it)("should handle multiple chunks with conflict options in non-transaction mode", async () => {
                        const tuples = [
                            {
                                user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                                relation: "admin",
                                object: "workspace:1",
                            },
                            {
                                user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                                relation: "admin",
                                object: "workspace:2",
                            }
                        ];
                        const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                        await fgaClient.write({
                            writes: tuples,
                        }, {
                            transaction: {
                                disable: true,
                                maxPerChunk: 1, // Force 2 separate calls
                            },
                            conflict: {
                                onDuplicateWrites: index_1.ClientWriteRequestOnDuplicateWrites.Ignore,
                            }
                        });
                        (0, expect_1.expect)(mockWrite).toHaveBeenCalledTimes(2);
                        (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                            writes: expect_1.expect.objectContaining({
                                on_duplicate: "ignore",
                            }),
                        }), expect_1.expect.any(Object));
                        mockWrite.mock.restore();
                    });
                });
            });
        });
        (0, node_test_1.describe)("WriteTuples", () => {
            (0, node_test_1.it)("should properly call the Write API", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                nocks.write(helpers_1.baseConfig.storeId);
                const data = await fgaClient.writeTuples([tuple], {
                    authorizationModelId: "01GXSA8YR785C4FYS3C0RTG7B1",
                });
                (0, expect_1.expect)(data).toMatchObject({});
            });
            (0, node_test_1.it)("should pass onDuplicateWrites Ignore option to write method", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                await fgaClient.writeTuples([tuple], {
                    conflict: {
                        onDuplicateWrites: index_1.ClientWriteRequestOnDuplicateWrites.Ignore,
                    }
                });
                (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                    writes: {
                        tuple_keys: [tuple],
                        on_duplicate: "ignore",
                    },
                }), expect_1.expect.any(Object));
                mockWrite.mock.restore();
            });
            (0, node_test_1.it)("should pass onDuplicateWrites Error option to write method", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                await fgaClient.writeTuples([tuple], {
                    conflict: {
                        onDuplicateWrites: index_1.ClientWriteRequestOnDuplicateWrites.Error,
                    }
                });
                (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                    writes: {
                        tuple_keys: [tuple],
                        on_duplicate: "error",
                    },
                }), expect_1.expect.any(Object));
                mockWrite.mock.restore();
            });
            (0, node_test_1.it)("should default to error conflict handling when onDuplicateWrites option is not specified", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                await fgaClient.writeTuples([tuple]);
                (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                    writes: {
                        tuple_keys: [tuple],
                        on_duplicate: "error",
                    },
                }), expect_1.expect.any(Object));
                mockWrite.mock.restore();
            });
        });
        (0, node_test_1.describe)("DeleteTuples", () => {
            (0, node_test_1.it)("should properly call the Write API", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                nocks.write(helpers_1.baseConfig.storeId);
                const data = await fgaClient.deleteTuples([tuple], {
                    authorizationModelId: "01GXSA8YR785C4FYS3C0RTG7B1",
                });
                (0, expect_1.expect)(data).toMatchObject({});
            });
            (0, node_test_1.it)("should pass onMissingDeletes Ignore option to write method", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                await fgaClient.deleteTuples([tuple], {
                    conflict: {
                        onMissingDeletes: index_1.ClientWriteRequestOnMissingDeletes.Ignore,
                    }
                });
                (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                    deletes: {
                        tuple_keys: [tuple],
                        on_missing: "ignore",
                    },
                }), expect_1.expect.any(Object));
                mockWrite.mock.restore();
            });
            (0, node_test_1.it)("should pass onMissingDeletes Error option to write method", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                await fgaClient.deleteTuples([tuple], {
                    conflict: {
                        onMissingDeletes: index_1.ClientWriteRequestOnMissingDeletes.Error,
                    }
                });
                (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                    deletes: {
                        tuple_keys: [tuple],
                        on_missing: "error",
                    },
                }), expect_1.expect.any(Object));
                mockWrite.mock.restore();
            });
            (0, node_test_1.it)("should default to error conflict handling when onMissingDeletes option is not specified", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                const mockWrite = node_test_1.mock.method(fgaClient.api, "write", async () => ({}));
                await fgaClient.deleteTuples([tuple]);
                (0, expect_1.expect)(mockWrite).toHaveBeenCalledWith(helpers_1.baseConfig.storeId, expect_1.expect.objectContaining({
                    deletes: {
                        tuple_keys: [tuple],
                        on_missing: "error",
                    },
                }), expect_1.expect.any(Object));
                mockWrite.mock.restore();
            });
        });
        /* Relationship Queries */
        (0, node_test_1.describe)("Check", () => {
            (0, node_test_1.it)("should properly call the Check API", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                nocks.check(helpers_1.baseConfig.storeId, tuple, undefined, undefined, undefined, index_1.ConsistencyPreference.HigherConsistency);
                const data = await fgaClient.check(tuple, { consistency: index_1.ConsistencyPreference.HigherConsistency });
                (0, expect_1.expect)(data).toMatchObject({ allowed: expect_1.expect.any(Boolean) });
            });
        });
        (0, node_test_1.describe)("ClientBatchCheck", () => {
            (0, node_test_1.it)("should properly call the Check API", async () => {
                const tuples = [{
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:1",
                    }, {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "guest",
                        object: "workspace:2",
                    }, {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "reader",
                        object: "workspace:3",
                    }];
                const scope0 = nocks.check(helpers_1.defaultConfiguration.storeId, tuples[0], helpers_1.defaultConfiguration.getBasePath(), { allowed: true }, 200, index_1.ConsistencyPreference.HigherConsistency).matchHeader("X-OpenFGA-Client-Method", "ClientBatchCheck");
                const scope1 = nocks.check(helpers_1.defaultConfiguration.storeId, tuples[1], helpers_1.defaultConfiguration.getBasePath(), { allowed: false }, 200, index_1.ConsistencyPreference.HigherConsistency).matchHeader("X-OpenFGA-Client-Method", "ClientBatchCheck");
                const scope2 = nocks.check(helpers_1.defaultConfiguration.storeId, tuples[2], helpers_1.defaultConfiguration.getBasePath(), {
                    "code": "validation_error",
                    "message": "relation &#39;workspace#reader&#39; not found"
                }, 400, index_1.ConsistencyPreference.HigherConsistency).matchHeader("X-OpenFGA-Client-Method", "ClientBatchCheck");
                const scope3 = (0, nock_1.default)(helpers_1.defaultConfiguration.getBasePath())
                    .get(`/stores/${helpers_1.defaultConfiguration.storeId}/authorization-models`)
                    .query({ page_size: 1 })
                    .reply(200, {
                    authorization_models: [],
                });
                (0, expect_1.expect)(scope0.isDone()).toBe(false);
                (0, expect_1.expect)(scope1.isDone()).toBe(false);
                (0, expect_1.expect)(scope2.isDone()).toBe(false);
                const response = await fgaClient.clientBatchCheck([tuples[0], tuples[1], tuples[2]], { consistency: index_1.ConsistencyPreference.HigherConsistency });
                (0, expect_1.expect)(scope0.isDone()).toBe(true);
                (0, expect_1.expect)(scope1.isDone()).toBe(true);
                (0, expect_1.expect)(scope2.isDone()).toBe(true);
                (0, expect_1.expect)(scope3.isDone()).toBe(false);
                (0, expect_1.expect)(response.result.length).toBe(3);
                (0, expect_1.expect)(response.result.sort((a, b) => String(a._request.object).localeCompare(b._request.object)))
                    .toMatchObject(expect_1.expect.arrayContaining([
                    { _request: tuples[0], allowed: true, },
                    { _request: tuples[1], allowed: false },
                    { _request: tuples[2], error: expect_1.expect.any(Error) },
                ]));
                // NOTE: manually clean pending mocks as we assert on _not_ being matched above.
                nock_1.default.cleanAll();
            });
        });
        (0, node_test_1.describe)("BatchCheck", () => {
            (0, node_test_1.it)(" should throw error when correlationIds are duplicated", async () => {
                (0, expect_1.expect)(fgaClient.batchCheck({
                    checks: [
                        {
                            user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                            object: "workspace:1",
                            relation: "viewer",
                            correlationId: "cor-id",
                        },
                        {
                            user: "user:91284243-9356-4421-8fbf-a4f8d36aa31b",
                            object: "workspace:2",
                            relation: "viewer",
                            correlationId: "cor-id",
                        },
                    ]
                })).rejects.toThrow(new index_1.FgaValidationError("correlationId", "When calling batchCheck, correlation IDs must be unique"));
            });
            (0, node_test_1.it)("should return empty results when empty checks are specified", async () => {
                const response = await fgaClient.batchCheck({
                    checks: [],
                });
                (0, expect_1.expect)(response.result.length).toBe(0);
            });
            (0, node_test_1.it)("should handle single batch successfully", async () => {
                const mockedResponse = {
                    result: {
                        "cor-1": {
                            allowed: true,
                            error: undefined,
                        },
                        "cor-2": {
                            allowed: false,
                            error: undefined,
                        },
                    },
                };
                nocks.singleBatchCheck(helpers_1.baseConfig.storeId, mockedResponse, undefined, index_1.ConsistencyPreference.HigherConsistency, "01GAHCE4YVKPQEKZQHT2R89MQV").matchHeader("X-OpenFGA-Client-Bulk-Request-Id", /.*/);
                const response = await fgaClient.batchCheck({
                    checks: [{
                            user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                            relation: "can_read",
                            object: "document",
                            contextualTuples: {
                                tuple_keys: [{
                                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                                        relation: "editor",
                                        object: "folder:product"
                                    }, {
                                        user: "folder:product",
                                        relation: "parent",
                                        object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a"
                                    }
                                ]
                            },
                            correlationId: "cor-1",
                        },
                        {
                            user: "folder:product",
                            relation: "parent",
                            object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
                            correlationId: "cor-2",
                        }],
                }, {
                    authorizationModelId: "01GAHCE4YVKPQEKZQHT2R89MQV",
                    consistency: index_1.ConsistencyPreference.HigherConsistency,
                });
                (0, expect_1.expect)(response.result).toHaveLength(2);
                (0, expect_1.expect)(response.result[0].allowed).toBe(true);
                (0, expect_1.expect)(response.result[1].allowed).toBe(false);
            });
            (0, node_test_1.it)("should split batches successfully", async () => {
                const mockedResponse0 = {
                    result: {
                        "cor-1": {
                            allowed: true,
                            error: undefined,
                        },
                        "cor-2": {
                            allowed: false,
                            error: undefined,
                        },
                    },
                };
                const mockedResponse1 = {
                    result: {
                        "cor-3": {
                            allowed: false,
                            error: {
                                input_error: index_1.ErrorCode.RelationNotFound,
                                message: "relation not found",
                            }
                        }
                    },
                };
                nocks.singleBatchCheck(helpers_1.baseConfig.storeId, mockedResponse0, undefined, index_1.ConsistencyPreference.HigherConsistency, "01GAHCE4YVKPQEKZQHT2R89MQV").matchHeader("X-OpenFGA-Client-Bulk-Request-Id", /.*/);
                nocks.singleBatchCheck(helpers_1.baseConfig.storeId, mockedResponse1, undefined, index_1.ConsistencyPreference.HigherConsistency, "01GAHCE4YVKPQEKZQHT2R89MQV").matchHeader("X-OpenFGA-Client-Bulk-Request-Id", /.*/);
                const response = await fgaClient.batchCheck({
                    checks: [{
                            user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                            relation: "can_read",
                            object: "document",
                            contextualTuples: {
                                tuple_keys: [{
                                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                                        relation: "editor",
                                        object: "folder:product"
                                    }, {
                                        user: "folder:product",
                                        relation: "parent",
                                        object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a"
                                    }
                                ]
                            },
                            correlationId: "cor-1",
                        },
                        {
                            user: "folder:product",
                            relation: "parent",
                            object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
                            correlationId: "cor-2",
                        },
                        {
                            user: "folder:product",
                            relation: "can_view",
                            object: "document:9992ab2a-d83f-756d-9397-c5ed9f3cj8a4",
                            correlationId: "cor-3",
                        }],
                }, {
                    authorizationModelId: "01GAHCE4YVKPQEKZQHT2R89MQV",
                    consistency: index_1.ConsistencyPreference.HigherConsistency,
                    maxBatchSize: 2,
                });
                (0, expect_1.expect)(response.result).toHaveLength(3);
                const resp0 = response.result.find(r => r.correlationId === "cor-1");
                const resp1 = response.result.find(r => r.correlationId === "cor-2");
                const resp2 = response.result.find(r => r.correlationId === "cor-3");
                (0, expect_1.expect)(resp0?.allowed).toBe(true);
                (0, expect_1.expect)(resp0?.request.user).toBe("user:81684243-9356-4421-8fbf-a4f8d36aa31b");
                (0, expect_1.expect)(resp0?.request.relation).toBe("can_read");
                (0, expect_1.expect)(resp0?.request.object).toBe("document");
                (0, expect_1.expect)(resp1?.allowed).toBe(false);
                (0, expect_1.expect)(resp1?.request.user).toBe("folder:product");
                (0, expect_1.expect)(resp1?.request.relation).toBe("parent");
                (0, expect_1.expect)(resp1?.request.object).toBe("document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a");
                (0, expect_1.expect)(resp2?.allowed).toBe(false);
                (0, expect_1.expect)(resp2?.request.user).toBe("folder:product");
                (0, expect_1.expect)(resp2?.request.relation).toBe("can_view");
                (0, expect_1.expect)(resp2?.request.object).toBe("document:9992ab2a-d83f-756d-9397-c5ed9f3cj8a4");
                (0, expect_1.expect)(resp2?.error?.input_error).toBe(index_1.ErrorCode.RelationNotFound);
                (0, expect_1.expect)(resp2?.error?.message).toBe("relation not found");
            });
            (0, node_test_1.it)("should throw an error if auth fails", async () => {
                (0, nock_1.default)(helpers_1.defaultConfiguration.getBasePath())
                    .post(`/stores/${helpers_1.baseConfig.storeId}/batch-check`)
                    .reply(401, {});
                try {
                    await fgaClient.batchCheck({
                        checks: [{
                                user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                                relation: "can_read",
                                object: "document",
                            }],
                    });
                }
                catch (err) {
                    (0, expect_1.expect)(err).toBeInstanceOf(index_1.FgaApiAuthenticationError);
                }
            });
            (0, node_test_1.it)("should fallback to client's authorization model when unspecified", async () => {
                const mockedResponse = {
                    result: {
                        "cor-1": {
                            allowed: true,
                            error: undefined,
                        },
                        "cor-2": {
                            allowed: false,
                            error: undefined,
                        },
                    },
                };
                nocks
                    .singleBatchCheck(helpers_1.baseConfig.storeId, mockedResponse, undefined, undefined, helpers_1.baseConfig.authorizationModelId)
                    .matchHeader("X-OpenFGA-Client-Bulk-Request-Id", /.*/);
                const response = await fgaClient.batchCheck({
                    checks: [
                        {
                            user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                            relation: "can_read",
                            object: "document",
                            contextualTuples: {
                                tuple_keys: [
                                    {
                                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                                        relation: "editor",
                                        object: "folder:product",
                                    },
                                    {
                                        user: "folder:product",
                                        relation: "parent",
                                        object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
                                    },
                                ],
                            },
                            correlationId: "cor-1",
                        },
                        {
                            user: "folder:product",
                            relation: "parent",
                            object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
                            correlationId: "cor-2",
                        },
                    ],
                });
                (0, expect_1.expect)(response.result).toHaveLength(2);
                (0, expect_1.expect)(response.result[0].allowed).toBe(true);
                (0, expect_1.expect)(response.result[1].allowed).toBe(false);
            });
        });
        (0, node_test_1.describe)("Expand", () => {
            (0, node_test_1.it)("should properly call the Expand API", async () => {
                const tuple = {
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "admin",
                    object: "workspace:1",
                };
                nocks.expand(helpers_1.baseConfig.storeId, tuple, undefined, index_1.ConsistencyPreference.HigherConsistency);
                const data = await fgaClient.expand(tuple, { authorizationModelId: "01GXSA8YR785C4FYS3C0RTG7B1", consistency: index_1.ConsistencyPreference.HigherConsistency });
                (0, expect_1.expect)(data).toMatchObject({});
            });
        });
        (0, node_test_1.describe)("ListObjects", () => {
            (0, node_test_1.it)("should call the api and return the response", async () => {
                const mockedResponse = { objects: ["document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a"] };
                nocks.listObjects(helpers_1.baseConfig.storeId, mockedResponse, undefined, index_1.ConsistencyPreference.HigherConsistency);
                const response = await fgaClient.listObjects({
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "can_read",
                    type: "document",
                    contextualTuples: [{
                            user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                            relation: "editor",
                            object: "folder:product"
                        }, {
                            user: "folder:product",
                            relation: "parent",
                            object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a"
                        }]
                }, {
                    authorizationModelId: "01GAHCE4YVKPQEKZQHT2R89MQV",
                    consistency: index_1.ConsistencyPreference.HigherConsistency,
                });
                (0, expect_1.expect)(response.objects).toHaveLength(mockedResponse.objects.length);
                (0, expect_1.expect)(response.objects).toEqual(expect_1.expect.arrayContaining(mockedResponse.objects));
            });
        });
        (0, node_test_1.describe)("StreamedListObjects", () => {
            (0, node_test_1.it)("should stream objects and yield them incrementally", async () => {
                const objects = ["document:1", "document:2", "document:3"];
                nocks.streamedListObjects(helpers_1.baseConfig.storeId, objects);
                const results = [];
                for await (const response of fgaClient.streamedListObjects({
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    relation: "can_read",
                    type: "document",
                })) {
                    results.push(response.object);
                }
                (0, expect_1.expect)(results).toHaveLength(3);
                (0, expect_1.expect)(results).toEqual(expect_1.expect.arrayContaining(objects));
            });
            (0, node_test_1.it)("should handle custom headers", async () => {
                const objects = ["document:1"];
                (0, nock_1.default)(helpers_1.defaultConfiguration.getBasePath())
                    .post(`/stores/${helpers_1.baseConfig.storeId}/streamed-list-objects`)
                    .reply(function () {
                    // Verify custom headers were sent
                    (0, expect_1.expect)(this.req.headers["x-custom-header"]).toBe("custom-value");
                    (0, expect_1.expect)(this.req.headers["x-request-id"]).toBe("test-123");
                    // Return NDJSON stream
                    const ndjsonResponse = objects
                        .map(obj => JSON.stringify({ result: { object: obj } }))
                        .join("\n") + "\n";
                    return [200, node_stream_1.Readable.from([ndjsonResponse]), {
                            "Content-Type": "application/x-ndjson"
                        }];
                });
                const results = [];
                for await (const response of fgaClient.streamedListObjects({
                    user: "user:anne",
                    relation: "owner",
                    type: "document",
                }, {
                    headers: {
                        "X-Custom-Header": "custom-value",
                        "X-Request-ID": "test-123"
                    }
                })) {
                    results.push(response.object);
                }
                (0, expect_1.expect)(results).toEqual(objects);
            });
            (0, node_test_1.it)("should handle errors from the stream", async () => {
                (0, nock_1.default)(helpers_1.defaultConfiguration.getBasePath())
                    .post(`/stores/${helpers_1.baseConfig.storeId}/streamed-list-objects`)
                    .reply(500, { code: "internal_error", message: "Server error" });
                await (0, expect_1.expect)(async () => {
                    for await (const response of fgaClient.streamedListObjects({
                        user: "user:anne",
                        relation: "owner",
                        type: "document",
                    })) {
                        // Should not get here
                    }
                }).rejects.toThrow();
            });
            (0, node_test_1.it)("should throw when the stream emits an error chunk", async () => {
                const ndjsonResponse = [
                    JSON.stringify({ result: { object: "document:1" } }),
                    JSON.stringify({ error: { code: 13, message: "internal stream error" } }),
                ].join("\n") + "\n";
                const scope = (0, nock_1.default)(helpers_1.defaultConfiguration.getBasePath())
                    .post(`/stores/${helpers_1.baseConfig.storeId}/streamed-list-objects`)
                    .reply(200, () => node_stream_1.Readable.from([ndjsonResponse]), {
                    "Content-Type": "application/x-ndjson"
                });
                const results = [];
                await (0, expect_1.expect)(async () => {
                    for await (const response of fgaClient.streamedListObjects({
                        user: "user:anne",
                        relation: "owner",
                        type: "document",
                    })) {
                        results.push(response.object);
                    }
                }).rejects.toThrow("StreamedListObjects stream returned an error (code: 13): internal stream error");
                (0, expect_1.expect)(scope.isDone()).toBe(true);
                (0, expect_1.expect)(results).toEqual(["document:1"]);
            });
            (0, node_test_1.it)("should handle retry on 429 error", async () => {
                const objects = ["document:1"];
                // Create client with retry enabled
                const fgaClientWithRetry = new index_1.OpenFgaClient({
                    ...helpers_1.baseConfig,
                    credentials: { method: index_1.CredentialsMethod.None },
                    retryParams: { maxRetry: 2, minWaitInMs: 10 }
                });
                // First attempt fails with 429 (called exactly once)
                (0, nock_1.default)(helpers_1.defaultConfiguration.getBasePath())
                    .post(`/stores/${helpers_1.baseConfig.storeId}/streamed-list-objects`)
                    .times(1)
                    .reply(429, { code: "rate_limit_exceeded", message: "Rate limited" }, {
                    "Retry-After": "1"
                });
                // Second attempt succeeds (retry - called exactly once)
                nocks.streamedListObjects(helpers_1.baseConfig.storeId, objects);
                const results = [];
                for await (const response of fgaClientWithRetry.streamedListObjects({
                    user: "user:anne",
                    relation: "owner",
                    type: "document",
                })) {
                    results.push(response.object);
                }
                (0, expect_1.expect)(results).toEqual(objects);
            });
            (0, node_test_1.it)("should support consistency preference", async () => {
                const objects = ["document:1"];
                nocks.streamedListObjects(helpers_1.baseConfig.storeId, objects);
                const results = [];
                for await (const response of fgaClient.streamedListObjects({
                    user: "user:anne",
                    relation: "owner",
                    type: "document",
                }, {
                    consistency: index_1.ConsistencyPreference.HigherConsistency
                })) {
                    results.push(response.object);
                }
                (0, expect_1.expect)(results).toEqual(objects);
            });
        });
        (0, node_test_1.describe)("ListRelations", () => {
            (0, node_test_1.it)("should properly pass the request and return an allowed API response", async () => {
                const tuples = [{
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:1",
                    }, {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "guest",
                        object: "workspace:1",
                    }, {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "reader",
                        object: "workspace:1",
                    }, {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "viewer",
                        object: "workspace:1",
                    }, {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "can_read",
                        object: "workspace:1",
                    }];
                const scope0 = nocks.check(helpers_1.defaultConfiguration.storeId, tuples[0], helpers_1.defaultConfiguration.getBasePath(), { allowed: true }, undefined, index_1.ConsistencyPreference.HigherConsistency).matchHeader("X-OpenFGA-Client-Method", "ListRelations");
                const scope1 = nocks.check(helpers_1.defaultConfiguration.storeId, tuples[1], helpers_1.defaultConfiguration.getBasePath(), { allowed: false }, undefined, index_1.ConsistencyPreference.HigherConsistency).matchHeader("X-OpenFGA-Client-Method", "ListRelations");
                const scope2 = nocks.check(helpers_1.defaultConfiguration.storeId, tuples[2], helpers_1.defaultConfiguration.getBasePath(), { allowed: true }, undefined, index_1.ConsistencyPreference.HigherConsistency).matchHeader("X-OpenFGA-Client-Method", "ListRelations");
                const scope3 = nocks.check(helpers_1.defaultConfiguration.storeId, tuples[3], helpers_1.defaultConfiguration.getBasePath(), { allowed: false }, undefined, index_1.ConsistencyPreference.HigherConsistency).matchHeader("X-OpenFGA-Client-Method", "ListRelations");
                const scope4 = nocks.check(helpers_1.defaultConfiguration.storeId, tuples[4], helpers_1.defaultConfiguration.getBasePath(), { allowed: false }, undefined, index_1.ConsistencyPreference.HigherConsistency).matchHeader("X-OpenFGA-Client-Method", "ListRelations");
                const scope5 = (0, nock_1.default)(helpers_1.defaultConfiguration.getBasePath())
                    .get(`/stores/${helpers_1.defaultConfiguration.storeId}/authorization-models`)
                    .query({ page_size: 1 })
                    .reply(200, {
                    authorization_models: [],
                });
                (0, expect_1.expect)(scope0.isDone()).toBe(false);
                (0, expect_1.expect)(scope1.isDone()).toBe(false);
                (0, expect_1.expect)(scope2.isDone()).toBe(false);
                (0, expect_1.expect)(scope3.isDone()).toBe(false);
                (0, expect_1.expect)(scope4.isDone()).toBe(false);
                (0, expect_1.expect)(scope5.isDone()).toBe(false);
                const response = await fgaClient.listRelations({
                    user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                    object: "workspace:1",
                    relations: ["admin", "guest", "reader", "viewer"],
                }, { consistency: index_1.ConsistencyPreference.HigherConsistency });
                (0, expect_1.expect)(scope0.isDone()).toBe(true);
                (0, expect_1.expect)(scope1.isDone()).toBe(true);
                (0, expect_1.expect)(scope2.isDone()).toBe(true);
                (0, expect_1.expect)(scope3.isDone()).toBe(true);
                (0, expect_1.expect)(scope4.isDone()).toBe(false);
                (0, expect_1.expect)(scope5.isDone()).toBe(false);
                (0, expect_1.expect)(response.relations.length).toBe(2);
                (0, expect_1.expect)(response.relations.sort()).toEqual(expect_1.expect.arrayContaining(["admin", "reader"]));
                // NOTE: manually clean pending mocks as we assert on _not_ being matched above.
                nock_1.default.cleanAll();
            });
            (0, node_test_1.it)("should throw an error if any check returns an error", async () => {
                const tuples = [{
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:1",
                    }, {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "guest",
                        object: "workspace:1",
                    }, {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "reader",
                        object: "workspace:1",
                    }, {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "viewer",
                        object: "workspace:1",
                    }, {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "can_read",
                        object: "workspace:1",
                    }];
                const scope0 = nocks.check(helpers_1.defaultConfiguration.storeId, tuples[0], helpers_1.defaultConfiguration.getBasePath(), { allowed: true }).matchHeader("X-OpenFGA-Client-Method", "ListRelations");
                const scope1 = nocks.check(helpers_1.defaultConfiguration.storeId, tuples[1], helpers_1.defaultConfiguration.getBasePath(), { allowed: false }).matchHeader("X-OpenFGA-Client-Method", "ListRelations");
                const scope2 = nocks.check(helpers_1.defaultConfiguration.storeId, tuples[2], helpers_1.defaultConfiguration.getBasePath(), { allowed: true }).matchHeader("X-OpenFGA-Client-Method", "ListRelations");
                // Mock all default retries+1 to exhaust them all and trigger actual failure.
                const scope3 = Array.from({ length: 4 }, () => nocks.check(helpers_1.defaultConfiguration.storeId, tuples[3], helpers_1.defaultConfiguration.getBasePath(), "", 500).matchHeader("X-OpenFGA-Client-Method", "ListRelations"));
                const scope4 = nocks.check(helpers_1.defaultConfiguration.storeId, tuples[4], helpers_1.defaultConfiguration.getBasePath(), {
                    "code": "validation_error",
                    "message": "relation &#39;workspace#can_read&#39; not found"
                }, 400).matchHeader("X-OpenFGA-Client-Method", "ListRelations");
                const scope5 = (0, nock_1.default)(helpers_1.defaultConfiguration.getBasePath())
                    .get(`/stores/${helpers_1.defaultConfiguration.storeId}/authorization-models`)
                    .query({ page_size: 1 })
                    .reply(200, {
                    authorization_models: [],
                });
                (0, expect_1.expect)(scope0.isDone()).toBe(false);
                (0, expect_1.expect)(scope1.isDone()).toBe(false);
                (0, expect_1.expect)(scope2.isDone()).toBe(false);
                (0, expect_1.expect)(scope3.every(scope => scope.isDone())).toBe(false);
                (0, expect_1.expect)(scope4.isDone()).toBe(false);
                (0, expect_1.expect)(scope5.isDone()).toBe(false);
                try {
                    await fgaClient.listRelations({
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        object: "workspace:1",
                        relations: ["admin", "guest", "reader", "viewer"],
                    });
                }
                catch (err) {
                    (0, expect_1.expect)(scope0.isDone()).toBe(true);
                    (0, expect_1.expect)(scope1.isDone()).toBe(true);
                    (0, expect_1.expect)(scope2.isDone()).toBe(true);
                    (0, expect_1.expect)(scope3.every(scope => scope.isDone())).toBe(true);
                    (0, expect_1.expect)(scope4.isDone()).toBe(false);
                    (0, expect_1.expect)(scope5.isDone()).toBe(false);
                    (0, expect_1.expect)(err).toBeInstanceOf(index_1.FgaApiError);
                }
                // NOTE: manually clean pending mocks as we assert on _not_ being matched above.
                nock_1.default.cleanAll();
            });
            (0, node_test_1.it)("should throw an error if no relations passed", async () => {
                try {
                    await fgaClient.listRelations({
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        object: "workspace:1",
                    });
                }
                catch (err) {
                    (0, expect_1.expect)(err).toBeInstanceOf(index_1.FgaValidationError);
                    (0, expect_1.expect)(err.field).toBe("relations");
                    (0, expect_1.expect)(err.message).toBe("When calling listRelations, at least one relation must be passed in the relations field");
                }
            });
            (0, node_test_1.it)("should throw an error if auth fails", async () => {
                const tuples = [{
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "admin",
                        object: "workspace:1",
                    }];
                const scope0 = nocks.check(helpers_1.baseConfig.storeId, tuples[0], helpers_1.defaultConfiguration.getBasePath(), {}, 401);
                const scope1 = (0, nock_1.default)(helpers_1.defaultConfiguration.getBasePath())
                    .get(`/stores/${helpers_1.defaultConfiguration.storeId}/authorization-models`)
                    .query({ page_size: 1 })
                    .reply(401, {
                    authorization_models: [],
                });
                try {
                    await fgaClient.listRelations({
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        object: "workspace:1",
                        relations: ["admin"],
                    });
                }
                catch (err) {
                    (0, expect_1.expect)(err).toBeInstanceOf(index_1.FgaApiAuthenticationError);
                }
                finally {
                    (0, expect_1.expect)(scope0.isDone()).toBe(true);
                    (0, expect_1.expect)(scope1.isDone()).toBe(false);
                }
                // NOTE: manually clean pending mocks as we assert on _not_ being matched above.
                nock_1.default.cleanAll();
            });
        });
        (0, node_test_1.describe)("ListUsers", () => {
            (0, node_test_1.it)("should call the api and return the response", async () => {
                const mockedResponse = {
                    users: [{
                            object: {
                                type: "user",
                                id: "81684243-9356-4421-8fbf-a4f8d36aa31b"
                            },
                        }, {
                            userset: {
                                type: "team",
                                id: "engineering",
                                relation: "member"
                            },
                        }, {
                            wildcard: {
                                type: "employee"
                            }
                        }]
                };
                nocks.listUsers(helpers_1.baseConfig.storeId, mockedResponse, undefined, index_1.ConsistencyPreference.HigherConsistency);
                const response = await fgaClient.listUsers({
                    object: {
                        type: "document",
                        id: "roadmap"
                    },
                    relation: "can_read",
                    user_filters: [{
                            type: "user"
                        }, {
                            type: "team",
                            relation: "member"
                        }],
                    context: {},
                    contextualTuples: [{
                            user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                            relation: "editor",
                            object: "folder:product"
                        }, {
                            user: "folder:product",
                            relation: "parent",
                            object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a"
                        }]
                }, {
                    authorizationModelId: "01GAHCE4YVKPQEKZQHT2R89MQV",
                    consistency: index_1.ConsistencyPreference.HigherConsistency
                });
                (0, expect_1.expect)(response.users).toHaveLength(mockedResponse.users.length);
                (0, expect_1.expect)(response.users[0]).toMatchObject({
                    object: {
                        type: "user",
                        id: "81684243-9356-4421-8fbf-a4f8d36aa31b"
                    },
                });
                (0, expect_1.expect)(response.users[1]).toMatchObject({
                    userset: {
                        type: "team",
                        id: "engineering",
                        relation: "member"
                    },
                });
                (0, expect_1.expect)(response.users[2]).toMatchObject({
                    wildcard: {
                        type: "employee"
                    }
                });
                (0, expect_1.expect)(response).toEqual(mockedResponse);
            });
        });
        /* Assertions */
        (0, node_test_1.describe)("ReadAssertions", () => {
            (0, node_test_1.it)("should properly call the ReadAssertions API", async () => {
                const modelId = "01H0THVNGCSAZ6SAQVTHPH3F0Q";
                nocks.readAssertions(helpers_1.defaultConfiguration.storeId, modelId);
                const data = await fgaClient.readAssertions({ authorizationModelId: modelId });
                (0, expect_1.expect)(data).toMatchObject({
                    authorization_model_id: modelId,
                    assertions: expect_1.expect.arrayContaining([]),
                });
            });
        });
        (0, node_test_1.describe)("WriteAssertions", () => {
            (0, node_test_1.it)("should properly call the WriteAssertions API", async () => {
                const modelId = "01H0THVNGCSAZ6SAQVTHPH3F0Q";
                nocks.writeAssertions(helpers_1.defaultConfiguration.storeId, modelId);
                await fgaClient.writeAssertions([{
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "viewer",
                        object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a",
                        expectation: true,
                    }], { authorizationModelId: modelId });
            });
        });
    });
});
//# sourceMappingURL=client.test.js.map