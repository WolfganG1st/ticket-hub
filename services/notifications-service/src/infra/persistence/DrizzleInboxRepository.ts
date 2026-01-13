import { v7 as uuidv7 } from 'uuid';
import type { InboxRepository } from '../../modules/application/InboxRepository';
import type { Db } from './db';
import { newOrderInboxRowSchema, orderInbox } from './schema';

export class DrizzleInboxRepository implements InboxRepository {
  constructor(private readonly database: Db) {}

  public async tryMarkProcessed(
    idempotencyKey: string,
    meta: { eventName: string; orderId: string },
  ): Promise<boolean> {
    const payload = newOrderInboxRowSchema.parse({
      id: uuidv7(),
      idempotencyKey,
      eventName: meta.eventName,
      orderId: meta.orderId,
      receivedAt: new Date(),
    });

    const result = await this.database
      .insert(orderInbox)
      .values(payload)
      .onConflictDoNothing()
      .returning({ id: orderInbox.id });

    return result.length > 0;
  }
}
