import { fromPartial } from '@total-typescript/shoehorn';
import { eq } from 'drizzle-orm';
import type { Producer, RecordMetadata } from 'kafkajs';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import { processOutboxBatch } from '../../../src/infra/outbox/OrderOutboxWorker';
import { DrizzleOrderOutboxRepository } from '../../../src/infra/persistence/DrizzleOrderOutboxRepository';
import { orderOutbox } from '../../../src/infra/persistence/schema';
import { getOrdersTestContext } from '../../_support/setup';

describe('OrderOutboxWorker (component)', () => {
  it('should process a batch of pending entries and mark them as SENT', async () => {
    const { db } = getOrdersTestContext();
    const outboxRepository = new DrizzleOrderOutboxRepository(db);
    const sentMessages: { topic: string; key: string; value: string }[] = [];

    const fakeProducer = fromPartial<Producer>({
      send: vi.fn((input: any) => {
        for (const msg of input.messages) {
          sentMessages.push({ topic: input.topic, key: msg.key, value: msg.value });
        }
        return Promise.resolve([] as RecordMetadata[]);
      }),
    });

    // Insert 2 pending rows
    const id1 = uuidv7();
    const id2 = uuidv7();
    const aggregateId1 = uuidv7();
    const aggregateId2 = uuidv7();

    await db.insert(orderOutbox).values([
      {
        id: id1,
        aggregateId: aggregateId1,
        type: 'OrderCreated',
        payload: { orderId: '1' },
        status: 'PENDING',
      },
      {
        id: id2,
        aggregateId: aggregateId2,
        type: 'OrderCreated',
        payload: { orderId: '2' },
        status: 'PENDING',
      },
    ]);

    await processOutboxBatch({
      outboxRepository,
      producer: fakeProducer,
      topic: 'orders-topic',
      batchSize: 50,
    });

    // Verify messages sent
    expect(sentMessages).toHaveLength(2);
    expect(sentMessages[0]).toEqual({
      topic: 'orders-topic',
      key: aggregateId1,
      value: JSON.stringify({ orderId: '1' }),
    });
    expect(sentMessages[1]).toEqual({
      topic: 'orders-topic',
      key: aggregateId2,
      value: JSON.stringify({ orderId: '2' }),
    });

    // Verify status updated to SENT
    const row1 = await db.query.orderOutbox.findFirst({ where: eq(orderOutbox.id, id1) });
    const row2 = await db.query.orderOutbox.findFirst({ where: eq(orderOutbox.id, id2) });

    expect(row1?.status).toBe('SENT');
    expect(row2?.status).toBe('SENT');
  });

  it('should mark entries as FAILED if producer throws', async () => {
    const { db } = getOrdersTestContext();
    const outboxRepository = new DrizzleOrderOutboxRepository(db);

    const fakeProducer = fromPartial<Producer>({
      send: vi.fn(() => {
        throw new Error('Kafka error');
      }),
    });

    // Insert 1 pending row
    const id = uuidv7();
    const aggregateId = uuidv7();

    await db.insert(orderOutbox).values({
      id,
      aggregateId,
      type: 'OrderCreated',
      payload: { orderId: '3' },
      status: 'PENDING',
    });

    await processOutboxBatch({
      outboxRepository,
      producer: fakeProducer,
      topic: 'orders-topic',
      batchSize: 50,
    });

    // Verify status updated to FAILED
    const row = await db.query.orderOutbox.findFirst({ where: eq(orderOutbox.id, id) });

    expect(row?.status).toBe('FAILED');
    expect(row?.errorMessage).toBe('Kafka error');
  });
});
