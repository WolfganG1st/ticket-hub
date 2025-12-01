import { ValidationError } from 'shared-kernel';
import type { GetUserByIdUseCase } from '../../application/GetUserByIdUseCase';
import type { GetUserByIdRequest } from './generated/accounts/v1/GetUserByIdRequest';
import type { GetUserByIdResponse } from './generated/accounts/v1/GetUserByIdResponse';
import { safeGrpcHandler } from './utils/safe-grpc-handler';

export class AccountsGrpcController {
  constructor(private readonly getUserByIdUseCase: GetUserByIdUseCase) {}

  public getUserById = safeGrpcHandler<GetUserByIdRequest, GetUserByIdResponse>(async (call) => {
    const { id } = call.request;
    if (!id) {
      throw new ValidationError('User ID is required');
    }
    const result = await this.getUserByIdUseCase.execute({ userId: id });

    return {
      id: result.id,
      name: result.name,
      email: result.email,
    };
  });
}
