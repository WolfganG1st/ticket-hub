import process from 'node:process';
import { z } from 'zod';
import { baseEnvSchema } from './base-env';
import { parseEnvWithSchema } from './parse-env';

export const accountsEnvSchema = baseEnvSchema.extend({
  ACCOUNTS_DATABASE_URL: z.string().min(1, 'ACCOUNTS_DATABASE_URL is required'),
  ACCOUNTS_JWT_SECRET: z.string().min(1, 'ACCOUNTS_JWT_SECRET is required'),
});

export type AccountsEnv = z.infer<typeof accountsEnvSchema>;

export function loadAccountsEnv(vars: NodeJS.ProcessEnv = process.env): AccountsEnv {
  return parseEnvWithSchema(accountsEnvSchema, vars);
}
