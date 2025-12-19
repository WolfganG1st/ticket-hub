import { type AccountsEnv, loadAccountsEnv } from '@ticket-hub/config';
import { getVitestWorkerId } from '@ticket-hub/testkit';
import type { Express } from 'express';
import type { Pool } from 'pg';
import { makeApp } from '../../src/main-http';
import { type AccountsDb, clearDb, closeDb, makeDb } from './db';

export type AccountsTestContext = {
  env: AccountsEnv;
  app: Express;
  db: AccountsDb;
  pool: Pool;
  reset(): Promise<void>;
  close(): Promise<void>;
};

export async function createAccountsTestContext(): Promise<AccountsTestContext> {
  const env = loadAccountsEnv();

  const workerId = getVitestWorkerId();
  const { pool, db, schemaName } = await makeDb(env, workerId);

  const app = makeApp(db, env);

  async function reset(): Promise<void> {
    await clearDb(pool, schemaName);
  }

  async function close(): Promise<void> {
    await closeDb(pool);
  }

  return {
    env,
    app,
    db,
    pool,
    reset,
    close,
  };
}
