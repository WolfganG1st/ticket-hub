import process from 'node:process';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { type AccountsTestContext, createAccountsTestContext } from './context';

process.env.TZ = 'UTC';

declare global {
  var __accountsTestContext: AccountsTestContext | undefined;
}

beforeAll(async () => {
  globalThis.__accountsTestContext = await createAccountsTestContext();
});

beforeEach(async () => {
  await globalThis.__accountsTestContext?.reset();
});

afterAll(async () => {
  await globalThis.__accountsTestContext?.close();
});

export function getAccountsTestContext(): AccountsTestContext {
  if (!globalThis.__accountsTestContext) {
    throw new Error('Accounts test context not initialized');
  }
  return globalThis.__accountsTestContext;
}
