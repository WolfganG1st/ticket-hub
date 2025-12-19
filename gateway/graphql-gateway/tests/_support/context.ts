import { type GatewayEnv, loadGatewayEnv } from '@ticket-hub/config';
import { getVitestWorkerId } from '@ticket-hub/testkit';
import type { Express } from 'express';
import type { RedisClientType } from 'redis';
import { makeApp } from '../../src/main';
import { makeRedis } from './redis';

export type GatewayTestContext = {
  env: GatewayEnv;
  app: Express;
  redis: RedisClientType;
  reset(): Promise<void>;
  close(): Promise<void>;
};

export async function createGatewayTestContext(): Promise<GatewayTestContext> {
  const env = loadGatewayEnv();
  const workerId = getVitestWorkerId();

  const { redis } = await makeRedis(env, workerId);

  const app = await makeApp(env);

  async function reset(): Promise<void> {
    await redis.flushDb();
  }

  async function close(): Promise<void> {
    await redis.quit();
  }

  return {
    env,
    app,
    redis,
    reset,
    close,
  };
}
