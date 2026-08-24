"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNocks = void 0;
const node_stream_1 = require("node:stream");
const index_1 = require("../../index");
const default_config_1 = require("./default-config");
exports.getNocks = ((nock) => ({
    tokenExchange: (apiTokenIssuer, accessToken = "test-token", expiresIn = 300, statusCode = 200, headers = {}) => {
        return nock(`https://${apiTokenIssuer}`, { reqheaders: { "Content-Type": "application/x-www-form-urlencoded" } })
            .post("/oauth/token")
            .reply(statusCode, {
            access_token: accessToken,
            expires_in: expiresIn,
        }, headers);
    },
    listStores: (basePath = default_config_1.defaultConfiguration.getBasePath(), response = {
        continuation_token: "...",
        stores: [{
                id: "some-id",
                name: "some-name",
                created_at: "2023-11-02T15:27:47.951Z",
                updated_at: "2023-11-02T15:27:47.951Z",
                deleted_at: "2023-11-02T15:27:47.951Z",
            }]
    }, responseCode = 200, queryParams) => {
        const mock = nock(basePath).get("/stores");
        if (queryParams) {
            mock.query(queryParams);
        }
        return mock.reply(responseCode, response);
    },
    createStore: (basePath = default_config_1.defaultConfiguration.getBasePath(), response = {
        id: "some-id",
        name: "some-name",
        created_at: "2023-11-02T15:27:47.951Z",
        updated_at: "2023-11-02T15:27:47.951Z",
    }, responseCode = 200) => {
        return nock(basePath)
            .post("/stores")
            .reply(responseCode, response);
    },
    getStore: (storeId, basePath = default_config_1.defaultConfiguration.getBasePath(), response = {
        id: "some-id",
        name: "some-name",
        created_at: "2023-11-02T15:27:47.951Z",
        updated_at: "2023-11-02T15:27:47.951Z",
    }, responseCode = 200) => {
        return nock(basePath)
            .get(`/stores/${storeId}`)
            .reply(responseCode, response);
    },
    deleteStore: (storeId, basePath = default_config_1.defaultConfiguration.getBasePath(), responseCode = 204) => {
        return nock(basePath)
            .delete(`/stores/${storeId}`)
            .reply(responseCode);
    },
    readAuthorizationModels: (storeId, basePath = default_config_1.defaultConfiguration.getBasePath(), authorizationModels = [{ id: "some-id", schema_version: "1.1", type_definitions: [] }], statusCode = 200) => {
        return nock(basePath)
            .get(`/stores/${storeId}/authorization-models`)
            .reply(statusCode, {
            authorization_models: authorizationModels,
        });
    },
    writeAuthorizationModel: (storeId, configurations, basePath = default_config_1.defaultConfiguration.getBasePath()) => {
        return nock(basePath)
            .post(`/stores/${storeId}/authorization-models`)
            .reply(200, {
            id: "some-new-id",
        });
    },
    readSingleAuthzModel: (storeId, configId, basePath = default_config_1.defaultConfiguration.getBasePath(), authorizationModel = { id: "some-id", schema_version: "1.1", type_definitions: [] }) => {
        return nock(basePath)
            .get(`/stores/${storeId}/authorization-models/${configId}`)
            .reply(200, {
            authorization_model: authorizationModel
        });
    },
    readChanges: (storeId, type, pageSize, contToken, startTime, basePath = default_config_1.defaultConfiguration.getBasePath()) => {
        return nock(basePath)
            .get(`/stores/${storeId}/changes`)
            .query({
            page_size: pageSize,
            continuation_token: contToken,
            ...(type ? { type } : {}),
            ...(startTime ? { start_time: startTime } : {})
        })
            .reply(200, {
            changes: [{
                    tuple_key: {
                        user: "user:81684243-9356-4421-8fbf-a4f8d36aa31b",
                        relation: "viewer",
                        object: "document:0192ab2a-d83f-756d-9397-c5ed9f3cb69a"
                    },
                    operation: index_1.TupleOperation.Write,
                    timestamp: "2000-01-01T00:00:00Z"
                }],
            "continuation_token": "eyJwayI6IkxBVEVTVF9OU0NPTkZJR19hdXRoMHN0b3JlIiwic2siOiIxem1qbXF3MWZLZExTcUoyN01MdTdqTjh0cWgifQ=="
        });
    },
    read: (storeId, tuple, basePath = default_config_1.defaultConfiguration.getBasePath(), consistency = undefined) => {
        return nock(basePath)
            .post(`/stores/${storeId}/read`, (body) => body.consistency === consistency)
            .reply(200, { tuples: [], continuation_token: "" });
    },
    write: (storeId, basePath = default_config_1.defaultConfiguration.getBasePath(), responseBody = {}, statusCode = 204) => {
        return nock(basePath)
            .post(`/stores/${storeId}/write`)
            .reply(statusCode, responseBody);
    },
    delete: (storeId, tuple, basePath = default_config_1.defaultConfiguration.getBasePath()) => {
        return nock(basePath)
            .post(`/stores/${storeId}/write`)
            .reply(200, {});
    },
    check: (storeId, tuple, basePath = default_config_1.defaultConfiguration.getBasePath(), response = { allowed: true }, statusCode = 200, consistency = undefined) => {
        return nock(basePath)
            .post(`/stores/${storeId}/check`, (body) => body.tuple_key.user === tuple.user &&
            body.tuple_key.relation === tuple.relation &&
            body.tuple_key.object === tuple.object &&
            body.consistency === consistency)
            .reply(statusCode, response);
    },
    singleBatchCheck: (storeId, responseBody, basePath = default_config_1.defaultConfiguration.getBasePath(), consistency, authorizationModelId = "auth-model-id") => {
        return nock(basePath)
            .post(`/stores/${storeId}/batch-check`, (body) => body.consistency === consistency &&
            body.authorization_model_id === authorizationModelId)
            .reply(200, responseBody);
    },
    expand: (storeId, tuple, basePath = default_config_1.defaultConfiguration.getBasePath(), consistency = undefined) => {
        return nock(basePath)
            .post(`/stores/${storeId}/expand`, (body) => body.consistency === consistency)
            .reply(200, { tree: {} });
    },
    listObjects: (storeId, responseBody, basePath = default_config_1.defaultConfiguration.getBasePath(), consistency = undefined) => {
        return nock(basePath)
            .post(`/stores/${storeId}/list-objects`, (body) => body.consistency === consistency)
            .reply(200, responseBody);
    },
    streamedListObjects: (storeId, objects, basePath = default_config_1.defaultConfiguration.getBasePath()) => {
        // Create NDJSON response (newline-delimited JSON) as a stream
        const ndjsonResponse = objects
            .map(obj => JSON.stringify({ result: { object: obj } }))
            .join("\n") + "\n";
        return nock(basePath)
            .post(`/stores/${storeId}/streamed-list-objects`)
            .reply(200, () => node_stream_1.Readable.from([ndjsonResponse]), {
            "Content-Type": "application/x-ndjson"
        });
    },
    listUsers: (storeId, responseBody, basePath = default_config_1.defaultConfiguration.getBasePath(), consistency = undefined) => {
        return nock(basePath)
            .post(`/stores/${storeId}/list-users`, (body) => body.consistency === consistency)
            .reply(200, responseBody);
    },
    readAssertions: (storeId, modelId, assertions = [], basePath = default_config_1.defaultConfiguration.getBasePath()) => {
        return nock(basePath)
            .get(`/stores/${storeId}/assertions/${modelId}`)
            .reply(200, {
            authorization_model_id: modelId,
            assertions,
        });
    },
    writeAssertions: (storeId, modelId, basePath = default_config_1.defaultConfiguration.getBasePath(), responseStatus = 204) => {
        return nock(basePath)
            .put(`/stores/${storeId}/assertions/${modelId}`)
            .reply(responseStatus);
    },
}));
//# sourceMappingURL=nocks.js.map