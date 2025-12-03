import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export type Db = ReturnType<typeof drizzle<typeof schema>>;

export function createDb(connectionString: string): Db {
  const pool = new Pool({
    connectionString,
  });

  return drizzle(pool, { schema });
}
