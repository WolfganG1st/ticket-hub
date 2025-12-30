import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { seedEventWithTicketType } from '../../_support/seed';
import { getOrdersTestContext } from '../../_support/setup';

describe('CreateOrder (integration) - Not Found', () => {
  it('should return 404 when event does not exist', async () => {
    const { app } = getOrdersTestContext();

    const body = {
      customerId: uuidv7(),
      eventId: uuidv7(), // Random event ID
      ticketTypeId: uuidv7(),
      quantity: 1,
    };

    const response = await request(app).post('/api/v1/orders').set('x-idempotency-key', 'key').send(body);
    expect(response.status).toBe(404);
  });

  it('should return 404 when ticketType does not exist', async () => {
    const { app, db } = getOrdersTestContext();

    // Seed an event so the event exists, but use a random ticketTypeId
    const { eventId } = await seedEventWithTicketType(db);

    const body = {
      customerId: uuidv7(),
      eventId,
      ticketTypeId: uuidv7(), // Random ticketType ID
      quantity: 1,
    };

    const response = await request(app).post('/api/v1/orders').set('x-idempotency-key', 'key').send(body);
    expect(response.status).toBe(404);
  });
});
