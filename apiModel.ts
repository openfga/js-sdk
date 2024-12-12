/* tslint:disable */
/* eslint-disable */
/**
 * JavaScript and Node.js SDK for OpenFGA
 *
 * API version: 1.x
 * Website: https://openfga.dev
 * Documentation: https://openfga.dev/docs
 * Support: https://openfga.dev/community
 * License: [Apache-2.0](https://github.com/openfga/js-sdk/blob/main/LICENSE)
 *
 * NOTE: This file was auto generated by OpenAPI Generator (https://openapi-generator.tech). DO NOT EDIT.
 */


/**
 * 
 * @export
 * @interface AbortedMessageResponse
 */
export interface AbortedMessageResponse {
    /**
     * 
     * @type {string}
     * @memberof AbortedMessageResponse
     */
    code?: string;
    /**
     * 
     * @type {string}
     * @memberof AbortedMessageResponse
     */
    message?: string;
}
/**
 * 
 * @export
 * @interface Any
 */
export interface Any {
    [key: string]: object | any;

    /**
     * 
     * @type {string}
     * @memberof Any
     */
    type?: string;
}
/**
 * 
 * @export
 * @interface Assertion
 */
export interface Assertion {
    /**
     * 
     * @type {AssertionTupleKey}
     * @memberof Assertion
     */
    tuple_key: AssertionTupleKey;
    /**
     * 
     * @type {boolean}
     * @memberof Assertion
     */
    expectation: boolean;
    /**
     * 
     * @type {Array<TupleKey>}
     * @memberof Assertion
     */
    contextual_tuples?: Array<TupleKey>;
    /**
     * Additional request context that will be used to evaluate any ABAC conditions encountered in the query evaluation.
     * @type {object}
     * @memberof Assertion
     */
    context?: object;
}
/**
 * 
 * @export
 * @interface AssertionTupleKey
 */
export interface AssertionTupleKey {
    /**
     * 
     * @type {string}
     * @memberof AssertionTupleKey
     */
    object: string;
    /**
     * 
     * @type {string}
     * @memberof AssertionTupleKey
     */
    relation: string;
    /**
     * 
     * @type {string}
     * @memberof AssertionTupleKey
     */
    user: string;
}
/**
 * 
 * @export
 * @enum {string}
 */

export enum AuthErrorCode {
    NoAuthError = 'no_auth_error',
    AuthFailedInvalidSubject = 'auth_failed_invalid_subject',
    AuthFailedInvalidAudience = 'auth_failed_invalid_audience',
    AuthFailedInvalidIssuer = 'auth_failed_invalid_issuer',
    InvalidClaims = 'invalid_claims',
    AuthFailedInvalidBearerToken = 'auth_failed_invalid_bearer_token',
    BearerTokenMissing = 'bearer_token_missing',
    Unauthenticated = 'unauthenticated',
    Forbidden = 'forbidden'
}

/**
 * 
 * @export
 * @interface AuthorizationModel
 */
export interface AuthorizationModel {
    /**
     * 
     * @type {string}
     * @memberof AuthorizationModel
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof AuthorizationModel
     */
    schema_version: string;
    /**
     * 
     * @type {Array<TypeDefinition>}
     * @memberof AuthorizationModel
     */
    type_definitions: Array<TypeDefinition>;
    /**
     * 
     * @type {{ [key: string]: Condition; }}
     * @memberof AuthorizationModel
     */
    conditions?: { [key: string]: Condition; };
}
/**
 * 
 * @export
 * @interface CheckRequest
 */
export interface CheckRequest {
    /**
     * 
     * @type {CheckRequestTupleKey}
     * @memberof CheckRequest
     */
    tuple_key: CheckRequestTupleKey;
    /**
     * 
     * @type {ContextualTupleKeys}
     * @memberof CheckRequest
     */
    contextual_tuples?: ContextualTupleKeys;
    /**
     * 
     * @type {string}
     * @memberof CheckRequest
     */
    authorization_model_id?: string;
    /**
     * Defaults to false. Making it true has performance implications.
     * @type {boolean}
     * @memberof CheckRequest
     */
    trace?: boolean;
    /**
     * Additional request context that will be used to evaluate any ABAC conditions encountered in the query evaluation.
     * @type {object}
     * @memberof CheckRequest
     */
    context?: object;
    /**
     * 
     * @type {ConsistencyPreference}
     * @memberof CheckRequest
     */
    consistency?: ConsistencyPreference;
}


/**
 * 
 * @export
 * @interface CheckRequestTupleKey
 */
export interface CheckRequestTupleKey {
    /**
     * 
     * @type {string}
     * @memberof CheckRequestTupleKey
     */
    user: string;
    /**
     * 
     * @type {string}
     * @memberof CheckRequestTupleKey
     */
    relation: string;
    /**
     * 
     * @type {string}
     * @memberof CheckRequestTupleKey
     */
    object: string;
}
/**
 * 
 * @export
 * @interface CheckResponse
 */
export interface CheckResponse {
    /**
     * 
     * @type {boolean}
     * @memberof CheckResponse
     */
    allowed?: boolean;
    /**
     * For internal use only.
     * @type {string}
     * @memberof CheckResponse
     */
    resolution?: string;
}
/**
 * 
 * @export
 * @interface Computed
 */
export interface Computed {
    /**
     * 
     * @type {string}
     * @memberof Computed
     */
    userset: string;
}
/**
 * 
 * @export
 * @interface Condition
 */
export interface Condition {
    /**
     * 
     * @type {string}
     * @memberof Condition
     */
    name: string;
    /**
     * A Google CEL expression, expressed as a string.
     * @type {string}
     * @memberof Condition
     */
    expression: string;
    /**
     * A map of parameter names to the parameter\'s defined type reference.
     * @type {{ [key: string]: ConditionParamTypeRef; }}
     * @memberof Condition
     */
    parameters?: { [key: string]: ConditionParamTypeRef; };
    /**
     * 
     * @type {ConditionMetadata}
     * @memberof Condition
     */
    metadata?: ConditionMetadata;
}
/**
 * 
 * @export
 * @interface ConditionMetadata
 */
export interface ConditionMetadata {
    /**
     * 
     * @type {string}
     * @memberof ConditionMetadata
     */
    module?: string;
    /**
     * 
     * @type {SourceInfo}
     * @memberof ConditionMetadata
     */
    source_info?: SourceInfo;
}
/**
 * 
 * @export
 * @interface ConditionParamTypeRef
 */
export interface ConditionParamTypeRef {
    /**
     * 
     * @type {TypeName}
     * @memberof ConditionParamTypeRef
     */
    type_name: TypeName;
    /**
     * 
     * @type {Array<ConditionParamTypeRef>}
     * @memberof ConditionParamTypeRef
     */
    generic_types?: Array<ConditionParamTypeRef>;
}


/**
 * Controls the consistency preferences when calling the query APIs.   - UNSPECIFIED: Default if not set. Behavior will be the same as MINIMIZE_LATENCY.  - MINIMIZE_LATENCY: Minimize latency at the potential expense of lower consistency.  - HIGHER_CONSISTENCY: Prefer higher consistency, at the potential expense of increased latency.
 * @export
 * @enum {string}
 */

export enum ConsistencyPreference {
    Unspecified = 'UNSPECIFIED',
    MinimizeLatency = 'MINIMIZE_LATENCY',
    HigherConsistency = 'HIGHER_CONSISTENCY'
}

/**
 * 
 * @export
 * @interface ContextualTupleKeys
 */
export interface ContextualTupleKeys {
    /**
     * 
     * @type {Array<TupleKey>}
     * @memberof ContextualTupleKeys
     */
    tuple_keys: Array<TupleKey>;
}
/**
 * 
 * @export
 * @interface CreateStoreRequest
 */
export interface CreateStoreRequest {
    /**
     * 
     * @type {string}
     * @memberof CreateStoreRequest
     */
    name: string;
}
/**
 * 
 * @export
 * @interface CreateStoreResponse
 */
export interface CreateStoreResponse {
    /**
     * 
     * @type {string}
     * @memberof CreateStoreResponse
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof CreateStoreResponse
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CreateStoreResponse
     */
    created_at: string;
    /**
     * 
     * @type {string}
     * @memberof CreateStoreResponse
     */
    updated_at: string;
}
/**
 * 
 * @export
 * @interface Difference
 */
export interface Difference {
    /**
     * 
     * @type {Userset}
     * @memberof Difference
     */
    base: Userset;
    /**
     * 
     * @type {Userset}
     * @memberof Difference
     */
    subtract: Userset;
}
/**
 * 
 * @export
 * @enum {string}
 */

export enum ErrorCode {
    NoError = 'no_error',
    ValidationError = 'validation_error',
    AuthorizationModelNotFound = 'authorization_model_not_found',
    AuthorizationModelResolutionTooComplex = 'authorization_model_resolution_too_complex',
    InvalidWriteInput = 'invalid_write_input',
    CannotAllowDuplicateTuplesInOneRequest = 'cannot_allow_duplicate_tuples_in_one_request',
    CannotAllowDuplicateTypesInOneRequest = 'cannot_allow_duplicate_types_in_one_request',
    CannotAllowMultipleReferencesToOneRelation = 'cannot_allow_multiple_references_to_one_relation',
    InvalidContinuationToken = 'invalid_continuation_token',
    InvalidTupleSet = 'invalid_tuple_set',
    InvalidCheckInput = 'invalid_check_input',
    InvalidExpandInput = 'invalid_expand_input',
    UnsupportedUserSet = 'unsupported_user_set',
    InvalidObjectFormat = 'invalid_object_format',
    WriteFailedDueToInvalidInput = 'write_failed_due_to_invalid_input',
    AuthorizationModelAssertionsNotFound = 'authorization_model_assertions_not_found',
    LatestAuthorizationModelNotFound = 'latest_authorization_model_not_found',
    TypeNotFound = 'type_not_found',
    RelationNotFound = 'relation_not_found',
    EmptyRelationDefinition = 'empty_relation_definition',
    InvalidUser = 'invalid_user',
    InvalidTuple = 'invalid_tuple',
    UnknownRelation = 'unknown_relation',
    StoreIdInvalidLength = 'store_id_invalid_length',
    AssertionsTooManyItems = 'assertions_too_many_items',
    IdTooLong = 'id_too_long',
    AuthorizationModelIdTooLong = 'authorization_model_id_too_long',
    TupleKeyValueNotSpecified = 'tuple_key_value_not_specified',
    TupleKeysTooManyOrTooFewItems = 'tuple_keys_too_many_or_too_few_items',
    PageSizeInvalid = 'page_size_invalid',
    ParamMissingValue = 'param_missing_value',
    DifferenceBaseMissingValue = 'difference_base_missing_value',
    SubtractBaseMissingValue = 'subtract_base_missing_value',
    ObjectTooLong = 'object_too_long',
    RelationTooLong = 'relation_too_long',
    TypeDefinitionsTooFewItems = 'type_definitions_too_few_items',
    TypeInvalidLength = 'type_invalid_length',
    TypeInvalidPattern = 'type_invalid_pattern',
    RelationsTooFewItems = 'relations_too_few_items',
    RelationsTooLong = 'relations_too_long',
    RelationsInvalidPattern = 'relations_invalid_pattern',
    ObjectInvalidPattern = 'object_invalid_pattern',
    QueryStringTypeContinuationTokenMismatch = 'query_string_type_continuation_token_mismatch',
    ExceededEntityLimit = 'exceeded_entity_limit',
    InvalidContextualTuple = 'invalid_contextual_tuple',
    DuplicateContextualTuple = 'duplicate_contextual_tuple',
    InvalidAuthorizationModel = 'invalid_authorization_model',
    UnsupportedSchemaVersion = 'unsupported_schema_version',
    Cancelled = 'cancelled'
}

/**
 * 
 * @export
 * @interface ExpandRequest
 */
export interface ExpandRequest {
    /**
     * 
     * @type {ExpandRequestTupleKey}
     * @memberof ExpandRequest
     */
    tuple_key: ExpandRequestTupleKey;
    /**
     * 
     * @type {string}
     * @memberof ExpandRequest
     */
    authorization_model_id?: string;
    /**
     * 
     * @type {ConsistencyPreference}
     * @memberof ExpandRequest
     */
    consistency?: ConsistencyPreference;
}


/**
 * 
 * @export
 * @interface ExpandRequestTupleKey
 */
export interface ExpandRequestTupleKey {
    /**
     * 
     * @type {string}
     * @memberof ExpandRequestTupleKey
     */
    relation: string;
    /**
     * 
     * @type {string}
     * @memberof ExpandRequestTupleKey
     */
    object: string;
}
/**
 * 
 * @export
 * @interface ExpandResponse
 */
export interface ExpandResponse {
    /**
     * 
     * @type {UsersetTree}
     * @memberof ExpandResponse
     */
    tree?: UsersetTree;
}
/**
 * Object represents an OpenFGA Object.  An Object is composed of a type and identifier (e.g. \'document:1\')  See https://openfga.dev/docs/concepts#what-is-an-object
 * @export
 * @interface FgaObject
 */
export interface FgaObject {
    /**
     * 
     * @type {string}
     * @memberof FgaObject
     */
    type: string;
    /**
     * 
     * @type {string}
     * @memberof FgaObject
     */
    id: string;
}
/**
 * 
 * @export
 * @interface ForbiddenResponse
 */
export interface ForbiddenResponse {
    /**
     * 
     * @type {AuthErrorCode}
     * @memberof ForbiddenResponse
     */
    code?: AuthErrorCode;
    /**
     * 
     * @type {string}
     * @memberof ForbiddenResponse
     */
    message?: string;
}


/**
 * 
 * @export
 * @interface GetStoreResponse
 */
export interface GetStoreResponse {
    /**
     * 
     * @type {string}
     * @memberof GetStoreResponse
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof GetStoreResponse
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof GetStoreResponse
     */
    created_at: string;
    /**
     * 
     * @type {string}
     * @memberof GetStoreResponse
     */
    updated_at: string;
    /**
     * 
     * @type {string}
     * @memberof GetStoreResponse
     */
    deleted_at?: string;
}
/**
 * 
 * @export
 * @enum {string}
 */

export enum InternalErrorCode {
    NoInternalError = 'no_internal_error',
    InternalError = 'internal_error',
    DeadlineExceeded = 'deadline_exceeded',
    AlreadyExists = 'already_exists',
    ResourceExhausted = 'resource_exhausted',
    FailedPrecondition = 'failed_precondition',
    Aborted = 'aborted',
    OutOfRange = 'out_of_range',
    Unavailable = 'unavailable',
    DataLoss = 'data_loss'
}

/**
 * 
 * @export
 * @interface InternalErrorMessageResponse
 */
export interface InternalErrorMessageResponse {
    /**
     * 
     * @type {InternalErrorCode}
     * @memberof InternalErrorMessageResponse
     */
    code?: InternalErrorCode;
    /**
     * 
     * @type {string}
     * @memberof InternalErrorMessageResponse
     */
    message?: string;
}


/**
 * A leaf node contains either - a set of users (which may be individual users, or usersets   referencing other relations) - a computed node, which is the result of a computed userset   value in the authorization model - a tupleToUserset nodes, containing the result of expanding   a tupleToUserset value in a authorization model.
 * @export
 * @interface Leaf
 */
export interface Leaf {
    /**
     * 
     * @type {Users}
     * @memberof Leaf
     */
    users?: Users;
    /**
     * 
     * @type {Computed}
     * @memberof Leaf
     */
    computed?: Computed;
    /**
     * 
     * @type {UsersetTreeTupleToUserset}
     * @memberof Leaf
     */
    tupleToUserset?: UsersetTreeTupleToUserset;
}
/**
 * 
 * @export
 * @interface ListObjectsRequest
 */
export interface ListObjectsRequest {
    /**
     * 
     * @type {string}
     * @memberof ListObjectsRequest
     */
    authorization_model_id?: string;
    /**
     * 
     * @type {string}
     * @memberof ListObjectsRequest
     */
    type: string;
    /**
     * 
     * @type {string}
     * @memberof ListObjectsRequest
     */
    relation: string;
    /**
     * 
     * @type {string}
     * @memberof ListObjectsRequest
     */
    user: string;
    /**
     * 
     * @type {ContextualTupleKeys}
     * @memberof ListObjectsRequest
     */
    contextual_tuples?: ContextualTupleKeys;
    /**
     * Additional request context that will be used to evaluate any ABAC conditions encountered in the query evaluation.
     * @type {object}
     * @memberof ListObjectsRequest
     */
    context?: object;
    /**
     * 
     * @type {ConsistencyPreference}
     * @memberof ListObjectsRequest
     */
    consistency?: ConsistencyPreference;
}


/**
 * 
 * @export
 * @interface ListObjectsResponse
 */
export interface ListObjectsResponse {
    /**
     * 
     * @type {Array<string>}
     * @memberof ListObjectsResponse
     */
    objects: Array<string>;
}
/**
 * 
 * @export
 * @interface ListStoresResponse
 */
export interface ListStoresResponse {
    /**
     * 
     * @type {Array<Store>}
     * @memberof ListStoresResponse
     */
    stores: Array<Store>;
    /**
     * The continuation token will be empty if there are no more stores.
     * @type {string}
     * @memberof ListStoresResponse
     */
    continuation_token: string;
}
/**
 * 
 * @export
 * @interface ListUsersRequest
 */
export interface ListUsersRequest {
    /**
     * 
     * @type {string}
     * @memberof ListUsersRequest
     */
    authorization_model_id?: string;
    /**
     * 
     * @type {FgaObject}
     * @memberof ListUsersRequest
     */
    object: FgaObject;
    /**
     * 
     * @type {string}
     * @memberof ListUsersRequest
     */
    relation: string;
    /**
     * The type of results returned. Only accepts exactly one value.
     * @type {Array<UserTypeFilter>}
     * @memberof ListUsersRequest
     */
    user_filters: Array<UserTypeFilter>;
    /**
     * 
     * @type {Array<TupleKey>}
     * @memberof ListUsersRequest
     */
    contextual_tuples?: Array<TupleKey>;
    /**
     * Additional request context that will be used to evaluate any ABAC conditions encountered in the query evaluation.
     * @type {object}
     * @memberof ListUsersRequest
     */
    context?: object;
    /**
     * 
     * @type {ConsistencyPreference}
     * @memberof ListUsersRequest
     */
    consistency?: ConsistencyPreference;
}


/**
 * 
 * @export
 * @interface ListUsersResponse
 */
export interface ListUsersResponse {
    /**
     * 
     * @type {Array<User>}
     * @memberof ListUsersResponse
     */
    users: Array<User>;
}
/**
 * 
 * @export
 * @interface Metadata
 */
export interface Metadata {
    /**
     * 
     * @type {{ [key: string]: RelationMetadata; }}
     * @memberof Metadata
     */
    relations?: { [key: string]: RelationMetadata; };
    /**
     * 
     * @type {string}
     * @memberof Metadata
     */
    module?: string;
    /**
     * 
     * @type {SourceInfo}
     * @memberof Metadata
     */
    source_info?: SourceInfo;
}
/**
 * 
 * @export
 * @interface Node
 */
export interface Node {
    /**
     * 
     * @type {string}
     * @memberof Node
     */
    name: string;
    /**
     * 
     * @type {Leaf}
     * @memberof Node
     */
    leaf?: Leaf;
    /**
     * 
     * @type {UsersetTreeDifference}
     * @memberof Node
     */
    difference?: UsersetTreeDifference;
    /**
     * 
     * @type {Nodes}
     * @memberof Node
     */
    union?: Nodes;
    /**
     * 
     * @type {Nodes}
     * @memberof Node
     */
    intersection?: Nodes;
}
/**
 * 
 * @export
 * @interface Nodes
 */
export interface Nodes {
    /**
     * 
     * @type {Array<Node>}
     * @memberof Nodes
     */
    nodes: Array<Node>;
}
/**
 * 
 * @export
 * @enum {string}
 */

export enum NotFoundErrorCode {
    NoNotFoundError = 'no_not_found_error',
    UndefinedEndpoint = 'undefined_endpoint',
    StoreIdNotFound = 'store_id_not_found',
    Unimplemented = 'unimplemented'
}

/**
 * `NullValue` is a singleton enumeration to represent the null value for the `Value` type union.  The JSON representation for `NullValue` is JSON `null`.   - NULL_VALUE: Null value.
 * @export
 * @enum {string}
 */

export enum NullValue {
    NullValue = 'NULL_VALUE'
}

/**
 * 
 * @export
 * @interface ObjectRelation
 */
export interface ObjectRelation {
    /**
     * 
     * @type {string}
     * @memberof ObjectRelation
     */
    object?: string;
    /**
     * 
     * @type {string}
     * @memberof ObjectRelation
     */
    relation?: string;
}
/**
 * 
 * @export
 * @interface PathUnknownErrorMessageResponse
 */
export interface PathUnknownErrorMessageResponse {
    /**
     * 
     * @type {NotFoundErrorCode}
     * @memberof PathUnknownErrorMessageResponse
     */
    code?: NotFoundErrorCode;
    /**
     * 
     * @type {string}
     * @memberof PathUnknownErrorMessageResponse
     */
    message?: string;
}


/**
 * 
 * @export
 * @interface ReadAssertionsResponse
 */
export interface ReadAssertionsResponse {
    /**
     * 
     * @type {string}
     * @memberof ReadAssertionsResponse
     */
    authorization_model_id: string;
    /**
     * 
     * @type {Array<Assertion>}
     * @memberof ReadAssertionsResponse
     */
    assertions?: Array<Assertion>;
}
/**
 * 
 * @export
 * @interface ReadAuthorizationModelResponse
 */
export interface ReadAuthorizationModelResponse {
    /**
     * 
     * @type {AuthorizationModel}
     * @memberof ReadAuthorizationModelResponse
     */
    authorization_model?: AuthorizationModel;
}
/**
 * 
 * @export
 * @interface ReadAuthorizationModelsResponse
 */
export interface ReadAuthorizationModelsResponse {
    /**
     * 
     * @type {Array<AuthorizationModel>}
     * @memberof ReadAuthorizationModelsResponse
     */
    authorization_models: Array<AuthorizationModel>;
    /**
     * The continuation token will be empty if there are no more models.
     * @type {string}
     * @memberof ReadAuthorizationModelsResponse
     */
    continuation_token?: string;
}
/**
 * 
 * @export
 * @interface ReadChangesResponse
 */
export interface ReadChangesResponse {
    /**
     * 
     * @type {Array<TupleChange>}
     * @memberof ReadChangesResponse
     */
    changes: Array<TupleChange>;
    /**
     * The continuation token will be identical if there are no new changes.
     * @type {string}
     * @memberof ReadChangesResponse
     */
    continuation_token?: string;
}
/**
 * 
 * @export
 * @interface ReadRequest
 */
export interface ReadRequest {
    /**
     * 
     * @type {ReadRequestTupleKey}
     * @memberof ReadRequest
     */
    tuple_key?: ReadRequestTupleKey;
    /**
     * 
     * @type {number}
     * @memberof ReadRequest
     */
    page_size?: number;
    /**
     * 
     * @type {string}
     * @memberof ReadRequest
     */
    continuation_token?: string;
    /**
     * 
     * @type {ConsistencyPreference}
     * @memberof ReadRequest
     */
    consistency?: ConsistencyPreference;
}


/**
 * 
 * @export
 * @interface ReadRequestTupleKey
 */
export interface ReadRequestTupleKey {
    /**
     * 
     * @type {string}
     * @memberof ReadRequestTupleKey
     */
    user?: string;
    /**
     * 
     * @type {string}
     * @memberof ReadRequestTupleKey
     */
    relation?: string;
    /**
     * 
     * @type {string}
     * @memberof ReadRequestTupleKey
     */
    object?: string;
}
/**
 * 
 * @export
 * @interface ReadResponse
 */
export interface ReadResponse {
    /**
     * 
     * @type {Array<Tuple>}
     * @memberof ReadResponse
     */
    tuples: Array<Tuple>;
    /**
     * The continuation token will be empty if there are no more tuples.
     * @type {string}
     * @memberof ReadResponse
     */
    continuation_token: string;
}
/**
 * 
 * @export
 * @interface RelationMetadata
 */
export interface RelationMetadata {
    /**
     * 
     * @type {Array<RelationReference>}
     * @memberof RelationMetadata
     */
    directly_related_user_types?: Array<RelationReference>;
    /**
     * 
     * @type {string}
     * @memberof RelationMetadata
     */
    module?: string;
    /**
     * 
     * @type {SourceInfo}
     * @memberof RelationMetadata
     */
    source_info?: SourceInfo;
    /**
    *
    * @type {string}
    * @memberof RelationMetadata
    */
    mixin?: string;
}
/**
 * RelationReference represents a relation of a particular object type (e.g. \'document#viewer\').
 * @export
 * @interface RelationReference
 */
export interface RelationReference {
    /**
     * 
     * @type {string}
     * @memberof RelationReference
     */
    type: string;
    /**
     * 
     * @type {string}
     * @memberof RelationReference
     */
    relation?: string;
    /**
     * 
     * @type {object}
     * @memberof RelationReference
     */
    wildcard?: object;
    /**
     * The name of a condition that is enforced over the allowed relation.
     * @type {string}
     * @memberof RelationReference
     */
    condition?: string;
}
/**
 * 
 * @export
 * @interface RelationshipCondition
 */
export interface RelationshipCondition {
    /**
     * A reference (by name) of the relationship condition defined in the authorization model.
     * @type {string}
     * @memberof RelationshipCondition
     */
    name: string;
    /**
     * Additional context/data to persist along with the condition. The keys must match the parameters defined by the condition, and the value types must match the parameter type definitions.
     * @type {object}
     * @memberof RelationshipCondition
     */
    context?: object;
}
/**
 * 
 * @export
 * @interface SourceInfo
 */
export interface SourceInfo {
    /**
     * 
     * @type {string}
     * @memberof SourceInfo
     */
    file?: string;
}
/**
 * 
 * @export
 * @interface Status
 */
export interface Status {
    /**
     * 
     * @type {number}
     * @memberof Status
     */
    code?: number;
    /**
     * 
     * @type {string}
     * @memberof Status
     */
    message?: string;
    /**
     * 
     * @type {Array<Any>}
     * @memberof Status
     */
    details?: Array<Any>;
}
/**
 * 
 * @export
 * @interface Store
 */
export interface Store {
    /**
     * 
     * @type {string}
     * @memberof Store
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof Store
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof Store
     */
    created_at: string;
    /**
     * 
     * @type {string}
     * @memberof Store
     */
    updated_at: string;
    /**
     * 
     * @type {string}
     * @memberof Store
     */
    deleted_at?: string;
}
/**
 * 
 * @export
 * @interface Tuple
 */
export interface Tuple {
    /**
     * 
     * @type {TupleKey}
     * @memberof Tuple
     */
    key: TupleKey;
    /**
     * 
     * @type {string}
     * @memberof Tuple
     */
    timestamp: string;
}
/**
 * 
 * @export
 * @interface TupleChange
 */
export interface TupleChange {
    /**
     * 
     * @type {TupleKey}
     * @memberof TupleChange
     */
    tuple_key: TupleKey;
    /**
     * 
     * @type {TupleOperation}
     * @memberof TupleChange
     */
    operation: TupleOperation;
    /**
     * 
     * @type {string}
     * @memberof TupleChange
     */
    timestamp: string;
}


/**
 * 
 * @export
 * @interface TupleKey
 */
export interface TupleKey {
    /**
     * 
     * @type {string}
     * @memberof TupleKey
     */
    user: string;
    /**
     * 
     * @type {string}
     * @memberof TupleKey
     */
    relation: string;
    /**
     * 
     * @type {string}
     * @memberof TupleKey
     */
    object: string;
    /**
     * 
     * @type {RelationshipCondition}
     * @memberof TupleKey
     */
    condition?: RelationshipCondition;
}
/**
 * 
 * @export
 * @interface TupleKeyWithoutCondition
 */
export interface TupleKeyWithoutCondition {
    /**
     * 
     * @type {string}
     * @memberof TupleKeyWithoutCondition
     */
    user: string;
    /**
     * 
     * @type {string}
     * @memberof TupleKeyWithoutCondition
     */
    relation: string;
    /**
     * 
     * @type {string}
     * @memberof TupleKeyWithoutCondition
     */
    object: string;
}
/**
 * 
 * @export
 * @enum {string}
 */

export enum TupleOperation {
    Write = 'TUPLE_OPERATION_WRITE',
    Delete = 'TUPLE_OPERATION_DELETE'
}

/**
 * 
 * @export
 * @interface TupleToUserset
 */
export interface TupleToUserset {
    /**
     * 
     * @type {ObjectRelation}
     * @memberof TupleToUserset
     */
    tupleset: ObjectRelation;
    /**
     * 
     * @type {ObjectRelation}
     * @memberof TupleToUserset
     */
    computedUserset: ObjectRelation;
}
/**
 * 
 * @export
 * @interface TypeDefinition
 */
export interface TypeDefinition {
    /**
     * 
     * @type {string}
     * @memberof TypeDefinition
     */
    type: string;
    /**
     * 
     * @type {{ [key: string]: Userset; }}
     * @memberof TypeDefinition
     */
    relations?: { [key: string]: Userset; };
    /**
     * 
     * @type {Metadata}
     * @memberof TypeDefinition
     */
    metadata?: Metadata;
}
/**
 * 
 * @export
 * @enum {string}
 */

export enum TypeName {
    Unspecified = 'TYPE_NAME_UNSPECIFIED',
    Any = 'TYPE_NAME_ANY',
    Bool = 'TYPE_NAME_BOOL',
    String = 'TYPE_NAME_STRING',
    Int = 'TYPE_NAME_INT',
    Uint = 'TYPE_NAME_UINT',
    Double = 'TYPE_NAME_DOUBLE',
    Duration = 'TYPE_NAME_DURATION',
    Timestamp = 'TYPE_NAME_TIMESTAMP',
    Map = 'TYPE_NAME_MAP',
    List = 'TYPE_NAME_LIST',
    Ipaddress = 'TYPE_NAME_IPADDRESS'
}

/**
 * Type bound public access.  Normally represented using the `<type>:*` syntax  `employee:*` represents every object of type `employee`, including those not currently present in the system  See https://openfga.dev/docs/concepts#what-is-type-bound-public-access
 * @export
 * @interface TypedWildcard
 */
export interface TypedWildcard {
    /**
     * 
     * @type {string}
     * @memberof TypedWildcard
     */
    type: string;
}
/**
 * 
 * @export
 * @interface UnauthenticatedResponse
 */
export interface UnauthenticatedResponse {
    /**
     * 
     * @type {ErrorCode}
     * @memberof UnauthenticatedResponse
     */
    code?: ErrorCode;
    /**
     * 
     * @type {string}
     * @memberof UnauthenticatedResponse
     */
    message?: string;
}


/**
 * 
 * @export
 * @enum {string}
 */

export enum UnprocessableContentErrorCode {
    NoThrottledErrorCode = 'no_throttled_error_code',
    ThrottledTimeoutError = 'throttled_timeout_error'
}

/**
 * 
 * @export
 * @interface UnprocessableContentMessageResponse
 */
export interface UnprocessableContentMessageResponse {
    /**
     * 
     * @type {UnprocessableContentErrorCode}
     * @memberof UnprocessableContentMessageResponse
     */
    code?: UnprocessableContentErrorCode;
    /**
     * 
     * @type {string}
     * @memberof UnprocessableContentMessageResponse
     */
    message?: string;
}


/**
 * User.  Represents any possible value for a user (subject or principal). Can be a: - Specific user object e.g.: \'user:will\', \'folder:marketing\', \'org:contoso\', ...) - Specific userset (e.g. \'group:engineering#member\') - Public-typed wildcard (e.g. \'user:*\')  See https://openfga.dev/docs/concepts#what-is-a-user
 * @export
 * @interface User
 */
export interface User {
    /**
     * 
     * @type {FgaObject}
     * @memberof User
     */
    object?: FgaObject;
    /**
     * 
     * @type {UsersetUser}
     * @memberof User
     */
    userset?: UsersetUser;
    /**
     * 
     * @type {TypedWildcard}
     * @memberof User
     */
    wildcard?: TypedWildcard;
}
/**
 * 
 * @export
 * @interface UserTypeFilter
 */
export interface UserTypeFilter {
    /**
     * 
     * @type {string}
     * @memberof UserTypeFilter
     */
    type: string;
    /**
     * 
     * @type {string}
     * @memberof UserTypeFilter
     */
    relation?: string;
}
/**
 * 
 * @export
 * @interface Users
 */
export interface Users {
    /**
     * 
     * @type {Array<string>}
     * @memberof Users
     */
    users: Array<string>;
}
/**
 * 
 * @export
 * @interface Userset
 */
export interface Userset {
    /**
     * A DirectUserset is a sentinel message for referencing the direct members specified by an object/relation mapping.
     * @type {object}
     * @memberof Userset
     */
    this?: object;
    /**
     * 
     * @type {ObjectRelation}
     * @memberof Userset
     */
    computedUserset?: ObjectRelation;
    /**
     * 
     * @type {TupleToUserset}
     * @memberof Userset
     */
    tupleToUserset?: TupleToUserset;
    /**
     * 
     * @type {Usersets}
     * @memberof Userset
     */
    union?: Usersets;
    /**
     * 
     * @type {Usersets}
     * @memberof Userset
     */
    intersection?: Usersets;
    /**
     * 
     * @type {Difference}
     * @memberof Userset
     */
    difference?: Difference;
}
/**
 * A UsersetTree contains the result of an Expansion.
 * @export
 * @interface UsersetTree
 */
export interface UsersetTree {
    /**
     * 
     * @type {Node}
     * @memberof UsersetTree
     */
    root?: Node;
}
/**
 * 
 * @export
 * @interface UsersetTreeDifference
 */
export interface UsersetTreeDifference {
    /**
     * 
     * @type {Node}
     * @memberof UsersetTreeDifference
     */
    base: Node;
    /**
     * 
     * @type {Node}
     * @memberof UsersetTreeDifference
     */
    subtract: Node;
}
/**
 * 
 * @export
 * @interface UsersetTreeTupleToUserset
 */
export interface UsersetTreeTupleToUserset {
    /**
     * 
     * @type {string}
     * @memberof UsersetTreeTupleToUserset
     */
    tupleset: string;
    /**
     * 
     * @type {Array<Computed>}
     * @memberof UsersetTreeTupleToUserset
     */
    computed: Array<Computed>;
}
/**
 * Userset.  A set or group of users, represented in the `<type>:<id>#<relation>` format  `group:fga#member` represents all members of group FGA, not to be confused by `group:fga` which represents the group itself as a specific object.  See: https://openfga.dev/docs/modeling/building-blocks/usersets#what-is-a-userset
 * @export
 * @interface UsersetUser
 */
export interface UsersetUser {
    /**
     * 
     * @type {string}
     * @memberof UsersetUser
     */
    type: string;
    /**
     * 
     * @type {string}
     * @memberof UsersetUser
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof UsersetUser
     */
    relation: string;
}
/**
 * 
 * @export
 * @interface Usersets
 */
export interface Usersets {
    /**
     * 
     * @type {Array<Userset>}
     * @memberof Usersets
     */
    child: Array<Userset>;
}
/**
 * 
 * @export
 * @interface ValidationErrorMessageResponse
 */
export interface ValidationErrorMessageResponse {
    /**
     * 
     * @type {ErrorCode}
     * @memberof ValidationErrorMessageResponse
     */
    code?: ErrorCode;
    /**
     * 
     * @type {string}
     * @memberof ValidationErrorMessageResponse
     */
    message?: string;
}


/**
 * 
 * @export
 * @interface WriteAssertionsRequest
 */
export interface WriteAssertionsRequest {
    /**
     * 
     * @type {Array<Assertion>}
     * @memberof WriteAssertionsRequest
     */
    assertions: Array<Assertion>;
}
/**
 * 
 * @export
 * @interface WriteAuthorizationModelRequest
 */
export interface WriteAuthorizationModelRequest {
    /**
     * 
     * @type {Array<TypeDefinition>}
     * @memberof WriteAuthorizationModelRequest
     */
    type_definitions: Array<TypeDefinition>;
    /**
     * 
     * @type {string}
     * @memberof WriteAuthorizationModelRequest
     */
    schema_version: string;
    /**
     * 
     * @type {{ [key: string]: Condition; }}
     * @memberof WriteAuthorizationModelRequest
     */
    conditions?: { [key: string]: Condition; };
}
/**
 * 
 * @export
 * @interface WriteAuthorizationModelResponse
 */
export interface WriteAuthorizationModelResponse {
    /**
     * 
     * @type {string}
     * @memberof WriteAuthorizationModelResponse
     */
    authorization_model_id: string;
}
/**
 * 
 * @export
 * @interface WriteRequest
 */
export interface WriteRequest {
    /**
     * 
     * @type {WriteRequestWrites}
     * @memberof WriteRequest
     */
    writes?: WriteRequestWrites;
    /**
     * 
     * @type {WriteRequestDeletes}
     * @memberof WriteRequest
     */
    deletes?: WriteRequestDeletes;
    /**
     * 
     * @type {string}
     * @memberof WriteRequest
     */
    authorization_model_id?: string;
}
/**
 * 
 * @export
 * @interface WriteRequestDeletes
 */
export interface WriteRequestDeletes {
    /**
     * 
     * @type {Array<TupleKeyWithoutCondition>}
     * @memberof WriteRequestDeletes
     */
    tuple_keys: Array<TupleKeyWithoutCondition>;
}
/**
 * 
 * @export
 * @interface WriteRequestWrites
 */
export interface WriteRequestWrites {
    /**
     * 
     * @type {Array<TupleKey>}
     * @memberof WriteRequestWrites
     */
    tuple_keys: Array<TupleKey>;
}

