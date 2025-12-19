import type { OrdersEnv } from '@ticket-hub/config';
import express from 'express';
import type { AccountsClient } from '../../src/infra/accounts/AccountsClient.port';
import { buildOrderRouter } from '../../src/infra/http/orders-routes';
import { globalErrorHandler } from '../../src/infra/http/utils/global-error-handler';
import type { RedisDistributedLock } from '../../src/infra/redis/DistributedLock';
import type { OrdersDb } from './db';

export function makeApp(db: OrdersDb, env: OrdersEnv, accountsClient: AccountsClient, lock: RedisDistributedLock) {
  const app = express();
  app.use(express.json());
  app.use('/api/v1', buildOrderRouter(db, env, accountsClient, lock));
  app.use(globalErrorHandler);
  return app;
}
