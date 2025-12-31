import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getFetchCall } from '../_support/mocks';

describe('Downstream Contract (component) - Orders', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should send correct payload shape and headers to orders-service', async () => {
    const { app } = globalThis.__gatewayTestContext;

    // Mock accountsApi.me
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 'user-1', role: 'CUSTOMER' }),
    } as Response);

    // Mock ordersApi.createOrder
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ orderId: 'order-123', totalPriceInCents: 1000 }),
    } as Response);

    await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer valid-token')
      .set('x-idempotency-key', 'idem-1')
      .send({
        query: `
          mutation CreateOrder($input: CreateOrderInput!) {
            createOrder(input: $input) {
              orderId
            }
          }
        `,
        variables: {
          input: {
            eventId: 'evt-1',
            ticketTypeId: 'tt-1',
            quantity: 2,
          },
        },
      });

    const createOrderCall = getFetchCall('/orders');
    expect(createOrderCall[1]?.headers).toMatchObject({
      'content-type': 'application/json',
      'x-idempotency-key': 'idem-1',
    });

    const body = JSON.parse(createOrderCall[1]?.body as string);
    expect(body).toEqual({
      customerId: 'user-1',
      eventId: 'evt-1',
      ticketTypeId: 'tt-1',
      quantity: 2,
    });
  });
});
