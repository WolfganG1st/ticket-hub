import type { OrdersEnv } from '@ticket-hub/config';
import { buildDbUrlWithSearchPath, ensureSchemaAndTables, makeSchemaName, truncateTables } from '@ticket-hub/testkit';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../src/infra/persistence/schema';

export type OrdersDb = ReturnType<typeof drizzle<typeof schema>>;

const TABLE_NAMES = ['events', 'ticket_types', 'orders', 'order_outbox'];

export async function makeDb(env: OrdersEnv, workerId: number) {
  const schemaName = makeSchemaName(workerId);
  const dbUrl = buildDbUrlWithSearchPath(env.ORDERS_DATABASE_URL, schemaName);
  const pool = new Pool({ connectionString: dbUrl });
  const db: OrdersDb = drizzle(pool, { schema });

  await ensureSchemaAndTables(pool, schemaName, TABLE_NAMES);

  return { pool, db, schemaName };
}

export async function clearDb(pool: Pool, schemaName: string) {
  await truncateTables(pool, schemaName, TABLE_NAMES);
}

export async function closeDb(pool: Pool) {
  await pool.end();
}
