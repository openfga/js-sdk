/**
 * JavaScript and Node.js SDK for OpenFGA
 *
 * API version: 0.1
 * Website: https://openfga.dev
 * Documentation: https://openfga.dev/docs
 * Support: https://discord.gg/8naAwJfWN6
 * License: [Apache-2.0](https://github.com/openfga/js-sdk/blob/main/LICENSE)
 *
 * NOTE: This file was auto generated by OpenAPI Generator (https://openapi-generator.tech). DO NOT EDIT.
 */


import { AxiosResponse, AxiosStatic } from "axios";

import { OpenFgaApi } from "./api";
import {
  Assertion,
  CheckResponse,
  CreateStoreRequest,
  CreateStoreResponse,
  ExpandResponse,
  GetStoreResponse,
  ListObjectsRequest,
  ListObjectsResponse,
  ListStoresResponse,
  ReadAssertionsResponse,
  ReadAuthorizationModelResponse,
  ReadAuthorizationModelsResponse,
  ReadChangesResponse,
  ReadResponse,
  TupleKey as ApiTupleKey,
  WriteAuthorizationModelRequest,
  WriteAuthorizationModelResponse,
} from "./apiModel";
import { BaseAPI } from "./base";
import { CallResult, PromiseResult } from "./common";
import { Configuration, RetryParams, UserConfigurationParams } from "./configuration";
import { FgaError } from "./errors";
import {
  chunkSequentialCall,
  generateRandomIdWithNonUniqueFallback,
  setHeaderIfNotSet,
  setNotEnumerableProperty,
} from "./utils";

export type OpenFgaClientConfig = (UserConfigurationParams | Configuration) & {
  authorizationModelId?: string;
}

type TupleKey = Required<ApiTupleKey>;

const DEFAULT_MAX_METHOD_PARALLEL_REQS = 10;
const DEFAULT_MAX_RETRY_OVERRIDE = 15;
const CLIENT_METHOD_HEADER = "X-OpenFGA-Client-Method";
const CLIENT_BULK_REQUEST_ID_HEADER = "X-OpenFGA-Client-Bulk-Request-Id";

export interface ClientRequestOpts {
  retryParams?: RetryParams;
  headers?: Record<string, string>;
}

export interface AuthorizationModelIdOpts {
  authorizationModelId?: string;
}

export type ClientRequestOptsWithAuthZModelId = ClientRequestOpts  & AuthorizationModelIdOpts;

export type PaginationOptions = { pageSize?: number, continuationToken?: string; };

export type ClientCheckRequest = TupleKey & { contextualTuples?: TupleKey[] };

export type ClientBatchCheckRequest = ClientCheckRequest[];

export type ClientBatchCheckSingleResponse = {
  _request: ClientCheckRequest;
} & ({
  allowed: boolean;
  $response: AxiosResponse<CheckResponse>;
} | {
  allowed: undefined;
  error: Error;
});

export interface ClientBatchCheckResponse {
  responses: ClientBatchCheckSingleResponse[];
}

export interface ClientWriteRequestOpts {
  transaction?: {
    disable?: boolean;
    maxPerChunk?: number;
  }
}

export interface BatchCheckRequestOpts {
  maxParallelRequests?: number;
}

export interface ClientWriteRequest {
  writes?: TupleKey[];
  deletes?: TupleKey[];
}

export enum ClientWriteStatus {
  SUCCESS = "success",
  FAILURE = "failure",
}

export interface ClientWriteResponse {
  writes: { tuple_key: TupleKey, status: ClientWriteStatus, err?: Error }[];
  deletes: { tuple_key: TupleKey, status: ClientWriteStatus, err?: Error }[];
}

export interface ClientReadChangesRequest {
  type: string;
}

export type ClientExpandRequest = Pick<TupleKey, "relation" | "object">;
export type ClientReadRequest = ApiTupleKey;
export type ClientListObjectsRequest = Omit<ListObjectsRequest, "authorization_model_id" | "contextual_tuples"> & { contextualTuples?: TupleKey[] };
export type ClientWriteAssertionsRequest = (TupleKey & Pick<Assertion, "expectation">)[];

function getObjectFromString(objectString: string): { type: string; id: string } {
  const [type, id] = objectString.split(":");
  return { type, id };
}

export class OpenFgaClient extends BaseAPI {
  public api: OpenFgaApi;
  public authorizationModelId?: string;

  constructor(configuration: OpenFgaClientConfig, protected axios?: AxiosStatic) {
    super(configuration, axios);

    this.api = new OpenFgaApi(this.configuration);
    this.authorizationModelId = configuration.authorizationModelId;
  }

  private getAuthorizationModelId(options: AuthorizationModelIdOpts = {}) {
    return options?.authorizationModelId || this.authorizationModelId;
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
   * @param {object} [options.headers] - Custom headers to send alongside the request
   * @param {object} [options.retryParams] - Override the retry parameters for this request
   * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
   * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
   * @throws { FgaError }
   */
  async listStores(options: ClientRequestOptsWithAuthZModelId & PaginationOptions = {}): PromiseResult<ListStoresResponse> {
    return this.api.listStores(options.pageSize, options.continuationToken, options);
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
   * @param {ClientRequestOpts} [options]
   * @param {object} [options.headers] - Custom headers to send alongside the request
   * @param {object} [options.retryParams] - Override the retry parameters for this request
   * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
   * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
   */
  async getStore(options: ClientRequestOpts = {}): PromiseResult<GetStoreResponse> {
    return this.api.getStore(options);
  }

  /**
   * DeleteStore - Delete a store
   * @param {ClientRequestOpts} [options]
   * @param {object} [options.headers] - Custom headers to send alongside the request
   * @param {object} [options.retryParams] - Override the retry parameters for this request
   * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
   * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
   */
  async deleteStore(options: ClientRequestOpts = {}): PromiseResult<void> {
    return this.api.deleteStore(options);
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
  async readAuthorizationModels(options: ClientRequestOpts & PaginationOptions = {}): PromiseResult<ReadAuthorizationModelsResponse> {
    return this.api.readAuthorizationModels(options.pageSize, options.continuationToken, options);
  }

  /**
   * WriteAuthorizationModel - Create a new version of the authorization model
   * @param {WriteAuthorizationModelRequest} body
   * @param {ClientRequestOpts} [options]
   * @param {object} [options.headers] - Custom headers to send alongside the request
   * @param {object} [options.retryParams] - Override the retry parameters for this request
   * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
   * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
   */
  async writeAuthorizationModel(body: WriteAuthorizationModelRequest, options: ClientRequestOpts = {}): PromiseResult<WriteAuthorizationModelResponse> {
    return this.api.writeAuthorizationModel(body, options);
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
      throw new Error("authorization_model_id_required");
    }
    return this.api.readAuthorizationModel(authorizationModelId, options);
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
    const authorizationModelsResponse = await this.readAuthorizationModels({ ...options, headers });
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
   * @param {ClientReadChangesRequest} body
   * @param {ClientRequestOpts & PaginationOptions} [options]
   * @param {number} [options.pageSize]
   * @param {string} [options.continuationToken]
   * @param {object} [options.headers] - Custom headers to send alongside the request
   * @param {object} [options.retryParams] - Override the retry parameters for this request
   * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
   * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
   */
  async readChanges(body: ClientReadChangesRequest, options: ClientRequestOpts & PaginationOptions = {}): PromiseResult<ReadChangesResponse> {
    return this.api.readChanges(body.type, options.pageSize, options.continuationToken, options);
  }

  /**
   * Read - Read tuples previously written to the store (does not evaluate)
   * @param {ClientReadRequest} body
   * @param {ClientRequestOpts & PaginationOptions} [options]
   * @param {number} [options.pageSize]
   * @param {string} [options.continuationToken]
   * @param {object} [options.headers] - Custom headers to send alongside the request
   * @param {object} [options.retryParams] - Override the retry parameters for this request
   * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
   * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
   */
  async read(body: ClientReadRequest, options: ClientRequestOpts = {}): PromiseResult<ReadResponse> {
    return this.api.read({ tuple_key: body }, options);
  }

  /**
   * Write - Create or delete relationship tuples
   * @param {ClientWriteRequest} body
   * @param {ClientRequestOptsWithAuthZModelId & ClientWriteRequestOpts} [options]
   * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
   * @param {object} [options.transaction]
   * @param {boolean} [options.transaction.disable] - Disables running the write in a transaction mode. Defaults to `false`
   * @param {number} [options.transaction.maxPerChunk] - Max number of items to send in a single transaction chunk. Defaults to `1`
   * @param {object} [options.headers] - Custom headers to send alongside the request
   * @param {object} [options.retryParams] - Override the retry parameters for this request
   * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
   * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
   */
  async write(body: ClientWriteRequest, options: ClientRequestOptsWithAuthZModelId & ClientWriteRequestOpts = {}): Promise<ClientWriteResponse> {
    const { transaction = {}, headers = {} } = options;
    const { maxPerChunk = 1 } = transaction; // 1 has to be the default otherwise the chunks will be sent in transactions
    const { writes, deletes } = body;
    const authorizationModelId = this.getAuthorizationModelId(options);

    if (!transaction?.disable) {
      await this.api.write({
        writes: { tuple_keys: writes || [] },
        deletes: { tuple_keys: deletes || [] },
        authorization_model_id: authorizationModelId,
      }, options);
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
    const results: ClientWriteResponse = { writes: [], deletes: [] };
    await chunkSequentialCall<TupleKey, void>(
      (chunk) => this.api.write(
        { writes: { tuple_keys: chunk}, authorization_model_id: authorizationModelId },
        { retryParams: { maxRetry: DEFAULT_MAX_RETRY_OVERRIDE }, headers })
        .then(() => { results.writes.push(...chunk.map(tuple => ({ tuple_key: tuple, status: ClientWriteStatus.SUCCESS }))); })
        .catch((err) => { results.writes.push(...chunk.map(tuple => ({ tuple_key: tuple, status: ClientWriteStatus.FAILURE, err }))); }),
      writes || [],
      maxPerChunk,
    );
    await chunkSequentialCall<TupleKey, void>(
      (chunk) => this.api.write(
        { deletes: { tuple_keys: chunk }, authorization_model_id: authorizationModelId },
        { retryParams: { maxRetry: DEFAULT_MAX_RETRY_OVERRIDE }, headers })
        .then(() => { results.deletes.push(...chunk.map(tuple => ({ tuple_key: tuple, status: ClientWriteStatus.SUCCESS }))); })
        .catch((err) => { results.deletes.push(...chunk.map(tuple => ({ tuple_key: tuple, status: ClientWriteStatus.FAILURE, err }))); }),
      deletes || [],
      maxPerChunk,
    );

    return results;
  }

  /**
   * WriteTuples - Utility method to write tuples, wraps Write
   * @param {TupleKey} tuples
   * @param {ClientRequestOptsWithAuthZModelId & ClientWriteRequestOpts} [options]
   * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
   * @param {object} [options.transaction]
   * @param {boolean} [options.transaction.disable] - Disables running the write in a transaction mode. Defaults to `false`
   * @param {number} [options.transaction.maxPerChunk] - Max number of items to send in a single transaction chunk. Defaults to `1`
   * @param {object} [options.headers] - Custom headers to send alongside the request
   * @param {object} [options.retryParams] - Override the retry parameters for this request
   * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
   * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
   */
  async writeTuples(tuples: TupleKey[], options: ClientRequestOptsWithAuthZModelId & ClientWriteRequestOpts = {}): Promise<ClientWriteResponse> {
    const { headers = {} } = options;
    setHeaderIfNotSet(headers, CLIENT_METHOD_HEADER, "WriteTuples");
    return this.write({ writes: tuples }, { ...options, headers });
  }

  /**
   * DeleteTuples - Utility method to delete tuples, wraps Write
   * @param {TupleKey} tuples
   * @param {ClientRequestOptsWithAuthZModelId & ClientWriteRequestOpts} [options]
   * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
   * @param {object} [options.transaction]
   * @param {boolean} [options.transaction.disable] - Disables running the write in a transaction mode. Defaults to `false`
   * @param {number} [options.transaction.maxPerChunk] - Max number of items to send in a single transaction chunk. Defaults to `1`
   * @param {object} [options.headers] - Custom headers to send alongside the request
   * @param {object} [options.retryParams] - Override the retry parameters for this request
   * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
   * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
   */
  async deleteTuples(tuples: TupleKey[], options: ClientRequestOptsWithAuthZModelId & ClientWriteRequestOpts = {}): Promise<ClientWriteResponse> {
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
   * @param {ClientRequestOptsWithAuthZModelId} [options]
   * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
   * @param {object} [options.headers] - Custom headers to send alongside the request
   * @param {object} [options.retryParams] - Override the retry parameters for this request
   * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
   * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
   */
  async check(body: ClientCheckRequest, options: ClientRequestOptsWithAuthZModelId = {}): PromiseResult<CheckResponse> {
    return this.api.check({
      tuple_key: {
        user: body.user,
        relation: body.relation,
        object: body.object,
      },
      contextual_tuples: { tuple_keys: body.contextualTuples || [] },
      authorization_model_id: this.getAuthorizationModelId(options)
    }, options).then(response => ({
      ...response,
      allowed: response.allowed || false,
    }));
  }

  /**
   * BatchCheck - Run a set of checks (evaluates)
   * @param {ClientBatchCheckRequest} body
   * @param {ClientRequestOptsWithAuthZModelId & BatchCheckRequestOpts} [options]
   * @param {number} [options.maxParallelRequests] - Max number of requests to issue in parallel
   * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
   * @param {object} [options.headers] - Custom headers to send alongside the request
   * @param {object} [options.retryParams] - Override the retry parameters for this request
   * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
   * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
   */
  async batchCheck(body: ClientBatchCheckRequest, options: ClientRequestOptsWithAuthZModelId & BatchCheckRequestOpts = {}): Promise<ClientBatchCheckResponse> {
    const { headers = {}, maxParallelRequests = DEFAULT_MAX_METHOD_PARALLEL_REQS } = options;
    setHeaderIfNotSet(headers, CLIENT_METHOD_HEADER, "BatchCheck");
    setHeaderIfNotSet(headers, CLIENT_BULK_REQUEST_ID_HEADER, generateRandomIdWithNonUniqueFallback());

    const responses = (await chunkSequentialCall<TupleKey, any>(async (tuples) =>
      Promise.all(tuples.map(tuple => this.check(tuple, { ...options, retryParams: { maxRetry: DEFAULT_MAX_RETRY_OVERRIDE }, headers })
        .then(({ allowed, $response: response }) => {
          const result = {
            allowed: allowed || false,
            _request: tuple,
          };
          setNotEnumerableProperty(result, "$response", response);
          return result;
        })
        .catch(err => ({
          error: err,
          _request: tuple,
        }))
      )), body, maxParallelRequests).then(results => results.flat())) as ClientBatchCheckSingleResponse[];

    return { responses };
  }

  /**
   * Expand - Expands the relationships in userset tree format (evaluates)
   * @param {ClientExpandRequest} body
   * @param {string} body.relation The relation
   * @param {string} body.object The object, must be of the form: `<type>:<id>`
   * @param {ClientRequestOptsWithAuthZModelId} [options]
   * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
   * @param {object} [options.headers] - Custom headers to send alongside the request
   * @param {object} [options.retryParams] - Override the retry parameters for this request
   * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
   * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
   */
  async expand(body: ClientExpandRequest, options: ClientRequestOptsWithAuthZModelId = {}): PromiseResult<ExpandResponse> {
    return this.api.expand({
      authorization_model_id: this.getAuthorizationModelId(options),
      tuple_key: body,
    }, options);
  }

  /**
   * ListObjects - List the objects of a particular type that the user has a certain relation to (evaluates)
   * @param {ClientListObjectsRequest} body
   * @param {ClientRequestOptsWithAuthZModelId} [options]
   * @param {string} [options.authorizationModelId] - Overrides the authorization model id in the configuration
   * @param {object} [options.headers] - Custom headers to send alongside the request
   * @param {object} [options.retryParams] - Override the retry parameters for this request
   * @param {number} [options.retryParams.maxRetry] - Override the max number of retries on each API request
   * @param {number} [options.retryParams.minWaitInMs] - Override the minimum wait before a retry is initiated
   */
  async listObjects(body: ClientListObjectsRequest, options: ClientRequestOptsWithAuthZModelId = {}): PromiseResult<ListObjectsResponse> {
    const authorizationModelId = this.getAuthorizationModelId(options);
    return this.api.listObjects({
      authorization_model_id: authorizationModelId,
      user: body.user,
      relation: body.relation,
      type: body.type,
      contextual_tuples: { tuple_keys: body.contextualTuples || [] },
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
    const authorizationModelId = this.getAuthorizationModelId(options);
    // Note: authorization model id is validated later
    return this.api.readAssertions(authorizationModelId!, options);
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
    const authorizationModelId = this.getAuthorizationModelId(options);
    return this.api.writeAssertions(authorizationModelId!, {
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
}
