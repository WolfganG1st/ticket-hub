import request from 'supertest';
import { expect, test } from 'vitest';
import { getAccountsTestContext } from '../../_support/setup';

test('GET /health should return 200 OK', async () => {
  const { app } = getAccountsTestContext();

  const response = await request(app).get('/health').expect(200);

  expect(response.body).toEqual({ status: 'OK' });
});
