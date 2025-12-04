import process from 'node:process';
import { loadAccountsEnv } from '@ticket-hub/config';
import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({ path: '.env.accounts.dev' });

const env = loadAccountsEnv(process.env);

export default defineConfig({
  schema: './src/modules/accounts/infra/persistence/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.ACCOUNTS_DATABASE_URL,
  },
});
