// Original file: ../../infra/proto/accounts.proto

import type * as grpc from '@grpc/grpc-js';
import type { MethodDefinition } from '@grpc/proto-loader';
import type {
  GetUserByIdRequest as _accounts_v1_GetUserByIdRequest,
  GetUserByIdRequest__Output as _accounts_v1_GetUserByIdRequest__Output,
} from '../../accounts/v1/GetUserByIdRequest';
import type {
  GetUserByIdResponse as _accounts_v1_GetUserByIdResponse,
  GetUserByIdResponse__Output as _accounts_v1_GetUserByIdResponse__Output,
} from '../../accounts/v1/GetUserByIdResponse';

export interface AccountsServiceClient extends grpc.Client {
  GetUserById(
    argument: _accounts_v1_GetUserByIdRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_accounts_v1_GetUserByIdResponse__Output>,
  ): grpc.ClientUnaryCall;
  GetUserById(
    argument: _accounts_v1_GetUserByIdRequest,
    metadata: grpc.Metadata,
    callback: grpc.requestCallback<_accounts_v1_GetUserByIdResponse__Output>,
  ): grpc.ClientUnaryCall;
  GetUserById(
    argument: _accounts_v1_GetUserByIdRequest,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_accounts_v1_GetUserByIdResponse__Output>,
  ): grpc.ClientUnaryCall;
  GetUserById(
    argument: _accounts_v1_GetUserByIdRequest,
    callback: grpc.requestCallback<_accounts_v1_GetUserByIdResponse__Output>,
  ): grpc.ClientUnaryCall;
  getUserById(
    argument: _accounts_v1_GetUserByIdRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_accounts_v1_GetUserByIdResponse__Output>,
  ): grpc.ClientUnaryCall;
  getUserById(
    argument: _accounts_v1_GetUserByIdRequest,
    metadata: grpc.Metadata,
    callback: grpc.requestCallback<_accounts_v1_GetUserByIdResponse__Output>,
  ): grpc.ClientUnaryCall;
  getUserById(
    argument: _accounts_v1_GetUserByIdRequest,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_accounts_v1_GetUserByIdResponse__Output>,
  ): grpc.ClientUnaryCall;
  getUserById(
    argument: _accounts_v1_GetUserByIdRequest,
    callback: grpc.requestCallback<_accounts_v1_GetUserByIdResponse__Output>,
  ): grpc.ClientUnaryCall;
}

export interface AccountsServiceHandlers extends grpc.UntypedServiceImplementation {
  GetUserById: grpc.handleUnaryCall<_accounts_v1_GetUserByIdRequest__Output, _accounts_v1_GetUserByIdResponse>;
}

export interface AccountsServiceDefinition extends grpc.ServiceDefinition {
  GetUserById: MethodDefinition<
    _accounts_v1_GetUserByIdRequest,
    _accounts_v1_GetUserByIdResponse,
    _accounts_v1_GetUserByIdRequest__Output,
    _accounts_v1_GetUserByIdResponse__Output
  >;
}
