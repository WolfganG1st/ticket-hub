import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getAccountsTestContext } from '../../_support/setup';

describe('Signup (integration) - Validation', () => {
  it('should return 400 when email is invalid', async () => {
    const { app } = getAccountsTestContext();

    const response = await request(app).post('/api/v1/signup').send({
      email: 'invalid-email',
      name: 'John Doe',
      password: 'Password123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Validation failed');
  });

  it('should return 400 when password is too short/weak', async () => {
    const { app } = getAccountsTestContext();

    const response = await request(app).post('/api/v1/signup').send({
      email: 'john@example.com',
      name: 'John Doe',
      password: 'short',
    });

    expect(response.status).toBe(400);
  });

  it('should return 400 when name is empty', async () => {
    const { app } = getAccountsTestContext();

    const response = await request(app).post('/api/v1/signup').send({
      email: 'john@example.com',
      name: '',
      password: 'Password123',
    });

    expect(response.status).toBe(400);
  });
});
