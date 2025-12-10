import { createClient, type RedisClientType } from 'redis';
import { logger } from 'shared-kernel';

export async function createRedisClient(redisUrl: string): Promise<RedisClientType> {
  const client: RedisClientType = createClient({ url: redisUrl });

  client.on('error', (err) => {
    logger.error(`Redis error ${err}`);
  });

  await client.connect();

  return client;
}

export class RedisCache {
  constructor(
    private readonly client: RedisClientType,
    private readonly defaultTtlInSeconds: number = 60,
  ) {}

  public async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  }

  public async set<T>(key: string, value: T, ttlInSeconds?: number): Promise<void> {
    const payload = JSON.stringify(value);
    const ttl = ttlInSeconds ?? this.defaultTtlInSeconds;
    await this.client.set(key, payload, { EX: ttl });
  }

  public async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}
