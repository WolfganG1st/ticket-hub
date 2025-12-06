import process from 'node:process';
import { z } from 'zod';
import { baseEnvSchema } from './base-env';
import { parseEnvWithSchema } from './parse-env';

export const gatewayEnvSchema = baseEnvSchema.extend({
  ACCOUNTS_BASE_URL: z.string().min(1, 'ACCOUNTS_BASE_URL is required'),
  ORDERS_BASE_URL: z.string().min(1, 'ORDERS_BASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
});

export type GatewayEnv = z.infer<typeof gatewayEnvSchema>;

export function loadGatewayEnv(vars: NodeJS.ProcessEnv = process.env): GatewayEnv {
  return parseEnvWithSchema(gatewayEnvSchema, vars);
}
