import type { OrdersEnv } from '@ticket-hub/config';
import { buildRedisUrlForWorker } from '@ticket-hub/testkit';
import { RedisDistributedLock } from '../../src/infra/redis/DistributedLock';
import { createRedisClient } from '../../src/infra/redis/redis-client';

export async function makeRedis(env: OrdersEnv, workerId: number) {
  const redisUrl = buildRedisUrlForWorker(env.REDIS_URL, workerId);
  const redis = await createRedisClient(redisUrl);
  const lock = new RedisDistributedLock(redis);
  return { redis, lock };
}
