/** biome-ignore-all lint/style/noNonNullAssertion: false positive */
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { User } from '../../../src/modules/accounts/domain/User';
import { DrizzleUserRepository } from '../../../src/modules/accounts/infra/persistence/DrizzleUserRepository';
import { BcryptPasswordHasher } from '../../../src/modules/accounts/infra/security/BcryptPasswordHasher';
import { getAccountsTestContext } from '../../_support/setup';

describe('Accounts Persistence (integration) - Password Hash', () => {
  it('should store hashed password (db value must not equal plaintext)', async () => {
    const { db, pool } = getAccountsTestContext();
    const repository = new DrizzleUserRepository(db);
    const hasher = new BcryptPasswordHasher();

    const plaintext = 'MySecretPassword123';
    const hash = await hasher.hash(plaintext);
    const user = new User(uuidv7(), 'Hash Test', 'hash@example.com', 'CUSTOMER', hash, new Date());

    await repository.save(user);

    // Verify in DB directly
    const result = await pool.query('SELECT password_hash FROM users WHERE email = $1', ['hash@example.com']);
    const storedHash = result.rows[0].password_hash;

    expect(storedHash).not.toBe(plaintext);
    expect(storedHash).toBe(hash);
  });

  it('should verify password correctly during login (hash check path)', async () => {
    const { db } = getAccountsTestContext();
    const repository = new DrizzleUserRepository(db);
    const hasher = new BcryptPasswordHasher();

    const plaintext = 'MySecretPassword123';
    const hash = await hasher.hash(plaintext);
    const user = new User(uuidv7(), 'Verify Test', 'verify@example.com', 'CUSTOMER', hash, new Date());

    await repository.save(user);

    const savedUser = await repository.findByEmail('verify@example.com');
    expect(savedUser).toBeDefined();

    const isValid = await hasher.compare(plaintext, savedUser!.passwordHash);
    const isInvalid = await hasher.compare('WrongPassword', savedUser!.passwordHash);

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });
});
