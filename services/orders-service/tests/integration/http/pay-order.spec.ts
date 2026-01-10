import { eq } from 'drizzle-orm';
import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { orderOutbox, orders } from '../../../src/infra/persistence/schema';
import { seedEventWithTicketType } from '../../_support/seed';
import { getOrdersTestContext } from '../../_support/setup';

describe('PayOrder (integration)', () => {
  it('should pay an order (PENDING -> PAID) and prevent double payment', async () => {
    const { app, db } = getOrdersTestContext();

    const { eventId, ticketTypeId } = await seedEventWithTicketType(db);
    const customerId = uuidv7();

    // 1. Create Order
    const createRes = await request(app).post('/api/v1/orders').set('x-idempotency-key', 'test-pay-order').send({
      customerId,
      eventId,
      ticketTypeId,
      quantity: 1,
    });
    expect(createRes.status).toBe(201);
    const orderId = createRes.body.orderId;

    // 2. Pay Order
    const payRes = await request(app).post(`/api/v1/orders/${orderId}/pay`).send();
    expect(payRes.status).toBe(200);
    expect(payRes.body.status).toBe('PAID');

    // Verify DB
    const savedOrder = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
    expect(savedOrder?.status).toBe('PAID');

    // 3. Pay Again -> 409
    const payAgainRes = await request(app).post(`/api/v1/orders/${orderId}/pay`).send();
    expect(payAgainRes.status).toBe(409);
    expect(payAgainRes.body).toEqual(
      expect.objectContaining({
        error: 'CONFLICT',
      }),
    );

    // 4. Verify Outbox
    const outboxRow = await db.query.orderOutbox.findFirst({
      where: eq(orderOutbox.aggregateId, orderId),
      orderBy: (outbox, { desc }) => [desc(outbox.createdAt)],
    });

    expect(outboxRow).not.toBeNull();
    expect(outboxRow?.type).toBe('ORDER_PAID');
    expect(outboxRow?.status).toBe('PENDING');
    expect(outboxRow?.payload).toMatchObject({
      eventName: 'OrderPaid',
      orderId: orderId,
    });
  });
});
