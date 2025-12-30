import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getAccountsTestContext } from '../../_support/setup';

describe('Login (integration) - Invalid Credentials', () => {
  it('should return 401 when password is wrong', async () => {
    const { app } = getAccountsTestContext();

    // Signup first
    await request(app)
      .post('/api/v1/signup')
      .send({
        email: 'wrong-pass@example.com',
        name: 'User',
        password: 'CorrectPassword123',
      })
      .expect(201);

    // Login with wrong password
    const response = await request(app).post('/api/v1/login').send({
      email: 'wrong-pass@example.com',
      password: 'WrongPassword123',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Invalid credentials');
  });

  it('should return 401 when email does not exist', async () => {
    const { app } = getAccountsTestContext();

    const response = await request(app).post('/api/v1/login').send({
      email: 'non-existent@example.com',
      password: 'SomePassword123',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Invalid credentials');
  });
});
