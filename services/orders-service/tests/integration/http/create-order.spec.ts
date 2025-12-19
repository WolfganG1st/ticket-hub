import { eq } from 'drizzle-orm';
import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { orderOutbox, orders, ticketTypes } from '../../../src/infra/persistence/schema';
import { seedEventWithTicketType } from '../../_support/seed';
import { getOrdersTestContext } from '../../_support/setup';

describe('CreateOrder (integration)', () => {
  it('should create an order and persist it', async () => {
    const { app, db } = getOrdersTestContext();

    const { eventId, ticketTypeId } = await seedEventWithTicketType(db, { remaining: 10 });

    const customerId = uuidv7();

    const response = await request(app).post('/api/v1/orders').set('x-idempotency-key', 'test-key-1').send({
      customerId,
      eventId,
      ticketTypeId,
      quantity: 2,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('orderId');
    expect(response.body.totalPriceInCents).toBe(2000);

    const savedOrder = await db.query.orders.findFirst({
      where: eq(orders.id, response.body.orderId as string),
    });

    expect(savedOrder).not.toBeNull();
    expect(savedOrder?.status).toBe('PENDING');

    const savedTicketType = await db.query.ticketTypes.findFirst({
      where: eq(ticketTypes.id, ticketTypeId),
    });

    expect(savedTicketType?.remainingQuantity).toBe(8);

    const outboxRow = await db.query.orderOutbox.findFirst({
      where: eq(orderOutbox.aggregateId, response.body.orderId as string),
    });

    expect(outboxRow).not.toBeNull();
    expect(outboxRow?.status).toBe('PENDING');
  });

  it('should be idempotent (same key => same orderId, no duplicate outbox, no double stock decrement)', async () => {
    const { app, db } = getOrdersTestContext();

    const { eventId, ticketTypeId } = await seedEventWithTicketType(db, { remaining: 10 });

    const customerId = uuidv7();
    const idemKey = 'test-idem-1';

    const body = {
      customerId,
      eventId,
      ticketTypeId,
      quantity: 2,
    };

    const r1 = await request(app).post('/api/v1/orders').set('x-idempotency-key', idemKey).send(body);
    expect(r1.status).toBe(201);

    const r2 = await request(app).post('/api/v1/orders').set('x-idempotency-key', idemKey).send(body);
    expect(r2.status).toBe(201);

    expect(r2.body.orderId).toBe(r1.body.orderId);
    expect(r2.body.totalPriceInCents).toBe(2000);

    // check if only one order was created
    const ordersWithKey = await db.select().from(orders).where(eq(orders.idempotencyKey, idemKey));
    expect(ordersWithKey).toHaveLength(1);

    // check if only one outbox row was created
    const outboxRows = await db
      .select()
      .from(orderOutbox)
      .where(eq(orderOutbox.aggregateId, r1.body.orderId as string));
    expect(outboxRows).toHaveLength(1);
    expect(outboxRows[0]?.status).toBe('PENDING');

    // check if stock was decremented only once
    const savedTicketType = await db.query.ticketTypes.findFirst({
      where: eq(ticketTypes.id, ticketTypeId),
    });
    expect(savedTicketType?.remainingQuantity).toBe(8);
  });
});
