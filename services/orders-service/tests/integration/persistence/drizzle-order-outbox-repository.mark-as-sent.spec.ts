import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { DrizzleOrderOutboxRepository } from '../../../src/infra/persistence/DrizzleOrderOutboxRepository';
import { orderOutbox } from '../../../src/infra/persistence/schema';
import { createOrdersTestContext } from '../../_support/context';

describe('DrizzleOrderOutboxRepository (integration) - Mark As Sent', () => {
  it('should set status SENT and processedAt', async () => {
    const { db } = await createOrdersTestContext();
    const repository = new DrizzleOrderOutboxRepository(db);
    const aggregateId = uuidv7();

    await repository.enqueue(aggregateId, 'ORDER_CREATED', {} as any);
    const [pending] = await repository.claimPending(1);

    await repository.markAsSent(pending.id);

    const [row] = await db.select().from(orderOutbox).where(eq(orderOutbox.id, pending.id));
    expect(row.status).toBe('SENT');
    expect(row.processedAt).not.toBeNull();
  });

  it('should be idempotent if called twice', async () => {
    const { db } = await createOrdersTestContext();
    const repository = new DrizzleOrderOutboxRepository(db);
    const aggregateId = uuidv7();

    await repository.enqueue(aggregateId, 'ORDER_CREATED', {} as any);
    const [pending] = await repository.claimPending(1);

    await repository.markAsSent(pending.id);
    const firstProcessedAt = (await db.select().from(orderOutbox).where(eq(orderOutbox.id, pending.id)))[0].processedAt;

    // Call again
    await repository.markAsSent(pending.id);
    const secondRow = (await db.select().from(orderOutbox).where(eq(orderOutbox.id, pending.id)))[0];

    expect(secondRow.status).toBe('SENT');
    expect(secondRow.processedAt).toEqual(firstProcessedAt);
  });
});
