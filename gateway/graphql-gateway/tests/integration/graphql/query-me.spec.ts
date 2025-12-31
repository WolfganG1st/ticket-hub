import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Me Query (integration)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should call accounts-service /me with forwarded Authorization', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'CUSTOMER' }),
    } as Response);

    const { graphql } = globalThis.__gatewayTestContext;
    const response = await graphql({ query: '{ me { id name email role } }' }, { Authorization: 'Bearer valid-token' });

    expect(response.status).toBe(200);
    expect(response.body.data.me).toEqual({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'CUSTOMER',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/me'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer valid-token',
        }),
      }),
    );
  });

  it('should return UNAUTHENTICATED when token invalid', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    } as Response);

    const { graphql } = globalThis.__gatewayTestContext;
    const response = await graphql({ query: '{ me { id } }' }, { Authorization: 'Bearer invalid-token' });

    expect(response.status).toBe(200);
    expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });

  it('should return UNAUTHENTICATED when token missing', async () => {
    const { graphql } = globalThis.__gatewayTestContext;

    const response = await graphql({
      query: '{ me { id } }',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.me).toBeNull();
  });
});
