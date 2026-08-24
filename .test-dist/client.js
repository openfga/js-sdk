"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenFgaClient = exports.ClientWriteStatus = exports.ClientWriteRequestOnMissingDeletes = exports.ClientWriteRequestOnDuplicateWrites = exports.ClientConfiguration = void 0;
const asyncPool = require("tiny-async-pool");
const api_1 = require("./api");
const apiModel_1 = require("./apiModel");
const base_1 = require("./base");
const configuration_1 = require("./configuration");
const errors_1 = require("./errors");
const utils_1 = require("./utils");
const validation_1 = require("./validation");
const constants_1 = __importDefault(require("./constants"));
const streaming_1 = require("./streaming");
class ClientConfiguration extends configuration_1.Configuration {
    constructor(params = {}) {
        super(params);
        this.storeId = params.storeId;
        this.authorizationModelId = params.authorizationModelId;
    }
    isValid() {
        super.isValid();
        if (this.storeId && !(0, validation_1.isWellFormedUlidString)(this.storeId)) {
            throw new errors_1.FgaValidationError("storeId", "storeId must be in ULID format");
        }
        if (this.authorizationModelId && !(0, validation_1.isWellFormedUlidString)(this.authorizationModelId)) {
            throw new errors_1.FgaValidationError("authorizationModelId", "authorizationModelId must be in ULID format");
        }
        return true;
    }
}
exports.ClientConfiguration = ClientConfiguration;
const DEFAULT_MAX_METHOD_PARALLEL_REQS = constants_1.default.ClientMaxMethodParallelRequests;
const DEFAULT_MAX_BATCH_SIZE = constants_1.default.ClientMaxBatchSize;
const CLIENT_METHOD_HEADER = constants_1.default.ClientMethodHeader;
const CLIENT_BULK_REQUEST_ID_HEADER = constants_1.default.ClientBulkRequestIdHeader;
exports.ClientWriteRequestOnDuplicateWrites = apiModel_1.WriteRequestWritesOnDuplicate;
exports.ClientWriteRequestOnMissingDeletes = apiModel_1.WriteRequestDeletesOnMissing;
var ClientWriteStatus;
(function (ClientWriteStatus) {
    ClientWriteStatus["SUCCESS"] = "success";
    ClientWriteStatus["FAILURE"] = "failure";
})(ClientWriteStatus || (exports.ClientWriteStatus = ClientWriteStatus = {}));
class OpenFgaClient extends base_1.BaseAPI {
    constructor(configuration, axios) {
        super(configuration, axios);
        this.axios = axios;
        if (configuration instanceof ClientConfiguration) {
            this.configuration = configuration;
        }
        else {
            this.configuration = new ClientConfiguration(configuration);
        }
        this.configuration.isValid();
        this.api = new api_1.OpenFgaApi(this.configuration, axios);
        this.storeId = configuration.storeId;
        this.authorizationModelId = configuration.authorizationModelId;
    }
    getStoreId(options = {}, isOptional = false) {
        const storeId = options?.storeId || this.storeId;
        if (storeId && !(0, validation_1.isWellFormedUlidString)(storeId)) {
            throw new errors_1.FgaValidationError("storeId", "storeId must be in ULID format");
        }
        if (!isOptional && !storeId) {
            throw new errors_1.FgaValidationError("storeId", "storeId is required");
        }
        return storeId;
    }
    getAuthorizationModelId(options = {}) {
        const authorizationModelId = options?.authorizationModelId || this.authorizationModelId;
        if (authorizationModelId && !(0, validation_1.isWellFormedUlidString)(authorizationModelId)) {
            throw new errors_1.FgaValidationError("authorizationModelId", "authorizationModelId must be in ULID format");
        }
        return authorizationModelId;
    }
    /**
     * checkValidApiConnection - Ensures that the credentials are valid for calling the API
     * If the authorization model id is available, this will attempt to get that model
     * Otherwise this will attempt to get the latest authorization model
     * @param {ClientRequestOptsWithAuthZModelId} [options]
     * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async checkValidApiConnection(options = {}) {
        if (this.getAuthorizationModelId(options)) {
            await this.readAuthorizationModel(options);
        }
        else {
            await this.readLatestAuthorizationModel(options);
        }
    }
    /**********
     * Stores *
     **********/
    /**
     * ListStores - Get a paginated list of stores.
     * @summary List all stores
     * @param {ClientRequestOpts & PaginationOptions} [options]
     * @param {number} [options.pageSize]
     * @param {string} [options.continuationToken]
     * @param {string} [options.name] - Filter stores by name
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     * @throws { FgaError }
     */
    async listStores(options = {}) {
        return this.api.listStores(options.pageSize, options.continuationToken, options.name, options);
    }
    /**
     * CreateStore - Initialize a store
     * @param {CreateStoreRequest} body
     * @param {ClientRequestOpts} [options]
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async createStore(body, options = {}) {
        return this.api.createStore(body, options);
    }
    /**
     * GetStore - Get information about the current store
     * @param {ClientRequestOptsWithStoreId} [options]
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async getStore(options = {}) {
        return this.api.getStore(this.getStoreId(options), options);
    }
    /**
     * DeleteStore - Delete a store
     * @param {ClientRequestOptsWithStoreId} [options]
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async deleteStore(options = {}) {
        return this.api.deleteStore(this.getStoreId(options), options);
    }
    /************************
     * Authorization Models *
     ************************/
    /**
     * ReadAuthorizationModels - Read all authorization models
     * @param {ClientRequestOpts & PaginationOptions} [options]
     * @param {number} [options.pageSize]
     * @param {string} [options.continuationToken]
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async readAuthorizationModels(options = {}) {
        return this.api.readAuthorizationModels(this.getStoreId(options), options.pageSize, options.continuationToken, options);
    }
    /**
     * WriteAuthorizationModel - Create a new version of the authorization model
     * @param {WriteAuthorizationModelRequest} body
     * @param {ClientRequestOptsWithStoreId} [options]
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async writeAuthorizationModel(body, options = {}) {
        return this.api.writeAuthorizationModel(this.getStoreId(options), body, options);
    }
    /**
     * ReadAuthorizationModel - Read the current authorization model
     * @param {ClientRequestOptsWithAuthZModelId} [options]
     * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async readAuthorizationModel(options = {}) {
        const authorizationModelId = this.getAuthorizationModelId(options);
        if (!authorizationModelId) {
            throw new errors_1.FgaRequiredParamError("ClientConfiguration", "authorizationModelId");
        }
        return this.api.readAuthorizationModel(this.getStoreId(options), authorizationModelId, options);
    }
    /**
     * ReadLatestAuthorizationModel - Read the latest authorization model for the current store
     * @param {ClientRequestOpts} [options]
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async readLatestAuthorizationModel(options = {}) {
        const { headers = {} } = options;
        (0, utils_1.setHeaderIfNotSet)(headers, CLIENT_METHOD_HEADER, "ReadLatestAuthorizationModel");
        const authorizationModelsResponse = await this.readAuthorizationModels({ ...options, pageSize: 1, headers });
        const response = authorizationModelsResponse;
        response.authorization_model = authorizationModelsResponse.authorization_models?.[0];
        delete response.authorization_models;
        return response;
    }
    /***********************
     * Relationship Tuples *
     ***********************/
    /**
     * Read Changes - Read the list of historical relationship tuple writes and deletes
     * @param {ClientReadChangesRequest} [body]
     * @param {ClientRequestOpts & PaginationOptions} [options]
     * @param {number} [options.pageSize]
     * @param {string} [options.continuationToken]
     * @param {string} [body.startTime]
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async readChanges(body, options = {}) {
        return this.api.readChanges(this.getStoreId(options), body?.type, options.pageSize, options.continuationToken, body?.startTime, options);
    }
    /**
     * Read - Read tuples previously written to the store (does not evaluate)
     * @param {ClientReadRequest} body
     * @param {ClientRequestOpts & PaginationOptions & ConsistencyOpts} [options]
     * @param {number} [options.pageSize]
     * @param {string} [options.continuationToken]
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {ConsistencyPreference} [options.consistency] - The consistency preference to use
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async read(body = {}, options = {}) {
        const readRequest = {
            page_size: options.pageSize,
            continuation_token: options.continuationToken,
            consistency: options.consistency
        };
        if (body.user || body.object || body.relation) {
            readRequest.tuple_key = body;
        }
        return this.api.read(this.getStoreId(options), readRequest, options);
    }
    /**
     * Write - Create or delete relationship tuples
     * @param {ClientWriteRequest} body
     * @param {ClientRequestOptsWithAuthZModelId & ClientWriteRequestOpts} [options]
     * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
     * @param {object} [options.conflict] - Conflict handling options
     * @param {ClientWriteRequestOnDuplicateWrites} [options.conflict.onDuplicateWrites] - Controls behavior when writing duplicate tuples. Defaults to `ClientWriteRequestOnDuplicateWrites.Error`
     * @param {ClientWriteRequestOnMissingDeletes} [options.conflict.onMissingDeletes] - Controls behavior when deleting non-existent tuples. Defaults to `ClientWriteRequestOnMissingDeletes.Error`
     * @param {object} [options.transaction]
     * @param {boolean} [options.transaction.disable] - Disables running the write in a transaction mode. Defaults to `false`
     * @param {number} [options.transaction.maxPerChunk] - Max number of items to send in a single transaction chunk. Defaults to `1`
     * @param {number} [options.transaction.maxParallelRequests] - Max requests to issue in parallel. Defaults to `10`
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async write(body, options = {}) {
        const { transaction = {}, headers = {}, conflict } = options;
        const { maxPerChunk = 1, // 1 has to be the default otherwise the chunks will be sent in transactions
        maxParallelRequests = DEFAULT_MAX_METHOD_PARALLEL_REQS, } = transaction;
        const { writes, deletes } = body;
        if (!transaction?.disable) {
            const apiBody = {
                authorization_model_id: this.getAuthorizationModelId(options),
            };
            if (writes?.length) {
                apiBody.writes = {
                    tuple_keys: writes,
                    on_duplicate: conflict?.onDuplicateWrites ?? exports.ClientWriteRequestOnDuplicateWrites.Error
                };
            }
            if (deletes?.length) {
                apiBody.deletes = {
                    tuple_keys: deletes,
                    on_missing: conflict?.onMissingDeletes ?? exports.ClientWriteRequestOnMissingDeletes.Error
                };
            }
            await this.api.write(this.getStoreId(options), apiBody, options);
            return {
                writes: writes?.map(tuple => ({
                    tuple_key: tuple,
                    status: ClientWriteStatus.SUCCESS,
                })) || [],
                deletes: deletes?.map(tuple => ({
                    tuple_key: tuple,
                    status: ClientWriteStatus.SUCCESS,
                })) || []
            };
        }
        (0, utils_1.setHeaderIfNotSet)(headers, CLIENT_METHOD_HEADER, "Write");
        (0, utils_1.setHeaderIfNotSet)(headers, CLIENT_BULK_REQUEST_ID_HEADER, (0, utils_1.generateRandomIdWithNonUniqueFallback)());
        const writeResponses = [];
        if (writes?.length) {
            for await (const singleChunkResponse of asyncPool(maxParallelRequests, (0, utils_1.chunkArray)(writes, maxPerChunk), (chunk) => this.writeTuples(chunk, { ...options, headers, conflict, transaction: undefined }).catch(err => {
                if (err instanceof errors_1.FgaApiAuthenticationError) {
                    throw err;
                }
                return {
                    writes: chunk.map(tuple => ({
                        tuple_key: tuple,
                        status: ClientWriteStatus.FAILURE,
                        err,
                    })),
                    deletes: []
                };
            }))) {
                writeResponses.push(singleChunkResponse.writes);
            }
        }
        const deleteResponses = [];
        if (deletes?.length) {
            for await (const singleChunkResponse of asyncPool(maxParallelRequests, (0, utils_1.chunkArray)(deletes, maxPerChunk), (chunk) => this.deleteTuples(chunk, { ...options, headers, conflict, transaction: undefined }).catch(err => {
                if (err instanceof errors_1.FgaApiAuthenticationError) {
                    throw err;
                }
                return {
                    writes: [],
                    deletes: chunk.map(tuple => ({
                        tuple_key: tuple,
                        status: ClientWriteStatus.FAILURE,
                        err,
                    })),
                };
            }))) {
                deleteResponses.push(singleChunkResponse.deletes);
            }
        }
        return { writes: writeResponses.flat(), deletes: deleteResponses.flat() };
    }
    /**
     * WriteTuples - Utility method to write tuples, wraps Write
     * @param {TupleKey[]} tuples
     * @param {ClientRequestOptsWithAuthZModelId & ClientWriteTuplesRequestOpts} [options]
     * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
     * @param {object} [options.conflict] - Conflict handling options
     * @param {ClientWriteRequestOnDuplicateWrites} [options.conflict.onDuplicateWrites] - Controls behavior when writing duplicate tuples. Defaults to `ClientWriteRequestOnDuplicateWrites.Error`
     * @param {object} [options.transaction]
     * @param {boolean} [options.transaction.disable] - Disables running the write in a transaction mode. Defaults to `false`
     * @param {number} [options.transaction.maxPerChunk] - Max number of items to send in a single transaction chunk. Defaults to `1`
     * @param {number} [options.transaction.maxParallelRequests] - Max requests to issue in parallel. Defaults to `10`
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async writeTuples(tuples, options = {}) {
        const { headers = {} } = options;
        (0, utils_1.setHeaderIfNotSet)(headers, CLIENT_METHOD_HEADER, "WriteTuples");
        return this.write({ writes: tuples }, { ...options, headers });
    }
    /**
     * DeleteTuples - Utility method to delete tuples, wraps Write
     * @param {TupleKeyWithoutCondition[]} tuples
     * @param {ClientRequestOptsWithAuthZModelId & ClientDeleteTuplesRequestOpts} [options]
     * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
     * @param {object} [options.conflict] - Conflict handling options
     * @param {ClientWriteRequestOnMissingDeletes} [options.conflict.onMissingDeletes] - Controls behavior when deleting non-existent tuples. Defaults to `ClientWriteRequestOnMissingDeletes.Error`
     * @param {object} [options.transaction]
     * @param {boolean} [options.transaction.disable] - Disables running the write in a transaction mode. Defaults to `false`
     * @param {number} [options.transaction.maxPerChunk] - Max number of items to send in a single transaction chunk. Defaults to `1`
     * @param {number} [options.transaction.maxParallelRequests] - Max requests to issue in parallel. Defaults to `10`
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async deleteTuples(tuples, options = {}) {
        const { headers = {} } = options;
        (0, utils_1.setHeaderIfNotSet)(headers, CLIENT_METHOD_HEADER, "DeleteTuples");
        return this.write({ deletes: tuples }, { ...options, headers });
    }
    /************************
     * Relationship Queries *
     ************************/
    /**
     * Check - Check if a user has a particular relation with an object (evaluates)
     * @param {ClientCheckRequest} body
     * @param {ClientRequestOptsWithConsistency} [options]
     * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {ConsistencyPreference} [options.consistency] - The consistency preference to use
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async check(body, options = {}) {
        return this.api.check(this.getStoreId(options), {
            tuple_key: {
                user: body.user,
                relation: body.relation,
                object: body.object,
            },
            context: body.context,
            contextual_tuples: { tuple_keys: body.contextualTuples || [] },
            authorization_model_id: this.getAuthorizationModelId(options),
            consistency: options.consistency
        }, options);
    }
    /**
     * BatchCheck - Run a set of checks (evaluates) by calling the single check endpoint multiple times in parallel.
     * @param {ClientBatchCheckClientRequest} body
     * @param {ClientRequestOptsWithAuthZModelId & ClientBatchCheckClientRequestOpts} [options]
     * @param {number} [options.maxParallelRequests] - Max number of requests to issue in parallel. Defaults to `10`
     * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
     * @param {string} [options.consistency] - Optional consistency level for the request. Default is `MINIMIZE_LATENCY`
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async clientBatchCheck(body, options = {}) {
        const { headers = {}, maxParallelRequests = DEFAULT_MAX_METHOD_PARALLEL_REQS } = options;
        (0, utils_1.setHeaderIfNotSet)(headers, CLIENT_METHOD_HEADER, "ClientBatchCheck");
        (0, utils_1.setHeaderIfNotSet)(headers, CLIENT_BULK_REQUEST_ID_HEADER, (0, utils_1.generateRandomIdWithNonUniqueFallback)());
        const result = [];
        for await (const singleCheckResponse of asyncPool(maxParallelRequests, body, (tuple) => this.check(tuple, { ...options, headers })
            .then(response => {
            response._request = tuple;
            return response;
        })
            .catch(err => {
            if (err instanceof errors_1.FgaApiAuthenticationError) {
                throw err;
            }
            return {
                allowed: undefined,
                error: err,
                _request: tuple,
            };
        }))) {
            result.push(singleCheckResponse);
        }
        return { result };
    }
    singleBatchCheck(body, options = {}) {
        return this.api.batchCheck(this.getStoreId(options), body, options);
    }
    /**
     * BatchCheck - Run a set of checks (evaluates) by calling the batch-check endpoint.
     * Given the provided list of checks, it will call batch check, splitting the checks into batches based
     * on the `options.maxBatchSize` parameter (default 50 checks) if needed.
     * @param {ClientBatchCheckClientRequest} body
     * @param {ClientRequestOptsWithAuthZModelId & ClientBatchCheckClientRequestOpts} [options]
     * @param {number} [options.maxParallelRequests] - Max number of requests to issue in parallel, if executing multiple requests. Defaults to `10`
     * @param {number} [options.maxBatchSize] - Max number of checks to include in a single batch check request. Defaults to `50`.
     * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration.
     * @param {string} [options.consistency] -
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async batchCheck(body, options = {}) {
        const { headers = {}, maxBatchSize = DEFAULT_MAX_BATCH_SIZE, maxParallelRequests = DEFAULT_MAX_METHOD_PARALLEL_REQS, } = options;
        (0, utils_1.setHeaderIfNotSet)(headers, CLIENT_BULK_REQUEST_ID_HEADER, (0, utils_1.generateRandomIdWithNonUniqueFallback)());
        const correlationIdToCheck = new Map();
        const transformed = [];
        // Validate and transform checks
        for (const check of body.checks) {
            // Generate a correlation ID if not provided
            if (!check.correlationId) {
                check.correlationId = (0, utils_1.generateRandomIdWithNonUniqueFallback)();
            }
            // Ensure that correlation IDs are unique
            if (correlationIdToCheck.has(check.correlationId)) {
                throw new errors_1.FgaValidationError("correlationId", "When calling batchCheck, correlation IDs must be unique");
            }
            correlationIdToCheck.set(check.correlationId, check);
            // Transform the check into the BatchCheckItem format
            transformed.push({
                tuple_key: {
                    user: check.user,
                    relation: check.relation,
                    object: check.object,
                },
                context: check.context,
                contextual_tuples: check.contextualTuples,
                correlation_id: check.correlationId,
            });
        }
        // Split the transformed checks into batches based on maxBatchSize
        const batchedChecks = (0, utils_1.chunkArray)(transformed, maxBatchSize);
        // Execute batch checks in parallel with a limit of maxParallelRequests
        const results = [];
        const batchResponses = asyncPool(maxParallelRequests, batchedChecks, async (batch) => {
            const batchRequest = {
                checks: batch,
                authorization_model_id: this.getAuthorizationModelId(options),
                consistency: options.consistency,
            };
            const response = await this.singleBatchCheck(batchRequest, { ...options, headers });
            return response.result;
        });
        // Collect the responses and associate them with their correlation IDs
        for await (const response of batchResponses) {
            if (response) {
                for (const [correlationId, result] of Object.entries(response)) {
                    const check = correlationIdToCheck.get(correlationId);
                    if (check && result) {
                        results.push({
                            allowed: result.allowed || false,
                            request: check,
                            correlationId,
                            error: result.error,
                        });
                    }
                }
            }
        }
        return { result: results };
    }
    /**
     * Expand - Expands the relationships in userset tree format (evaluates)
     * @param {ClientExpandRequest} body
     * @param {string} body.relation The relation
     * @param {string} body.object The object, must be of the form: `<type>:<id>`
     * @param {ClientRequestOptsWithConsistency} [options]
     * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {ConsistencyPreference} [options.consistency] - The consistency preference to use
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async expand(body, options = {}) {
        return this.api.expand(this.getStoreId(options), {
            authorization_model_id: this.getAuthorizationModelId(options),
            tuple_key: {
                object: body.object,
                relation: body.relation,
            },
            contextual_tuples: { tuple_keys: body.contextualTuples || [] },
            consistency: options.consistency
        }, options);
    }
    /**
     * ListObjects - List the objects of a particular type that the user has a certain relation to (evaluates)
     * @param {ClientListObjectsRequest} body
     * @param {ClientRequestOptsWithConsistency} [options]
     * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {ConsistencyPreference} [options.consistency] - The consistency preference to use
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async listObjects(body, options = {}) {
        return this.api.listObjects(this.getStoreId(options), {
            authorization_model_id: this.getAuthorizationModelId(options),
            user: body.user,
            relation: body.relation,
            type: body.type,
            context: body.context,
            contextual_tuples: { tuple_keys: body.contextualTuples || [] },
            consistency: options.consistency
        }, options);
    }
    /**
     * StreamedListObjects - Stream all objects of a particular type that the user has a certain relation to (evaluates)
     *
     * Note: This method is Node.js only. Streams are supported via the axios API layer.
     * The response will be streamed as newline-delimited JSON objects.
     *
     * @param {ClientListObjectsRequest} body
     * @param {ClientRequestOptsWithConsistency} [options]
     * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {ConsistencyPreference} [options.consistency] - The consistency preference to use
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     * @returns {AsyncGenerator<StreamedListObjectsResponse>} An async generator that yields objects as they are received
     */
    async *streamedListObjects(body, options = {}) {
        const stream = await this.api.streamedListObjects(this.getStoreId(options), {
            authorization_model_id: this.getAuthorizationModelId(options),
            user: body.user,
            relation: body.relation,
            type: body.type,
            context: body.context,
            contextual_tuples: { tuple_keys: body.contextualTuples || [] },
            consistency: options.consistency
        }, options);
        // Unwrap axios CallResult to get the raw Node.js stream when needed
        const source = stream?.$response?.data ?? stream;
        // Parse the Node.js stream
        try {
            for await (const streamResult of (0, streaming_1.parseNDJSONStream)(source)) {
                if (streamResult?.error) {
                    throw new errors_1.FgaError(`StreamedListObjects stream returned an error (code: ${streamResult.error.code}): ${streamResult.error.message}`);
                }
                if (streamResult?.result?.object) {
                    yield { object: streamResult.result.object };
                }
            }
        }
        finally {
            // Ensure underlying HTTP connection closes if consumer stops early
            if (source && typeof source.destroy === "function") {
                try {
                    source.destroy();
                }
                catch { }
            }
        }
    }
    /**
     * ListRelations - List all the relations a user has with an object (evaluates)
     * @param {object} listRelationsRequest
     * @param {string} listRelationsRequest.user The user object, must be of the form: `<type>:<id>`
     * @param {string} listRelationsRequest.object The object, must be of the form: `<type>:<id>`
     * @param {string[]} listRelationsRequest.relations The list of relations to check
     * @param {TupleKey[]} listRelationsRequest.contextualTuples The contextual tuples to send
     * @param {object} listRelationsRequest.context The contextual tuples to send
     * @param options
     */
    async listRelations(listRelationsRequest, options = {}) {
        const { user, object, relations, contextualTuples, context } = listRelationsRequest;
        const { headers = {}, maxParallelRequests = DEFAULT_MAX_METHOD_PARALLEL_REQS } = options;
        (0, utils_1.setHeaderIfNotSet)(headers, CLIENT_METHOD_HEADER, "ListRelations");
        (0, utils_1.setHeaderIfNotSet)(headers, CLIENT_BULK_REQUEST_ID_HEADER, (0, utils_1.generateRandomIdWithNonUniqueFallback)());
        if (!relations?.length) {
            throw new errors_1.FgaValidationError("relations", "When calling listRelations, at least one relation must be passed in the relations field");
        }
        const batchCheckResults = await this.clientBatchCheck(relations.map(relation => ({
            user,
            relation,
            object,
            contextualTuples,
            context,
        })), { ...options, headers, maxParallelRequests });
        const firstErrorResponse = batchCheckResults.result.find(response => response.error);
        if (firstErrorResponse) {
            throw firstErrorResponse.error;
        }
        return { relations: batchCheckResults.result.filter(result => result.allowed).map(result => result._request.relation) };
    }
    /**
     * ListUsers - List the objects of a particular type that the user has a certain relation to (evaluates)
     * @param {ClientListUsersRequest} body
     * @param {ClientRequestOptsWithConsistency} [options]
     * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {ConsistencyPreference} [options.consistency] - The consistency preference to use
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async listUsers(body, options = {}) {
        return this.api.listUsers(this.getStoreId(options), {
            authorization_model_id: this.getAuthorizationModelId(options),
            relation: body.relation,
            object: body.object,
            user_filters: body.user_filters,
            context: body.context,
            contextual_tuples: body.contextualTuples || [],
            consistency: options.consistency
        }, options);
    }
    /**************
     * Assertions *
     **************/
    /**
     * ReadAssertions - Read assertions for a particular authorization model
     * @param {ClientRequestOptsWithAuthZModelId} [options]
     * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async readAssertions(options = {}) {
        return this.api.readAssertions(this.getStoreId(options), this.getAuthorizationModelId(options), options);
    }
    /**
     * WriteAssertions - Updates assertions for a particular authorization model
     * @param {ClientWriteAssertionsRequest} assertions
     * @param {ClientRequestOptsWithAuthZModelId} [options]
     * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
     * @param {object} [options.headers] - Custom headers to send alongside the request
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     */
    async writeAssertions(assertions, options = {}) {
        return this.api.writeAssertions(this.getStoreId(options), this.getAuthorizationModelId(options), {
            assertions: assertions.map(assertion => ({
                tuple_key: {
                    user: assertion.user,
                    relation: assertion.relation,
                    object: assertion.object,
                },
                expectation: assertion.expectation,
            }))
        }, options);
    }
    /**
     * executeApiRequest lets you send any HTTP request directly to an OpenFGA API endpoint.
     * It’s useful when you need to call a new or experimental API that doesn’t yet have a built-in method in the SDK.
     * You still get the benefits of the SDK, like authentication, configuration, and consistent error handling.
     *
     * @param {RequestBuilderParams} request - The request parameters
     * @param {string} request.operationName - Operation name for telemetry and logging (e.g., "CustomCheck")
     * @param {HttpMethod} request.method - HTTP method (GET, POST, PUT, DELETE, PATCH)
     * @param {string} request.path - API path (e.g., ‘/stores/{store_id}/my-endpoint’)
     * @param {unknown} [request.body] - Optional request body for POST/PUT/PATCH requests
     * @param {Record<string, unknown>} [request.queryParams] - Optional query parameters
     * @param {Record<string, string>} [request.headers] - Optional custom request headers
     * @param {ClientRequestOpts} [options] - Request options
     * @param {object} [options.headers] - Additional headers (merged with request.headers; options.headers takes precedence)
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     * @throws { FgaError }
     *
     * @example
     * const response = await client.executeApiRequest<{ allowed: boolean }>({
     *   operationName: ‘CustomCheck’,
     *   method: ‘POST’,
     *   path: ‘/stores/{store_id}/custom-endpoint’,
     *   pathParams: { store_id: ‘my-store-id’ },
     *   body: { foo: ‘bar’ },
     *   headers: { ‘X-Custom-Header’: ‘value’ },
     * });
     */
    async executeApiRequest(request, options = {}) {
        return this.api.executeApiRequest(request, options);
    }
    /**
     * executeStreamedApiRequest lets you send any HTTP request directly to an OpenFGA API streaming endpoint.
     * It’s useful when you need to call a new or experimental API that doesn’t yet have a built-in method in the SDK.
     * You still get the benefits of the SDK, like authentication, configuration, and consistent error handling.
     *
     * @param {RequestBuilderParams} request - The request parameters
     * @param {string} request.operationName - Operation name for telemetry and logging (e.g., "CustomCheck")
     * @param {HttpMethod} request.method - HTTP method (GET, POST, PUT, DELETE, PATCH)
     * @param {string} request.path - API path (e.g., ‘/stores/{store_id}/my-endpoint’)
     * @param {unknown} [request.body] - Optional request body for POST/PUT/PATCH requests
     * @param {Record<string, unknown>} [request.queryParams] - Optional query parameters
     * @param {Record<string, string>} [request.headers] - Optional custom request headers
     * @param {ClientRequestOpts} [options] - Request options
     * @param {object} [options.headers] - Additional headers (merged with request.headers; options.headers takes precedence)
     * @param {object} [options.retryParams] - Override the retry parameters for this request
     * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
     * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
     * @throws { FgaError }
     *
     * @example
     * const response = await client.executeStreamedApiRequest({
     *   operationName: ‘CustomCheck’,
     *   method: ‘POST’,
     *   path: ‘/stores/{store_id}/custom-endpoint’,
     *   pathParams: { store_id: ‘my-store-id’ },
     *   body: { foo: ‘bar’ },
     *   headers: { ‘X-Custom-Header’: ‘value’ },
     * });
     */
    async executeStreamedApiRequest(request, options = {}) {
        return this.api.executeStreamedApiRequest(request, options);
    }
}
exports.OpenFgaClient = OpenFgaClient;
//# sourceMappingURL=client.js.map