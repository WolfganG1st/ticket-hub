import process from 'node:process';
import type { RedisClientType } from 'redis';

export interface DistributedLock {
  acquire(key: string, timeoutMs: number): Promise<boolean>;
  release(key: string): Promise<void>;
}

export class RedisDistributedLock implements DistributedLock {
  constructor(private readonly client: RedisClientType) {}

  private readonly lockValues = new Map<string, string>();

  public async acquire(key: string, ttlMs: number): Promise<boolean> {
    const lockValue = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const result = await this.client.set(key, lockValue, {
      PX: ttlMs,
      NX: true,
    });

    if (result === 'OK') {
      this.lockValues.set(key, lockValue);
      return true;
    }

    return false;
  }

  public async release(key: string): Promise<void> {
    const lockValue = this.lockValues.get(key);

    if (!lockValue) {
      return;
    }

    const script = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;

    try {
      await this.client.eval(script, {
        keys: [key],
        arguments: [lockValue],
      });
    } finally {
      this.lockValues.delete(key);
    }
  }
}
