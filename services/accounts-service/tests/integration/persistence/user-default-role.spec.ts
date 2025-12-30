import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getAccountsTestContext } from '../../_support/setup';

describe('Accounts Persistence (integration) - Defaults', () => {
  it('should set default role CUSTOMER on signup', async () => {
    const { app, pool } = getAccountsTestContext();

    const response = await request(app)
      .post('/api/v1/signup')
      .send({
        email: 'default-role@example.com',
        name: 'Default Role User',
        password: 'Password123',
      })
      .expect(201);

    const userId = response.body.userId;

    // Verify in DB directly
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    const storedRole = result.rows[0].role;

    expect(storedRole).toBe('CUSTOMER');
  });
});
