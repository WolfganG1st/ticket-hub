import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';
import { afterEach, describe, expect, it } from 'vitest';
import { setAccountsUser } from '../../_support/builders';
import { seedEventWithTicketType } from '../../_support/seed';
import { getOrdersTestContext } from '../../_support/setup';

describe('CreateOrder (integration) - User Not Found', () => {
  afterEach(() => {
    setAccountsUser({ exists: true }); // Reset to default
  });

  it('should return 404 when accounts client returns null for customerId', async () => {
    const { app, db } = getOrdersTestContext();

    const { eventId, ticketTypeId } = await seedEventWithTicketType(db);
    const customerId = uuidv7();

    setAccountsUser({ exists: false });

    const body = {
      customerId,
      eventId,
      ticketTypeId,
      quantity: 1,
    };

    const response = await request(app).post('/api/v1/orders').set('x-idempotency-key', 'key').send(body);
    expect(response.status).toBe(404);
  });
});
