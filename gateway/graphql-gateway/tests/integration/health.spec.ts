import request from 'supertest';
import { describe, expect, it } from 'vitest';

describe('Gateway Health', () => {
  it('should return 200 OK on /health', async () => {
    const { app } = globalThis.__gatewayTestContext;

    const response = await request(app).get('/health').expect(200);

    expect(response.body).toEqual({ status: 'OK' });
  });
});
