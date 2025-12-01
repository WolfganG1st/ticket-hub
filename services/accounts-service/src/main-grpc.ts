import path from 'node:path';
import { loadPackageDefinition, Server, ServerCredentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { GetUserByIdUseCase } from './modules/accounts/application/GetUserByIdUseCase';
import { AccountsGrpcController } from './modules/accounts/infra/grpc/AccountsGrpcController';
import type { ProtoGrpcType } from './modules/accounts/infra/grpc/generated/accounts';
import { DrizzleUserRepository } from './modules/accounts/infra/persistence/DrizzleUserRepository';
import { db } from './modules/accounts/infra/persistence/db';

function bootstrapGrpc(): void {
  const protoPath = path.join(__dirname, '../../../infra/proto/accounts.proto');

  const packageDefinition = loadSync(protoPath, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const proto = loadPackageDefinition(packageDefinition) as unknown as ProtoGrpcType;

  const server = new Server();

  const userRepository = new DrizzleUserRepository(db);
  const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
  const controller = new AccountsGrpcController(getUserByIdUseCase);

  server.addService(proto.accounts.v1.AccountsService.service, {
    getUserById: controller.getUserById.bind(controller),
  });

  server.bindAsync('0.0.0.0:50051', ServerCredentials.createInsecure(), () => {
    console.log('gRPC server running on port 50051');
  });
}

bootstrapGrpc();
