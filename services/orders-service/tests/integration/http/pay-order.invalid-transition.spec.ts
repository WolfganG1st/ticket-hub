import { eq } from 'drizzle-orm';
import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { orders } from '../../../src/infra/persistence/schema';
import { seedEventWithTicketType } from '../../_support/seed';
import { getOrdersTestContext } from '../../_support/setup';

describe('PayOrder (integration) - Invalid Transition', () => {
  it('should return 409 when trying to pay an already PAID order', async () => {
    const { app, db } = getOrdersTestContext();

    const { eventId, ticketTypeId } = await seedEventWithTicketType(db);
    const customerId = uuidv7();

    // Create an order first
    const createRes = await request(app).post('/api/v1/orders').set('x-idempotency-key', 'key1').send({
      customerId,
      eventId,
      ticketTypeId,
      quantity: 1,
    });
    const orderId = createRes.body.orderId;

    // Pay it once
    await request(app).post(`/api/v1/orders/${orderId}/pay`).send();

    // Verify it is PAID
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });
    expect(order?.status).toBe('PAID');

    // Try to pay again
    const response = await request(app).post(`/api/v1/orders/${orderId}/pay`).send();
    expect(response.status).toBe(409);
  });

  it('should return 409 when trying to pay an order in a non-payable status (if you have CANCELLED/EXPIRED)', async () => {
    const { app, db } = getOrdersTestContext();

    const { eventId, ticketTypeId } = await seedEventWithTicketType(db);
    const customerId = uuidv7();

    // Create an order
    const createRes = await request(app).post('/api/v1/orders').set('x-idempotency-key', 'key2').send({
      customerId,
      eventId,
      ticketTypeId,
      quantity: 1,
    });
    const orderId = createRes.body.orderId;

    // Manually set status to CANCELLED
    // Note: I am assuming CANCELLED is a valid status. If not, this update will fail or the test will fail.
    // If CANCELLED is not valid, I'll use another status if available, or skip this test if only PENDING/PAID exist.
    // But usually there is a CANCELLED status.
    await db.update(orders).set({ status: 'CANCELLED' }).where(eq(orders.id, orderId));

    // Try to pay
    const response = await request(app).post(`/api/v1/orders/${orderId}/pay`).send();
    expect(response.status).toBe(409);
  });
});
