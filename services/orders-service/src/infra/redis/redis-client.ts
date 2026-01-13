import { createClient, type RedisClientType } from 'redis';
import { logger } from 'shared-kernel';

export async function createRedisClient(url: string): Promise<RedisClientType> {
  const client: RedisClientType = createClient({ url });

  client.on('error', (error) => {
    logger.error(error, 'Redis error');
  });

  await client.connect();

  return client;
}
