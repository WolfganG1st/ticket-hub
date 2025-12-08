import { createClient, type RedisClientType } from 'redis';
import { logger } from 'shared-kernel';

export async function createRedisClient(url: string): Promise<RedisClientType> {
  const client: RedisClientType = createClient({ url });

  client.on('error', (err) => {
    logger.error('Redis error:', err);
  });

  await client.connect();

  return client;
}
