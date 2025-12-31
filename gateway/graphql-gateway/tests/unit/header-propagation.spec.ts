import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountsApi } from '../../src/services/accounts-api';
import { OrdersApi } from '../../src/services/orders-api';
import { getFetchCall } from '../_support/mocks';

describe('Header Propagation (unit)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({}),
        }),
      ),
    );
  });

  it('should forward Authorization header to downstream in AccountsApi', async () => {
    const api = new AccountsApi('http://accounts');
    await api.me('test-token');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/me'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });

  it('should forward x-idempotency-key when provided in OrdersApi', async () => {
    const api = new OrdersApi('http://orders');
    await api.createOrder({
      customerId: '123',
      eventId: '456',
      ticketTypeId: '789',
      quantity: 1,
      idempotencyKey: 'key-123',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/orders'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-idempotency-key': 'key-123',
        }),
      }),
    );
  });

  it('should not forward unsafe headers (host, connection, etc) - implicitly handled by fetch in API classes', async () => {
    // Only set specific headers, so unsafe headers are not forwarded by default.
    const api = new OrdersApi('http://orders');
    await api.createOrder({
      customerId: '123',
      eventId: '456',
      ticketTypeId: '789',
      quantity: 1,
    });

    const call = getFetchCall('/orders');
    const headers = call[1]?.headers as Record<string, string>;

    expect(headers).not.toHaveProperty('host');
    expect(headers).not.toHaveProperty('connection');
  });
});
