import process from 'node:process';
import { loadOrdersEnv } from '@ticket-hub/config';
import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({ path: '.env.orders.dev' });

const env = loadOrdersEnv(process.env);

export default defineConfig({
  schema: './src/infra/persistence/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.ORDERS_DATABASE_URL,
  },
});
