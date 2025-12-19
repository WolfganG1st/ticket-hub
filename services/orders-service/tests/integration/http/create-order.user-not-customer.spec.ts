import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { setAccountsUser } from '../../_support/builders';
import { seedEventWithTicketType } from '../../_support/seed';
import { getOrdersTestContext } from '../../_support/setup';

describe('CreateOrder (integration) - User Not Customer', () => {
  it('should return 403 Forbidden when user is not a customer', async () => {
    const { app, db } = getOrdersTestContext();

    const { eventId, ticketTypeId } = await seedEventWithTicketType(db);

    const customerId = uuidv7();

    // Mock user as ORGANIZER
    setAccountsUser({ role: 'ORGANIZER' });

    try {
      const response = await request(app).post('/api/v1/orders').set('x-idempotency-key', 'test-not-customer').send({
        customerId,
        eventId,
        ticketTypeId,
        quantity: 1,
      });

      expect(response.status).toBe(403);
      expect(response.body).toEqual(
        expect.objectContaining({
          error: 'FORBIDDEN',
        }),
      );
    } finally {
      // Reset user role to default (CUSTOMER) to avoid affecting other tests
      setAccountsUser({ role: 'CUSTOMER' });
    }
  });
});
