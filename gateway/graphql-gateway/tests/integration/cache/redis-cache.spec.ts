import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Redis Cache (integration)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should cache GET-like query responses and avoid second downstream call', async () => {
    const { app } = globalThis.__gatewayTestContext;

    const mockEvents = [{ id: 'evt-1', title: 'Event 1' }];

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockEvents),
    } as Response);

    // First call - should call fetch
    const response1 = await request(app).post('/graphql').send({
      query: '{ events { id title } }',
    });

    expect(response1.status).toBe(200);
    expect(response1.body.data.events).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second call - should NOT call fetch
    const response2 = await request(app).post('/graphql').send({
      query: '{ events { id title } }',
    });

    expect(response2.status).toBe(200);
    expect(response2.body.data.events).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
