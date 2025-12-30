import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { GetUserByIdUseCase } from '../../../src/modules/accounts/application/GetUserByIdUseCase';
import { User } from '../../../src/modules/accounts/domain/User';
import { AccountsGrpcController } from '../../../src/modules/accounts/infra/grpc/AccountsGrpcController';
import { DrizzleUserRepository } from '../../../src/modules/accounts/infra/persistence/DrizzleUserRepository';
import { getAccountsTestContext } from '../../_support/setup';

describe('Accounts gRPC (component) - GetUserById', () => {
  it('should return user for existing id', async () => {
    const { db } = getAccountsTestContext();
    const repository = new DrizzleUserRepository(db);
    const useCase = new GetUserByIdUseCase(repository);
    const controller = new AccountsGrpcController(useCase);

    const user = new User(uuidv7(), 'gRPC User', 'grpc@example.com', 'CUSTOMER', 'hash', new Date());
    await repository.save(user);

    const call = {
      request: { id: user.id },
    } as any;

    const response = await new Promise<any>((resolve, reject) => {
      controller.getUserById(call, (err, res) => {
        if (err) {
          reject(err);
        }

        resolve(res);
      });
    });

    expect(response.id).toBe(user.id);
    expect(response.name).toBe(user.name);
    expect(response.email).toBe(user.email);
    expect(response.role).toBe(user.role);
  });

  it('should return null/not found for unknown id', async () => {
    const { db } = getAccountsTestContext();
    const repository = new DrizzleUserRepository(db);
    const useCase = new GetUserByIdUseCase(repository);
    const controller = new AccountsGrpcController(useCase);

    const call = {
      request: { id: uuidv7() },
    } as any;

    const error: any = await new Promise((resolve) => {
      controller.getUserById(call, (err) => {
        resolve(err);
      });
    });

    expect(error.message).toContain('User not found');
  });
});
