import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getFetchCall } from '../_support/mocks';

describe('Downstream Contract (component) - Accounts', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should send Authorization correctly and handle 401/403', async () => {
    const { app } = globalThis.__gatewayTestContext;

    // 1. Test successful /me call
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 'user-1', role: 'CUSTOMER' }),
    } as Response);

    const response1 = await request(app).post('/graphql').set('Authorization', 'Bearer valid-token').send({
      query: '{ me { id } }',
    });

    expect(response1.status).toBe(200);
    expect(response1.body.data.me.id).toBe('user-1');

    const meCall = getFetchCall('/me');
    expect(meCall[1]?.headers).toMatchObject({
      Authorization: 'Bearer valid-token',
    });

    // 2. Test 401 handling
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    } as Response);

    const response2 = await request(app).post('/graphql').set('Authorization', 'Bearer invalid-token').send({
      query: '{ me { id } }',
    });

    expect(response2.status).toBe(200);
    expect(response2.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });
});
