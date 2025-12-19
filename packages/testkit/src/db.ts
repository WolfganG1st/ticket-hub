import type { Pool } from 'pg';

export function buildDbUrlWithSearchPath(baseUrl: string, schemaName: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set('options', `-c search_path=${schemaName}`);
  return url.toString();
}

export async function ensureSchemaAndTables(pool: Pool, schemaName: string, tableNames: string[]): Promise<void> {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}";`);

  for (const table of tableNames) {
    await pool.query(`CREATE TABLE IF NOT EXISTS "${schemaName}"."${table}" (LIKE public.${table} INCLUDING ALL);`);
  }
}

export async function truncateTables(pool: Pool, schemaName: string, tableNames: string[]): Promise<void> {
  if (tableNames.length === 0) return;
  const tables = tableNames.map((t) => `"${schemaName}"."${t}"`).join(', ');
  await pool.query(`TRUNCATE TABLE ${tables};`);
}
