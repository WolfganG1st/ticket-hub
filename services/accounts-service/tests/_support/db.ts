import type { AccountsEnv } from '@ticket-hub/config';
import { buildDbUrlWithSearchPath, ensureSchemaAndTables, makeSchemaName, truncateTables } from '@ticket-hub/testkit';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../src/modules/accounts/infra/persistence/schema';

export type AccountsDb = ReturnType<typeof drizzle<typeof schema>>;

const TABLE_NAMES = ['users'];

export async function makeDb(env: AccountsEnv, workerId: number) {
  const schemaName = makeSchemaName(workerId);
  const dbUrl = buildDbUrlWithSearchPath(env.ACCOUNTS_DATABASE_URL, schemaName);
  const pool = new Pool({ connectionString: dbUrl });
  const db: AccountsDb = drizzle(pool, { schema });

  await ensureSchemaAndTables(pool, schemaName, TABLE_NAMES);

  return { pool, db, schemaName };
}

export async function clearDb(pool: Pool, schemaName: string) {
  await truncateTables(pool, schemaName, TABLE_NAMES);
}

export async function closeDb(pool: Pool) {
  await pool.end();
}
