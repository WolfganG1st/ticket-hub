import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getAccountsTestContext } from '../../_support/setup';

describe('Signup (integration) - Duplicate', () => {
  it('should return 409 when signing up with an existing email', async () => {
    const { app } = getAccountsTestContext();

    // First signup
    await request(app)
      .post('/api/v1/signup')
      .send({
        email: 'duplicate@example.com',
        name: 'First User',
        password: 'Password123',
      })
      .expect(201);

    // Second signup with same email
    const response = await request(app).post('/api/v1/signup').send({
      email: 'duplicate@example.com',
      name: 'Second User',
      password: 'Password123',
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toContain('User already exists');
  });
});
