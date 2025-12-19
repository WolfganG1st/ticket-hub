import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { seedEventWithTicketType } from '../../_support/seed';
import { getOrdersTestContext } from '../../_support/setup';

describe('CreateOrder (integration) - Ticket Type Mismatch', () => {
  it('should return 409 Conflict when ticket type does not belong to the event', async () => {
    const { app, db } = getOrdersTestContext();

    // Seed two different events
    const { eventId: eventId1 } = await seedEventWithTicketType(db);
    const { ticketTypeId: ticketTypeId2 } = await seedEventWithTicketType(db);

    const customerId = uuidv7();

    // Use eventId1 but ticketTypeId2 (which belongs to eventId2)
    const response = await request(app).post('/api/v1/orders').set('x-idempotency-key', 'test-mismatch-1').send({
      customerId,
      eventId: eventId1,
      ticketTypeId: ticketTypeId2,
      quantity: 1,
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'CONFLICT',
      }),
    );
  });
});
