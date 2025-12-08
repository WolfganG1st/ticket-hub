import process from 'node:process';
import type { RedisClientType } from 'redis';

export interface DistributedLock {
  acquire(key: string, timeoutMs: number): Promise<boolean>;
  release(key: string): Promise<void>;
}

export class RedisDistributedLock implements DistributedLock {
  constructor(private readonly client: RedisClientType) {}

  public async acquire(key: string, ttlMs: number): Promise<boolean> {
    const lockValue = `${process.pid}-${Date.now()}`;

    const result = await this.client.set(key, lockValue, {
      PX: ttlMs,
      NX: true,
    });

    return result === 'OK';
  }

  public async release(key: string): Promise<void> {
    await this.client.del(key);
  }
}
