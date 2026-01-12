import process from 'node:process';
import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({ path: '.env.orders.dev' });

const databaseUrl = process.env.ORDERS_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('ORDERS_DATABASE_URL environment variable is required');
}

export default defineConfig({
  schema: './src/infra/persistence/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
