import type { OrdersEnv } from '@ticket-hub/config';
import express, { type Express } from 'express';
import { loggerMiddleware } from 'shared-kernel';
import type { AccountsClient } from '../accounts/AccountsClient.port';
import type { Db } from '../persistence/db';
import type { RedisDistributedLock } from '../redis/DistributedLock';
import { buildOrderRouter } from './orders-routes';
import { globalErrorHandler } from './utils/global-error-handler';

export function makeApp(db: Db, env: OrdersEnv, accountsClient: AccountsClient, lock: RedisDistributedLock): Express {
  const app = express();
  app.use(express.json());
  app.use(loggerMiddleware);

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK' });
  });

  app.use('/api/v1', buildOrderRouter(db, env, accountsClient, lock));

  app.use(globalErrorHandler);

  return app;
}
