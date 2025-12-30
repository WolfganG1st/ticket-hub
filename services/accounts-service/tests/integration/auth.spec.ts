import request from 'supertest';
import { expect, test } from 'vitest';
import { getAccountsTestContext } from '../_support/setup';

test('signup + login + me', async () => {
  const { app } = getAccountsTestContext();

  await request(app)
    .post('/api/v1/signup')
    .send({
      email: 'test@example.com',
      name: 'Test User',
      password: 'Password123',
    })
    .expect(201);

  const loginRes = await request(app)
    .post('/api/v1/login')
    .send({
      email: 'test@example.com',
      password: 'Password123',
    })
    .expect(200);

  const token = loginRes.body.accessToken as string;

  const meRes = await request(app).get('/api/v1/me').set('Authorization', `Bearer ${token}`).expect(200);

  expect(meRes.body.email).toBe('test@example.com');
});
