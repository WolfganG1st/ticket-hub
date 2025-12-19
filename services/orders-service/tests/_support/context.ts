import { loadOrdersEnv, type OrdersEnv } from '@ticket-hub/config';
import { getVitestWorkerId } from '@ticket-hub/testkit';
import type { Express } from 'express';
import type { Pool } from 'pg';
import type { RedisClientType } from 'redis';
import { makeAccountsClient } from './builders';
import { clearDb, closeDb, makeDb, type OrdersDb } from './db';
import { makeApp } from './http';
import { makeRedis } from './redis';

export type { OrdersDb };

export type OrdersTestContext = {
  env: OrdersEnv;
  app: Express;
  db: OrdersDb;
  pool: Pool;
  redis: RedisClientType;
  reset(): Promise<void>;
  close(): Promise<void>;
};

export async function createOrdersTestContext(): Promise<OrdersTestContext> {
  const env = loadOrdersEnv();

  const workerId = getVitestWorkerId();
  const { pool, db, schemaName } = await makeDb(env, workerId);

  const { redis, lock } = await makeRedis(env, workerId);

  const accountsClient = makeAccountsClient();
  const app = makeApp(db, env, accountsClient, lock);

  async function reset(): Promise<void> {
    await redis.flushDb();
    await clearDb(pool, schemaName);
  }

  async function close(): Promise<void> {
    await redis.quit();
    await closeDb(pool);
  }

  return {
    env,
    app,
    db,
    pool,
    redis,
    reset,
    close,
  };
}
