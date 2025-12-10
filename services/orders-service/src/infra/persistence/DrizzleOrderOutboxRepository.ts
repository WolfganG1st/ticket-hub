import { and, eq } from 'drizzle-orm';
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
      aggregateId,
      type,
      payload,
    });

    await this.database.insert(orderOutbox).values(row);
  }

  public async findPending(batchSize: number) {
    const rows = await this.database
      .select()
      .from(orderOutbox)
      .where(eq(orderOutbox.status, 'PENDING'))
      .orderBy(orderOutbox.createdAt)
      .limit(batchSize);

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
      .where(and(eq(orderOutbox.id, id), eq(orderOutbox.status, 'PENDING')));
  }

  public async markAsFailed(id: string): Promise<void> {
    await this.database
      .update(orderOutbox)
      .set({ status: 'FAILED', processedAt: new Date() })
      .where(eq(orderOutbox.id, id));
  }
}
