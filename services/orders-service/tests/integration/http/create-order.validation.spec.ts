import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { getOrdersTestContext } from '../../_support/setup';

describe('CreateOrder (integration) - Validation', () => {
  it('should return 400 when quantity is 0 or negative', async () => {
    const { app } = getOrdersTestContext();

    const body = {
      customerId: uuidv7(),
      eventId: uuidv7(),
      ticketTypeId: uuidv7(),
      quantity: 0,
    };

    const response = await request(app).post('/api/v1/orders').set('x-idempotency-key', 'key').send(body);
    expect(response.status).toBe(400);

    const bodyNegative = { ...body, quantity: -1 };
    const responseNegative = await request(app)
      .post('/api/v1/orders')
      .set('x-idempotency-key', 'key')
      .send(bodyNegative);
    expect(responseNegative.status).toBe(400);
  });

  it('should return 400 when eventId is invalid uuid', async () => {
    const { app } = getOrdersTestContext();

    const body = {
      customerId: uuidv7(),
      eventId: 'invalid-uuid',
      ticketTypeId: uuidv7(),
      quantity: 1,
    };

    const response = await request(app).post('/api/v1/orders').set('x-idempotency-key', 'key').send(body);
    expect(response.status).toBe(400);
  });

  it('should return 400 when ticketTypeId is invalid uuid', async () => {
    const { app } = getOrdersTestContext();

    const body = {
      customerId: uuidv7(),
      eventId: uuidv7(),
      ticketTypeId: 'invalid-uuid',
      quantity: 1,
    };

    const response = await request(app).post('/api/v1/orders').set('x-idempotency-key', 'key').send(body);
    expect(response.status).toBe(400);
  });
});
