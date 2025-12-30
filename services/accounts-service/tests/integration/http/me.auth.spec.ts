import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getAccountsTestContext } from '../../_support/setup';

describe('Me (integration) - Auth', () => {
  it('should return 401 when Authorization header is missing', async () => {
    const { app } = getAccountsTestContext();

    const response = await request(app).get('/api/v1/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Missing or invalid Authorization header');
  });

  it('should return 401 when token is invalid', async () => {
    const { app } = getAccountsTestContext();

    const response = await request(app).get('/api/v1/me').set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });

  it('should return 401 when token is expired', async () => {
    const { app, env } = getAccountsTestContext();
    const jwt = await import('jsonwebtoken');

    // Manually create an expired token
    const expiredToken = jwt.default.sign({ sub: 'user-123', role: 'CUSTOMER' }, env.ACCOUNTS_JWT_SECRET, {
      expiresIn: '-1h',
    });

    const response = await request(app).get('/api/v1/me').set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });
});
