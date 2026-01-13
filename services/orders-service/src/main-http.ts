import process from 'node:process';
import { loadOrdersEnv } from '@ticket-hub/config';
import { Pool } from 'pg';
import { logger } from 'shared-kernel';
import { AccountsGrpcClient } from './infra/grpc/accounts-client';
import { makeApp } from './infra/http/app';
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

  const app = makeApp(db, env, accountsClient, lock);

  app.listen(env.PORT, () => {
    logger.info(`Orders service listening on port ${env.PORT}`);
  });
}

bootstrapHttp().catch((error) => {
  logger.error(error, 'Failed to start Orders service');
  process.exit(1);
});
