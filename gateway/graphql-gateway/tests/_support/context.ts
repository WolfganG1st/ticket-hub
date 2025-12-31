import { type GatewayEnv, loadGatewayEnv } from '@ticket-hub/config';
import { buildRedisUrlForWorker, getVitestWorkerId } from '@ticket-hub/testkit';
import type { Express } from 'express';
import type { createClient } from 'redis';
import request from 'supertest';
import { makeApp } from '../../src/main';
import { makeRedis } from './redis';

export type GatewayTestContext = {
  env: GatewayEnv;
  app: Express;
  redis: ReturnType<typeof createClient>;
  graphql(
    payload: { query: string; variables?: Record<string, unknown> },
    headers?: Record<string, string>,
  ): Promise<request.Response>;
  reset(): Promise<void>;
  close(): Promise<void>;
};

export async function createGatewayTestContext(): Promise<GatewayTestContext> {
  const env = loadGatewayEnv();
  const workerId = getVitestWorkerId();

  const { redis } = await makeRedis(env, workerId);
  const workerRedisUrl = buildRedisUrlForWorker(env.REDIS_URL, workerId);

  const app = await makeApp({ ...env, REDIS_URL: workerRedisUrl });

  async function reset(): Promise<void> {
    await redis.flushDb();
  }

  async function close(): Promise<void> {
    await redis.quit();
  }

  function graphql(
    payload: { query: string; variables?: Record<string, unknown> },
    headers: Record<string, string> = {},
  ): Promise<request.Response> {
    let req = request(app).post('/graphql');

    for (const [key, value] of Object.entries(headers)) {
      req = req.set(key, value);
    }

    return req.send(payload);
  }

  return {
    env,
    app,
    redis,
    graphql,
    reset,
    close,
  };
}
