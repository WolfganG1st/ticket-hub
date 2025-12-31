import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Full Flow (e2e)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should signup/login via accounts -> query me via gateway -> create order via gateway -> pay order via gateway', async () => {
    const { app } = globalThis.__gatewayTestContext;

    const mockUser = { id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'CUSTOMER' };

    // 1. Query me
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockUser),
    } as Response);

    const meResponse = await request(app).post('/graphql').set('Authorization', 'Bearer token-123').send({
      query: '{ me { id name } }',
    });

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.data.me.name).toBe('John Doe');

    // 2. Create order
    // Mock accountsApi.me (called in context)
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockUser),
    } as Response);

    // Mock ordersApi.createOrder
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ orderId: 'order-789', totalPriceInCents: 5000 }),
    } as Response);

    const createOrderResponse = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer token-123')
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

    expect(createOrderResponse.status).toBe(200);
    expect(createOrderResponse.body.data.createOrder.orderId).toBe('order-789');

    // 3. Pay order
    // Mock accountsApi.me (called in context)
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockUser),
    } as Response);

    // Mock ordersApi.payOrder
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 'order-789', status: 'PAID' }),
    } as Response);

    const payOrderResponse = await request(app)
      .post('/graphql')
      .set('Authorization', 'Bearer token-123')
      .send({
        query: `
          mutation PayOrder($id: ID!) {
            payOrder(id: $id) {
              id
              status
            }
          }
        `,
        variables: { id: 'order-789' },
      });

    expect(payOrderResponse.status).toBe(200);
    expect(payOrderResponse.body.data.payOrder.status).toBe('PAID');
  });
});
