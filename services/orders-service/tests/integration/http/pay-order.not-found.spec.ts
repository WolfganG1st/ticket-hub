import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { getOrdersTestContext } from '../../_support/setup';

describe('PayOrder (integration) - Not Found', () => {
  it('should return 404 when paying a non-existent order', async () => {
    const { app } = getOrdersTestContext();

    const orderId = uuidv7();

    const response = await request(app).post(`/api/v1/orders/${orderId}/pay`).send();
    expect(response.status).toBe(404);
  });
});
