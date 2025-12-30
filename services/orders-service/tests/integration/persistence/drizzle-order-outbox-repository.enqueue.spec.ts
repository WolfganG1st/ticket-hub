import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { DrizzleOrderOutboxRepository } from '../../../src/infra/persistence/DrizzleOrderOutboxRepository';
import { orderOutbox } from '../../../src/infra/persistence/schema';
import { createOrdersTestContext } from '../../_support/context';

describe('DrizzleOrderOutboxRepository (integration) - Enqueue', () => {
  it('should enqueue with default status PENDING and generated id', async () => {
    const { db } = await createOrdersTestContext();
    const repository = new DrizzleOrderOutboxRepository(db);
    const aggregateId = uuidv7();
    const type = 'ORDER_CREATED';
    const payload = { foo: 'bar' };

    await repository.enqueue(aggregateId, type, payload as any);

    const rows = await db.select().from(orderOutbox).where(eq(orderOutbox.aggregateId, aggregateId));
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe('PENDING');
    expect(rows[0].id).toBeDefined();
    expect(rows[0].type).toBe(type);
  });

  it('should persist payload as json and type correctly', async () => {
    const { db } = await createOrdersTestContext();
    const repository = new DrizzleOrderOutboxRepository(db);
    const aggregateId = uuidv7();
    const payload = { some: 'data', nested: { value: 123 } };

    await repository.enqueue(aggregateId, 'ORDER_CREATED', payload as any);

    const rows = await db.select().from(orderOutbox).where(eq(orderOutbox.aggregateId, aggregateId));
    expect(rows[0].payload).toEqual(payload);
  });
});
