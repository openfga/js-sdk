import { AxiosResponse, AxiosInstance } from "axios";
import asyncPool = require("tiny-async-pool");

import { OpenFgaApi, HttpMethod, RequestBuilderParams, RequestBuilderOptions } from "./api";
export type { HttpMethod, RequestBuilderParams, RequestBuilderOptions };
import {
  Assertion,
  BatchCheckItem,
  BatchCheckRequest,
  BatchCheckResponse,
  CheckError,
  CheckRequest,
  CheckRequestTupleKey,
  CheckResponse,
  ConsistencyPreference,
  ContextualTupleKeys,
  CreateStoreRequest,
  CreateStoreResponse,
  ExpandRequest,
  ExpandRequestTupleKey,
  ExpandResponse,
  GetStoreResponse,
  ListObjectsRequest,
  ListObjectsResponse,
  StreamedListObjectsResponse,
  ListStoresResponse,
  ListUsersRequest,
  ListUsersResponse,
  ReadAssertionsResponse,
  ReadAuthorizationModelResponse,
  ReadAuthorizationModelsResponse,
  ReadChangesResponse,
  ReadRequest,
  ReadRequestTupleKey,
  ReadResponse,
  TupleKey,
  TupleKeyWithoutCondition,
  WriteAuthorizationModelRequest,
  WriteAuthorizationModelResponse,
  WriteRequest,
  WriteRequestWritesOnDuplicate,
  WriteRequestDeletesOnMissing,
} from "./apiModel";
import { BaseAPI } from "./base";
import { CallResult, PromiseResult } from "./common";
import { Configuration, RetryParams, UserConfigurationParams } from "./configuration";
import { FgaApiAuthenticationError, FgaRequiredParamError, FgaValidationError } from "./errors";
import {
  chunkArray,
  generateRandomIdWithNonUniqueFallback,
  setHeaderIfNotSet,
} from "./utils";
import { isWellFormedUlidString } from "./validation";
import SdkConstants from "./constants";
import { parseNDJSONStream } from "./streaming";

export type UserClientConfigurationParams = UserConfigurationParams & {
  storeId?: string;
  authorizationModelId?: string;
}

export class ClientConfiguration extends Configuration {
  /**
   * provide storeId
   *
   * @type {string}
   * @memberof ClientConfiguration
   */
  storeId?: string;
  /**
   * provide authorizationModelId
   *
   * @type {string}
   * @memberof ClientConfiguration
   */
  authorizationModelId?: string;

  constructor(params: UserClientConfigurationParams = {} as unknown as UserConfigurationParams) {
    super(params);
    this.storeId = params.storeId!;
    this.authorizationModelId = params.authorizationModelId!;
  }

  public isValid(): boolean {
    super.isValid();
    if (this.storeId && !isWellFormedUlidString(this.storeId)) {
      throw new FgaValidationError("storeId", "storeId must be in ULID format");
    }
    if (this.authorizationModelId && !isWellFormedUlidString(this.authorizationModelId)) {
      throw new FgaValidationError("authorizationModelId", "authorizationModelId must be in ULID format");
    }

    return true;
  }
}

const DEFAULT_MAX_METHOD_PARALLEL_REQS = SdkConstants.ClientMaxMethodParallelRequests;
const DEFAULT_MAX_BATCH_SIZE = SdkConstants.ClientMaxBatchSize;
const CLIENT_METHOD_HEADER = SdkConstants.ClientMethodHeader;
const CLIENT_BULK_REQUEST_ID_HEADER = SdkConstants.ClientBulkRequestIdHeader;

export interface ClientRequestOpts {
  retryParams?: RetryParams;
  headers?: Record<string, string>;
}

export interface StoreIdOpts {
  storeId?: string;
}

export interface AuthorizationModelIdOpts {
  authorizationModelId?: string;
}

export interface ConsistencyOpts {
  consistency?: ConsistencyPreference
}

export type ClientRequestOptsWithStoreId = ClientRequestOpts & StoreIdOpts;
export type ClientRequestOptsWithAuthZModelId = ClientRequestOpts & StoreIdOpts & AuthorizationModelIdOpts;
export type ClientRequestOptsWithConsistency = ClientRequestOpts & StoreIdOpts & AuthorizationModelIdOpts & ConsistencyOpts;

export type PaginationOptions = { pageSize?: number, continuationToken?: string, name?: string; };

export type ClientCheckRequest = CheckRequestTupleKey &
    Pick<CheckRequest, "context"> &
    { contextualTuples?: Array<TupleKey> };

export type ClientBatchCheckClientRequest = ClientCheckRequest[];

export type ClientBatchCheckSingleClientResponse = {
  _request: ClientCheckRequest;
} & ({
  allowed: boolean;
  $response: AxiosResponse<CheckResponse>;
} | {
  allowed: undefined;
  error: Error;
});

export interface ClientBatchCheckClientResponse {
  result: ClientBatchCheckSingleClientResponse[];
}

export interface ClientBatchCheckClientRequestOpts {
  maxParallelRequests?: number;
}

// For server batch check
export type ClientBatchCheckItem = {
  user: string;
  relation: string;
  object: string;
  correlationId?: string;
  contextualTuples?: ContextualTupleKeys;
  context?: object;
};

// for server batch check
export type ClientBatchCheckRequest = {
  checks: ClientBatchCheckItem[];
};

// for server batch check
export interface ClientBatchCheckRequestOpts {
    maxParallelRequests?: number;
    maxBatchSize?: number;
}


// for server batch check
export type ClientBatchCheckSingleResponse = {
    allowed: boolean;
    request: ClientBatchCheckItem;
    correlationId: string;
    error?: CheckError;
}

export interface ClientBatchCheckResponse {
  result: ClientBatchCheckSingleResponse[];
}

export const ClientWriteRequestOnDuplicateWrites = WriteRequestWritesOnDuplicate;
export const ClientWriteRequestOnMissingDeletes = WriteRequestDeletesOnMissing;

export type ClientWriteRequestOnDuplicateWrites = WriteRequestWritesOnDuplicate;
export type ClientWriteRequestOnMissingDeletes = WriteRequestDeletesOnMissing;

export interface ClientWriteConflictOptions {
  onDuplicateWrites?: ClientWriteRequestOnDuplicateWrites;
  onMissingDeletes?: ClientWriteRequestOnMissingDeletes;
}

export interface ClientWriteTransactionOptions {
  disable?: boolean;
  maxPerChunk?: number;
  maxParallelRequests?: number;
}

export interface ClientWriteRequestOpts {
  transaction?: ClientWriteTransactionOptions;
  conflict?: ClientWriteConflictOptions;
}

export interface ClientWriteTuplesRequestOpts {
  transaction?: ClientWriteTransactionOptions;
  conflict?: {
    onDuplicateWrites?: ClientWriteRequestOnDuplicateWrites;
  };
}

export interface ClientDeleteTuplesRequestOpts {
  transaction?: ClientWriteTransactionOptions;
  conflict?: {
    onMissingDeletes?: ClientWriteRequestOnMissingDeletes;
  };
}

export interface ClientWriteRequest {
  writes?: TupleKey[];
  deletes?: TupleKeyWithoutCondition[];
}

export enum ClientWriteStatus {
  SUCCESS = "success",
  FAILURE = "failure",
}

export interface ClientWriteSingleResponse {
  tuple_key: TupleKey;
  status: ClientWriteStatus;
  err?: Error;
}

export interface ClientWriteResponse {
  writes: ClientWriteSingleResponse[];
  deletes: ClientWriteSingleResponse[];
}

export interface ClientListRelationsResponse {
  relations: string[];
}

export interface ClientReadChangesRequest {
  type: string;
  startTime?: string;
}

export type ClientExpandRequest = ExpandRequestTupleKey & Omit<ExpandRequest, "tuple_key" | "authorization_model_id" | "contextual_tuples" | "consistency"> & {
    contextualTuples?: Array<TupleKey>
};
export type ClientReadRequest = ReadRequestTupleKey;
export type ClientListObjectsRequest = Omit<ListObjectsRequest, "authorization_model_id" | "contextual_tuples" | "consistency"> & {
    contextualTuples?: Array<TupleKey>
};
export type ClientListUsersRequest = Omit<ListUsersRequest, "authorization_model_id" | "contextual_tuples" | "consistency"> & {
    contextualTuples?: Array<TupleKey>
};
export type ClientListRelationsRequest = Omit<ClientCheckRequest, "relation" | "consistency"> & {
    relations?: string[],
};
export type ClientWriteAssertionsRequest = (CheckRequestTupleKey & Pick<Assertion, "expectation">)[];


export class OpenFgaClient extends BaseAPI {
  public api: OpenFgaApi;
  public authorizationModelId?: string;
  public storeId?: string;
  protected configuration: ClientConfiguration;

  constructor(configuration: ClientConfiguration | UserClientConfigurationParams, protected axios?: AxiosInstance) {
    super(configuration, axios);

    if (configuration instanceof ClientConfiguration) {
      this.configuration = configuration;
    } else {
      this.configuration = new ClientConfiguration(configuration);
    }
    this.configuration.isValid();
    this.api = new OpenFgaApi(this.configuration, axios);
    this.storeId = configuration.storeId;
    this.authorizationModelId = configuration.authorizationModelId;
  }

  protected getStoreId(options: StoreIdOpts = {}, isOptional: boolean = false): string | undefined {
    const storeId = options?.storeId || this.storeId;
    if (storeId && !isWellFormedUlidString(storeId)) {
      throw new FgaValidationError("storeId", "storeId must be in ULID format");
    }

    if (!isOptional && !storeId) {
      throw new FgaValidationError("storeId", "storeId is required");
    }

    return storeId;
  }

  protected getAuthorizationModelId(options: AuthorizationModelIdOpts = {}): string | undefined {
    const authorizationModelId = options?.authorizationModelId || this.authorizationModelId;
    if (authorizationModelId && !isWellFormedUlidString(authorizationModelId)) {
      throw new FgaValidationError("authorizationModelId", "authorizationModelId must be in ULID format");
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
  public async checkValidApiConnection(options: ClientRequestOptsWithAuthZModelId = {}): Promise<void> {
    if (this.getAuthorizationModelId(options)) {
      await this.readAuthorizationModel(options);
    } else {
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
  async listStores(options: ClientRequestOptsWithAuthZModelId & PaginationOptions = {}): PromiseResult<ListStoresResponse> {
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
  async createStore(body: CreateStoreRequest, options: ClientRequestOpts = {}): PromiseResult<CreateStoreResponse> {
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
  async getStore(options: ClientRequestOptsWithStoreId = {}): PromiseResult<GetStoreResponse> {
    return this.api.getStore(this.getStoreId(options)!, options);
  }

  /**
   * DeleteStore - Delete a store
   * @param {ClientRequestOptsWithStoreId} [options]
   * @param {object} [options.headers] - Custom headers to send alongside the request
   * @param {object} [options.retryParams] - Override the retry parameters for this request
   * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
   * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
   */
  async deleteStore(options: ClientRequestOptsWithStoreId = {}): PromiseResult<void> {
    return this.api.deleteStore(this.getStoreId(options)!, options);
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
  async readAuthorizationModels(options: ClientRequestOptsWithStoreId & PaginationOptions = {}): PromiseResult<ReadAuthorizationModelsResponse> {
    return this.api.readAuthorizationModels(this.getStoreId(options)!, options.pageSize, options.continuationToken, options);
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
  async writeAuthorizationModel(body: WriteAuthorizationModelRequest, options: ClientRequestOptsWithStoreId = {}): PromiseResult<WriteAuthorizationModelResponse> {
    return this.api.writeAuthorizationModel(this.getStoreId(options)!, body, options);
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
  async readAuthorizationModel(options: ClientRequestOptsWithAuthZModelId = {}): PromiseResult<ReadAuthorizationModelResponse> {
    const authorizationModelId = this.getAuthorizationModelId(options);
    if (!authorizationModelId) {
      throw new FgaRequiredParamError("ClientConfiguration", "authorizationModelId");
    }
    return this.api.readAuthorizationModel(this.getStoreId(options)!, authorizationModelId, options);
  }

  /**
   * ReadLatestAuthorizationModel - Read the latest authorization model for the current store
   * @param {ClientRequestOpts} [options]
   * @param {object} [options.headers] - Custom headers to send alongside the request
   * @param {object} [options.retryParams] - Override the retry parameters for this request
   * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
   * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
   */
  async readLatestAuthorizationModel(options: ClientRequestOpts = {}): PromiseResult<ReadAuthorizationModelResponse> {
    const { headers = {} } = options;
    setHeaderIfNotSet(headers, CLIENT_METHOD_HEADER, "ReadLatestAuthorizationModel");
    const authorizationModelsResponse = await this.readAuthorizationModels({ ...options, pageSize: 1, headers });
    const response = authorizationModelsResponse as any as CallResult<ReadAuthorizationModelResponse>;
    response.authorization_model = authorizationModelsResponse.authorization_models?.[0];
    delete (response as any).authorization_models;
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
  async readChanges(body?: ClientReadChangesRequest, options: ClientRequestOptsWithStoreId & PaginationOptions = {}): PromiseResult<ReadChangesResponse> {
    return this.api.readChanges(this.getStoreId(options)!, body?.type, options.pageSize, options.continuationToken, body?.startTime, options);
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
  async read(body: ClientReadRequest = {}, options: ClientRequestOptsWithStoreId & PaginationOptions & ConsistencyOpts = {}): PromiseResult<ReadResponse> {
    const readRequest: ReadRequest = {
      page_size: options.pageSize,
      continuation_token: options.continuationToken,
      consistency: options.consistency
    };
    if (body.user || body.object || body.relation) {
      readRequest.tuple_key = body;
    }
    return this.api.read(this.getStoreId(options)!, readRequest, options);
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
  async write(body: ClientWriteRequest, options: ClientRequestOptsWithAuthZModelId & ClientWriteRequestOpts = {}): Promise<ClientWriteResponse> {
    const { transaction = {}, headers = {}, conflict } = options;
    const {
      maxPerChunk = 1, // 1 has to be the default otherwise the chunks will be sent in transactions
      maxParallelRequests = DEFAULT_MAX_METHOD_PARALLEL_REQS,
    } = transaction;
    const { writes, deletes } = body;
    const authorizationModelId = this.getAuthorizationModelId(options);

    if (!transaction?.disable) {
      const apiBody: WriteRequest = {
        authorization_model_id: authorizationModelId,
      };
      if (writes?.length) {
        apiBody.writes = {
          tuple_keys: writes,
          on_duplicate: conflict?.onDuplicateWrites ?? ClientWriteRequestOnDuplicateWrites.Error
        };
      }
      if (deletes?.length) {
        apiBody.deletes = {
          tuple_keys: deletes,
          on_missing: conflict?.onMissingDeletes ?? ClientWriteRequestOnMissingDeletes.Error
        };
      }
      await this.api.write(this.getStoreId(options)!, apiBody, options);
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

    setHeaderIfNotSet(headers, CLIENT_METHOD_HEADER, "Write");
    setHeaderIfNotSet(headers, CLIENT_BULK_REQUEST_ID_HEADER, generateRandomIdWithNonUniqueFallback());

    const writeResponses: ClientWriteSingleResponse[][] = [];
    if (writes?.length) {
      for await (const singleChunkResponse of asyncPool(maxParallelRequests, chunkArray(writes, maxPerChunk),
        (chunk) => this.writeTuples(chunk,{ ...options, headers, conflict, transaction: undefined }).catch(err => {
          if (err instanceof FgaApiAuthenticationError) {
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

    const deleteResponses: ClientWriteSingleResponse[][] = [];
    if (deletes?.length) {
      for await (const singleChunkResponse of asyncPool(maxParallelRequests, chunkArray(deletes, maxPerChunk),
        (chunk) => this.deleteTuples(chunk, { ...options, headers, conflict, transaction: undefined }).catch(err => {
          if (err instanceof FgaApiAuthenticationError) {
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
  async writeTuples(tuples: TupleKey[], options: ClientRequestOptsWithAuthZModelId & ClientWriteTuplesRequestOpts = {}): Promise<ClientWriteResponse> {
    const { headers = {} } = options;
    setHeaderIfNotSet(headers, CLIENT_METHOD_HEADER, "WriteTuples");
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
  async deleteTuples(tuples: TupleKeyWithoutCondition[], options: ClientRequestOptsWithAuthZModelId & ClientDeleteTuplesRequestOpts = {}): Promise<ClientWriteResponse> {
    const { headers = {} } = options;
    setHeaderIfNotSet(headers, CLIENT_METHOD_HEADER, "DeleteTuples");
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
  async check(body: ClientCheckRequest, options: ClientRequestOptsWithConsistency = {}): PromiseResult<CheckResponse> {
    return this.api.check(this.getStoreId(options)!, {
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
  async clientBatchCheck(body: ClientBatchCheckClientRequest, options: ClientRequestOptsWithConsistency & ClientBatchCheckClientRequestOpts = {}): Promise<ClientBatchCheckClientResponse> {
    const { headers = {}, maxParallelRequests = DEFAULT_MAX_METHOD_PARALLEL_REQS } = options;
    setHeaderIfNotSet(headers, CLIENT_METHOD_HEADER, "ClientBatchCheck");
    setHeaderIfNotSet(headers, CLIENT_BULK_REQUEST_ID_HEADER, generateRandomIdWithNonUniqueFallback());

    const result: ClientBatchCheckSingleClientResponse[] = [];
    for await (const singleCheckResponse of asyncPool(maxParallelRequests, body, (tuple) => this.check(tuple, { ...options, headers })
      .then(response => {
        (response as ClientBatchCheckSingleClientResponse)._request = tuple;
        return response as ClientBatchCheckSingleClientResponse;
      })
      .catch(err => {
        if (err instanceof FgaApiAuthenticationError) {
          throw err;
        }

        return {
          allowed: undefined,
          error: err,
          _request: tuple,
        };
      })
    )) {
      result.push(singleCheckResponse);
    }
    return { result };
  }



  private singleBatchCheck(body: BatchCheckRequest, options: ClientRequestOptsWithConsistency & ClientBatchCheckRequestOpts = {}): Promise<BatchCheckResponse>  {
    return this.api.batchCheck(this.getStoreId(options)!, body, options);
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
  async batchCheck(
    body: ClientBatchCheckRequest,
    options: ClientRequestOptsWithConsistency & ClientBatchCheckRequestOpts = {}
  ): Promise<ClientBatchCheckResponse> {
    const {
      headers = {},
      maxBatchSize = DEFAULT_MAX_BATCH_SIZE,
      maxParallelRequests = DEFAULT_MAX_METHOD_PARALLEL_REQS,
    } = options;

    setHeaderIfNotSet(headers, CLIENT_BULK_REQUEST_ID_HEADER, generateRandomIdWithNonUniqueFallback());

    const correlationIdToCheck = new Map<string, ClientBatchCheckItem>();
    const transformed: BatchCheckItem[] = [];

    // Validate and transform checks
    for (const check of body.checks) {
      // Generate a correlation ID if not provided
      if (!check.correlationId) {
        check.correlationId = generateRandomIdWithNonUniqueFallback();
      }

      // Ensure that correlation IDs are unique
      if (correlationIdToCheck.has(check.correlationId)) {
        throw new FgaValidationError("correlationId", "When calling batchCheck, correlation IDs must be unique");
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
    const batchedChecks = chunkArray(transformed, maxBatchSize);

    // Execute batch checks in parallel with a limit of maxParallelRequests
    const results: ClientBatchCheckSingleResponse[] = [];
    const batchResponses = asyncPool(maxParallelRequests, batchedChecks, async (batch: BatchCheckItem[]) => {
      const batchRequest: BatchCheckRequest = {
        checks: batch,
        authorization_model_id: options.authorizationModelId,
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
  async expand(body: ClientExpandRequest, options: ClientRequestOptsWithConsistency = {}): PromiseResult<ExpandResponse> {
    return this.api.expand(this.getStoreId(options)!, {
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
  async listObjects(body: ClientListObjectsRequest, options: ClientRequestOptsWithConsistency = {}): PromiseResult<ListObjectsResponse> {
    return this.api.listObjects(this.getStoreId(options)!, {
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
  async *streamedListObjects(body: ClientListObjectsRequest, options: ClientRequestOptsWithConsistency = {}): AsyncGenerator<StreamedListObjectsResponse> {
    const stream = await this.api.streamedListObjects(this.getStoreId(options)!, {
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
      for await (const item of parseNDJSONStream(source as any)) {
        if (item && item.result && item.result.object) {
          yield { object: item.result.object } as StreamedListObjectsResponse;
        }
      }
    } finally {
      // Ensure underlying HTTP connection closes if consumer stops early
      if (source && typeof source.destroy === "function") {
        try { source.destroy(); } catch { }
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
  async listRelations(listRelationsRequest: ClientListRelationsRequest, options: ClientRequestOptsWithConsistency & ClientBatchCheckClientRequestOpts = {}): Promise<ClientListRelationsResponse> {
    const { user, object, relations, contextualTuples, context } = listRelationsRequest;
    const { headers = {}, maxParallelRequests = DEFAULT_MAX_METHOD_PARALLEL_REQS } = options;
    setHeaderIfNotSet(headers, CLIENT_METHOD_HEADER, "ListRelations");
    setHeaderIfNotSet(headers, CLIENT_BULK_REQUEST_ID_HEADER, generateRandomIdWithNonUniqueFallback());

    if (!relations?.length) {
      throw new FgaValidationError("relations", "When calling listRelations, at least one relation must be passed in the relations field");
    }

    const batchCheckResults = await this.clientBatchCheck(relations.map(relation => ({
      user,
      relation,
      object,
      contextualTuples,
      context,
    })), { ...options, headers, maxParallelRequests });

    const firstErrorResponse = batchCheckResults.result.find(response => (response as any).error);
    if (firstErrorResponse) {
      throw (firstErrorResponse as any).error;
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
  async listUsers(body: ClientListUsersRequest, options: ClientRequestOptsWithConsistency = {}): PromiseResult<ListUsersResponse> {
    return this.api.listUsers(this.getStoreId(options)!, {
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
  async readAssertions(options: ClientRequestOptsWithAuthZModelId = {}): PromiseResult<ReadAssertionsResponse> {
    return this.api.readAssertions(this.getStoreId(options)!, this.getAuthorizationModelId(options)!, options);
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
  async writeAssertions(assertions: ClientWriteAssertionsRequest, options: ClientRequestOptsWithAuthZModelId = {}): PromiseResult<void> {
    return this.api.writeAssertions(this.getStoreId(options)!, this.getAuthorizationModelId(options)!, {
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
  async executeApiRequest<T extends object | void = object>(
    request: RequestBuilderParams,
    options: ClientRequestOpts = {}
  ): PromiseResult<T> {
    return this.api.executeApiRequest<T>(request, options);
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
  async executeStreamedApiRequest(
    request: RequestBuilderParams,
    options: ClientRequestOpts = {}
  ): PromiseResult<any> {
    return this.api.executeStreamedApiRequest(request, options);
  }
}
