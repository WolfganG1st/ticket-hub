import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getFetchCall } from '../../_support/mocks';

describe('CreateOrder Mutation (integration)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should call orders-service with x-idempotency-key and return orderId', async () => {
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

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer valid-token')
      .set('x-idempotency-key', 'idem-key-1')
      .send({
        query: `
          mutation CreateOrder($input: CreateOrderInput!) {
            createOrder(input: $input) {
              orderId
              totalPriceInCents
            }
          }
        `,
        variables: {
          input: {
            eventId: 'evt-1',
            ticketTypeId: 'tt-1',
            quantity: 1,
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.data.createOrder).toEqual({
      orderId: 'order-123',
      totalPriceInCents: 1000,
    });

    // Check if x-idempotency-key was forwarded to orders-service
    const createOrderCall = getFetchCall('/orders');
    expect(createOrderCall[1]?.headers).toMatchObject({
      'x-idempotency-key': 'idem-key-1',
    });
  });

  it('should return mapped CONFLICT when orders-service returns 409', async () => {
    const { app } = globalThis.__gatewayTestContext;

    // Mock accountsApi.me
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 'user-1', role: 'CUSTOMER' }),
    } as Response);

    // Mock ordersApi.createOrder with 409
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ message: 'Sold out', code: 'SOLD_OUT' }),
    } as Response);

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer valid-token')
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
            quantity: 1,
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors[0].extensions.code).toBe('CONFLICT');
    expect(response.body.errors[0].message).toBe('Sold out');
  });
});
