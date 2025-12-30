import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { DrizzleOrderOutboxRepository } from '../../../src/infra/persistence/DrizzleOrderOutboxRepository';
import { orderOutbox } from '../../../src/infra/persistence/schema';
import { createOrdersTestContext } from '../../_support/context';

describe('DrizzleOrderOutboxRepository (integration) - Mark As Failed', () => {
  it('should set status FAILED, processedAt and errorMessage', async () => {
    const { db } = await createOrdersTestContext();
    const repository = new DrizzleOrderOutboxRepository(db);
    const aggregateId = uuidv7();

    await repository.enqueue(aggregateId, 'ORDER_CREATED', {} as any);
    const [pending] = await repository.findPending(1);

    const errorMsg = 'Something went wrong';
    await repository.markAsFailed(pending.id, errorMsg);

    const [row] = await db.select().from(orderOutbox).where(eq(orderOutbox.id, pending.id));
    expect(row.status).toBe('FAILED');
    expect(row.processedAt).not.toBeNull();
    expect(row.errorMessage).toBe(errorMsg);
  });

  it('should not overwrite payload when failing', async () => {
    const { db } = await createOrdersTestContext();
    const repository = new DrizzleOrderOutboxRepository(db);
    const aggregateId = uuidv7();
    const payload = { data: 'important' };

    await repository.enqueue(aggregateId, 'ORDER_CREATED', payload as any);
    const [pending] = await repository.findPending(1);

    await repository.markAsFailed(pending.id, 'Error');

    const [row] = await db.select().from(orderOutbox).where(eq(orderOutbox.id, pending.id));
    expect(row.payload).toEqual(payload);
  });
});
