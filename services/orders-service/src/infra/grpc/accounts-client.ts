import path from 'node:path';
import { type ChannelCredentials, type ClientOptions, credentials, loadPackageDefinition } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import type { GrpcUser } from 'shared-kernel';

type AccountsGrpcPackage = {
  accounts: {
    v1: {
      AccountsService: new (
        address: string,
        creds: ChannelCredentials,
        options?: ClientOptions,
      ) => AccountsServiceClient;
    };
  };
};

type AccountsServiceClient = {
  getUserById(
    request: { id: string },
    callback: (
      error: Error | null,
      response?: {
        id: string;
        name: string;
        email: string;
        role: string;
      },
    ) => void,
  ): Promise<void>;
};

export type AccountsGrpcConfig = {
  url: string;
  timeoutMs: number;
  maxRetries: number;
};

export class AccountsGrpcClient {
  private readonly client: AccountsServiceClient;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(config: AccountsGrpcConfig) {
    const protoPath = path.join(__dirname, '../../../../infra/proto/accounts.proto');
    const packageDefinition = loadSync(protoPath, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const grpcPackage = loadPackageDefinition(packageDefinition) as unknown as AccountsGrpcPackage;

    this.client = new grpcPackage.accounts.v1.AccountsService(config.url, credentials.createInsecure());
    this.timeoutMs = config.timeoutMs;
    this.maxRetries = config.maxRetries;
  }

  public async getUserById(userId: string): Promise<GrpcUser | null> {
    return await this.callWithRetry<GrpcUser | null, { id: string; name: string; email: string; role: string }>(
      'getUserById',
      { id: userId },
      (response) => {
        if (!response) {
          return null;
        }
        return {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role as GrpcUser['role'],
        };
      },
    );
  }

  private async callWithRetry<TResponse, TWire = unknown>(
    methodName: keyof AccountsServiceClient,
    request: object,
    mapResponse: (wire: TWire | undefined) => TResponse,
  ): Promise<TResponse> {
    let attempt = 0;

    while (true) {
      try {
        const response = await this.callOnce<TWire>(methodName, request);
        return mapResponse(response);
      } catch (error) {
        attempt++;
        const isLast = attempt > this.maxRetries;
        const isTimeout = (error as Error)?.message?.includes('Deadline');

        if (isLast || !isTimeout) {
          throw error;
        }

        const backoffMs = 50 * attempt;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  private async callOnce<TWire>(methodName: keyof AccountsServiceClient, request: object): Promise<TWire | undefined> {
    return await new Promise<TWire | undefined>((resolve, reject) => {
      const deadline = new Date(Date.now() + this.timeoutMs);

      const method = this.client[methodName] as (
        req: unknown,
        callback: (err: Error | null, res?: TWire) => void,
      ) => void;

      method({ ...request, deadline }, (err: Error | null, res?: TWire) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
  }
}
