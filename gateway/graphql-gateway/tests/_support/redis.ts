import type { GatewayEnv } from '@ticket-hub/config';
import { buildRedisUrlForWorker } from '@ticket-hub/testkit';
import { createClient } from 'redis';

export async function makeRedis(env: GatewayEnv, workerId: number) {
  const redisUrl = buildRedisUrlForWorker(env.REDIS_URL, workerId);
  const redis = createClient({ url: redisUrl });
  await redis.connect();
  return { redis };
}
