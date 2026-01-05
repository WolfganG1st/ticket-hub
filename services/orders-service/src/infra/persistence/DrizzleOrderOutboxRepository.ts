import { and, eq, inArray } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import type {
  OrderOutboxPayload,
  OrderOutboxRepository,
  OrderOutboxType,
} from '../../modules/orders/application/OrderOutboxRepository';
import type { Db } from './db';
import { newOrderOutboxRowSchema, orderOutbox, orderOutboxRowSchema } from './schema';

export class DrizzleOrderOutboxRepository implements OrderOutboxRepository {
  constructor(private readonly database: Db) {}

  public async enqueue(aggregateId: string, type: OrderOutboxType, payload: OrderOutboxPayload) {
    const row = newOrderOutboxRowSchema.parse({
      id: uuidv7(),
      aggregateId,
      type,
      payload,
      status: 'PENDING',
    });

    await this.database.insert(orderOutbox).values(row);
  }

  public async claimPending(batchSize: number) {
    // select ids of pending outbox entries
    const idsSubquery = await this.database
      .select({ id: orderOutbox.id })
      .from(orderOutbox)
      .where(eq(orderOutbox.status, 'PENDING'))
      .orderBy(orderOutbox.createdAt)
      .limit(batchSize);

    // update status to processing
    const rows = await this.database
      .update(orderOutbox)
      .set({ status: 'PROCESSING' })
      .where(
        and(
          eq(orderOutbox.status, 'PENDING'),
          inArray(
            orderOutbox.id,
            idsSubquery.map((id) => id.id),
          ),
        ),
      )
      .returning();

    return rows.map((row) => {
      const parsed = orderOutboxRowSchema.parse(row);
      return {
        id: parsed.id,
        aggregateId: parsed.aggregateId,
        type: parsed.type as OrderOutboxType,
        payload: parsed.payload as OrderOutboxPayload,
        createdAt: parsed.createdAt,
      };
    });
  }

  public async markAsSent(id: string): Promise<void> {
    await this.database
      .update(orderOutbox)
      .set({ status: 'SENT', processedAt: new Date() })
      .where(and(eq(orderOutbox.id, id), eq(orderOutbox.status, 'PROCESSING')));
  }

  public async markAsFailed(id: string, errorMessage?: string): Promise<void> {
    await this.database
      .update(orderOutbox)
      .set({ status: 'FAILED', processedAt: new Date(), errorMessage: errorMessage ?? null })
      .where(and(eq(orderOutbox.id, id), eq(orderOutbox.status, 'PROCESSING')));
  }
}
