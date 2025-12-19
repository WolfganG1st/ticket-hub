import { eq } from 'drizzle-orm';
import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { ticketTypes } from '../../../src/infra/persistence/schema';
import { seedEventWithTicketType } from '../../_support/seed';
import { getOrdersTestContext } from '../../_support/setup';

describe('CreateOrder (integration) - Insufficient Stock', () => {
  it('should return 409 INSUFFICIENT_STOCK when trying to buy more than available', async () => {
    const { app, db } = getOrdersTestContext();

    // seed ticket remaining = 1
    const { eventId, ticketTypeId } = await seedEventWithTicketType(db, { remaining: 1 });

    const customerId = uuidv7();

    // try to buy 2 tickets
    const response = await request(app)
      .post('/api/v1/orders')
      .set('x-idempotency-key', 'test-insufficient-stock')
      .send({
        customerId,
        eventId,
        ticketTypeId,
        quantity: 2,
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'INSUFFICIENT_STOCK',
      }),
    );

    // Verify database state remains unchanged
    const savedTicketType = await db.query.ticketTypes.findFirst({
      where: eq(ticketTypes.id, ticketTypeId),
    });
    expect(savedTicketType?.remainingQuantity).toBe(1);
  });
});
