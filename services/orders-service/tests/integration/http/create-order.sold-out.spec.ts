import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { seedEventWithTicketType } from '../../_support/seed';
import { getOrdersTestContext } from '../../_support/setup';

describe('CreateOrder (integration) - Sold Out', () => {
  it('should return 409 INSUFFICIENT_STOCK when remainingQuantity is 0', async () => {
    const { app, db } = getOrdersTestContext();

    // Seed event with 0 remaining tickets
    const { eventId, ticketTypeId } = await seedEventWithTicketType(db, { remaining: 0 });
    const customerId = uuidv7();

    const body = {
      customerId,
      eventId,
      ticketTypeId,
      quantity: 1,
    };

    const response = await request(app).post('/api/v1/orders').set('x-idempotency-key', 'key').send(body);
    expect(response.status).toBe(409);
    // Optional: check error code if the app returns structured errors
    // expect(response.body.code).toBe('INSUFFICIENT_STOCK');
  });
});
