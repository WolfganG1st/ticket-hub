import type { GrpcUser } from 'shared-kernel';

export interface AccountsClient {
  getUserById(userId: string): Promise<GrpcUser | null>;
}
