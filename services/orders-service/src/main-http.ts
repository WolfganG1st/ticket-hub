import process from 'node:process';
import { loadOrdersEnv } from '@ticket-hub/config';
import express from 'express';
import { Pool } from 'pg';
import { logger, loggerMiddleware } from 'shared-kernel';
import { AccountsGrpcClient } from './infra/grpc/accounts-client';
import { buildOrderRouter } from './infra/http/orders-routes';
import { globalErrorHandler } from './infra/http/utils/global-error-handler';
import { createDb } from './infra/persistence/db';
import { RedisDistributedLock } from './infra/redis/DistributedLock';
import { createRedisClient } from './infra/redis/redis-client';

async function bootstrapHttp(): Promise<void> {
  const env = loadOrdersEnv();
  const pool = new Pool({
    connectionString: env.ORDERS_DATABASE_URL,
  });
  const db = createDb(pool);
  const redis = await createRedisClient(env.REDIS_URL);
  const lock = new RedisDistributedLock(redis);

  const accountsClient = new AccountsGrpcClient({
    url: env.ACCOUNTS_GRPC_URL,
    timeoutMs: 500,
    maxRetries: 2,
  });

  const app = express();
  app.use(express.json());
  app.use(loggerMiddleware);

  app.use('/api/v1', buildOrderRouter(db, env, accountsClient, lock));

  app.use(globalErrorHandler);

  app.listen(env.PORT, () => {
    logger.info(`Orders service listening on port ${env.PORT}`);
  });
}

bootstrapHttp().catch((error) => {
  logger.error(`Failed to start Orders service, ${error}`);
  process.exit(1);
});
