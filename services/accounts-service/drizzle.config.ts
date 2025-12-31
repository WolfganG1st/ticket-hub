import process from 'node:process';
import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({ path: '.env.accounts.dev' });

const databaseUrl = process.env.ACCOUNTS_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('ACCOUNTS_DATABASE_URL or DATABASE_URL environment variable is required');
}

export default defineConfig({
  schema: './src/modules/accounts/infra/persistence/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
