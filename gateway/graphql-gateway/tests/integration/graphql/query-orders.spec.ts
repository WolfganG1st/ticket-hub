import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getFetchCall } from '../../_support/mocks';

describe('Orders Query (integration)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should resolve ordersByCustomer query by calling orders-service and returning mapped shape', async () => {
    const { app } = globalThis.__gatewayTestContext;

    const mockOrders = [
      {
        id: 'order-1',
        customerId: 'cust-1',
        eventId: 'evt-1',
        ticketTypeId: 'tt-1',
        quantity: 2,
        status: 'PAID',
        totalPriceInCents: 2000,
        createdAt: '2025-01-01T00:00:00Z',
      },
    ];

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockOrders),
    } as Response);

    const response = await request(app)
      .post('/graphql')
      .send({
        query: `
          query GetOrders($customerId: ID!) {
            ordersByCustomer(customerId: $customerId) {
              id
              status
              totalPriceInCents
            }
          }
        `,
        variables: { customerId: 'cust-1' },
      });

    expect(response.status).toBe(200);
    expect(response.body.data.ordersByCustomer).toHaveLength(1);
    expect(response.body.data.ordersByCustomer[0]).toEqual({
      id: 'order-1',
      status: 'PAID',
      totalPriceInCents: 2000,
    });

    const fetchCall = getFetchCall('/orders');
    expect(fetchCall[0].toString()).toContain('/api/v1/orders?customerId=cust-1');
  });
});
