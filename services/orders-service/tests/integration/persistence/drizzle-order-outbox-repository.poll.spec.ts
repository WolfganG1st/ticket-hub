import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { DrizzleOrderOutboxRepository } from '../../../src/infra/persistence/DrizzleOrderOutboxRepository';
import { orderOutbox } from '../../../src/infra/persistence/schema';
import { createOrdersTestContext } from '../../_support/context';

describe('DrizzleOrderOutboxRepository (integration) - Poll', () => {
  it('should return only PENDING rows up to batchSize ordered deterministically', async () => {
    const { db } = await createOrdersTestContext();
    const repository = new DrizzleOrderOutboxRepository(db);
    const aggregateId = uuidv7();

    // Insert 3 pending rows
    await repository.enqueue(aggregateId, 'ORDER_CREATED', { i: 1 } as any);
    await repository.enqueue(aggregateId, 'ORDER_CREATED', { i: 2 } as any);
    await repository.enqueue(aggregateId, 'ORDER_CREATED', { i: 3 } as any);

    const pending = await repository.claimPending(2);
    expect(pending).toHaveLength(2);
    expect((pending[0].payload as any).i).toBe(1);
    expect((pending[1].payload as any).i).toBe(2);
  });

  it('should not return SENT/FAILED rows', async () => {
    const { db } = await createOrdersTestContext();
    const repository = new DrizzleOrderOutboxRepository(db);
    const aggregateId = uuidv7();

    await repository.enqueue(aggregateId, 'ORDER_CREATED', {} as any);

    // Manually insert SENT and FAILED
    await db.insert(orderOutbox).values({
      id: uuidv7(),
      aggregateId,
      type: 'Sent',
      payload: {},
      status: 'SENT',
    });
    await db.insert(orderOutbox).values({
      id: uuidv7(),
      aggregateId,
      type: 'Failed',
      payload: {},
      status: 'FAILED',
    });

    const pending = await repository.claimPending(10);
    expect(pending).toHaveLength(1);
    expect(pending[0].type).toBe('ORDER_CREATED');
  });
});
