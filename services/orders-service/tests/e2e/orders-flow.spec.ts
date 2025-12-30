import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setAccountsUser } from '../_support/builders';
import { createOrdersTestContext, type OrdersTestContext } from '../_support/context';

describe('Orders Flow (e2e)', () => {
  let ctx: OrdersTestContext;

  beforeAll(async () => {
    ctx = await createOrdersTestContext();
  });

  beforeEach(async () => {
    await ctx.reset();
    setAccountsUser({ exists: true, role: 'CUSTOMER' });
  });

  afterAll(async () => {
    await ctx.close();
  });

  it('should create event -> create order -> pay order with real services running', async () => {
    const organizerId = uuidv7();
    const customerId = uuidv7();
    const now = new Date();
    const startsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const endsAt = new Date(now.getTime() + 25 * 60 * 60 * 1000); // Tomorrow + 1 hour

    // Step 1: Create Event
    const eventIdempotencyKey = uuidv7();
    const createEventResponse = await request(ctx.app)
      .post('/api/v1/events')
      .set('x-idempotency-key', eventIdempotencyKey)
      .send({
        organizerId,
        title: 'E2E Test Event',
        description: 'Testing the full flow',
        venue: 'Test Venue',
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        ticketTypes: [
          {
            name: 'General Admission',
            priceInCents: 5000,
            totalQuantity: 100,
          },
        ],
      });

    expect(createEventResponse.status).toBe(201);
    expect(createEventResponse.body.eventId).toBeDefined();

    const eventId = createEventResponse.body.eventId;

    // Step 2: Get Event details
    const getEventResponse = await request(ctx.app).get(`/api/v1/events/${eventId}`).send();
    expect(getEventResponse.status).toBe(200);
    expect(getEventResponse.body.ticketTypes).toBeDefined();
    expect(getEventResponse.body.ticketTypes.length).toBe(1);
    const ticketTypeId = getEventResponse.body.ticketTypes[0].id;

    // Step 3: Create Order
    const orderIdempotencyKey = uuidv7();
    const createOrderResponse = await request(ctx.app)
      .post('/api/v1/orders')
      .set('x-idempotency-key', orderIdempotencyKey)
      .send({
        customerId,
        eventId,
        ticketTypeId,
        quantity: 2,
      });

    expect(createOrderResponse.status).toBe(201);
    expect(createOrderResponse.body.orderId).toBeDefined();

    // Step 4: Get Order details
    const getOrderResponse = await request(ctx.app).get(`/api/v1/orders/${createOrderResponse.body.orderId}`).send();
    expect(getOrderResponse.status).toBe(200);
    expect(getOrderResponse.body.status).toBe('PENDING');
    expect(getOrderResponse.body.totalPriceInCents).toBe(10000); // 5000 * 2

    const orderId = createOrderResponse.body.orderId;

    // Step 4: Pay Order
    const payOrderResponse = await request(ctx.app).post(`/api/v1/orders/${orderId}/pay`).send();

    expect(payOrderResponse.status).toBe(200);
    expect(payOrderResponse.body.status).toBe('PAID');

    // Step 5: Verify event ticket stock was decremented
    const getEventResponseAfterPayment = await request(ctx.app).get(`/api/v1/events/${eventId}`).send();

    expect(getEventResponseAfterPayment.status).toBe(200);
    expect(getEventResponseAfterPayment.body.ticketTypes[0].remainingQuantity).toBe(98); // 100 - 2
  });
});
