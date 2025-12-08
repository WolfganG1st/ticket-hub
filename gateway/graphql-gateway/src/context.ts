import type { RedisCache } from './infra/redis-cache';
import type { AccountsApi, AccountUser } from './services/accounts-api';
import type { OrdersApi } from './services/orders-api';

export type GraphQlContext = {
  authToken: string | null;
  accountsApi: AccountsApi;
  ordersApi: OrdersApi;
  cache: RedisCache;
  currentUserPromise: Promise<AccountUser | null>;
  idempotencyKey?: string | null;
};
