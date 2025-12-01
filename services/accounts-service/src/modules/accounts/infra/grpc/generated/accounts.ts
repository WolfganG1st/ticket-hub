import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { AccountsServiceClient as _accounts_v1_AccountsServiceClient, AccountsServiceDefinition as _accounts_v1_AccountsServiceDefinition } from './accounts/v1/AccountsService';
import type { GetUserByIdRequest as _accounts_v1_GetUserByIdRequest, GetUserByIdRequest__Output as _accounts_v1_GetUserByIdRequest__Output } from './accounts/v1/GetUserByIdRequest';
import type { GetUserByIdResponse as _accounts_v1_GetUserByIdResponse, GetUserByIdResponse__Output as _accounts_v1_GetUserByIdResponse__Output } from './accounts/v1/GetUserByIdResponse';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  accounts: {
    v1: {
      AccountsService: SubtypeConstructor<typeof grpc.Client, _accounts_v1_AccountsServiceClient> & { service: _accounts_v1_AccountsServiceDefinition }
      GetUserByIdRequest: MessageTypeDefinition<_accounts_v1_GetUserByIdRequest, _accounts_v1_GetUserByIdRequest__Output>
      GetUserByIdResponse: MessageTypeDefinition<_accounts_v1_GetUserByIdResponse, _accounts_v1_GetUserByIdResponse__Output>
    }
  }
}

