import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Timeouts (integration)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should fail fast when downstream times out and return a consistent GraphQL error', async () => {
    const { graphql } = globalThis.__gatewayTestContext;

    vi.mocked(global.fetch).mockImplementation(
      () => new Promise((_, reject) => setTimeout(() => reject(new Error('fetch failed')), 100)),
    );

    const response = await graphql({
      query: '{ events { id } }',
    });

    expect(response.status).toBe(200);
    expect(response.body.errors[0].extensions.code).toBe('INTERNAL_SERVER_ERROR');
    expect(response.body.errors[0].message).toBe('Internal server error');
  });
});
