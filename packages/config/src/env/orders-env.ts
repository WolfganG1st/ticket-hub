import process from 'node:process';
import { z } from 'zod';
import { baseEnvSchema } from './base-env';
import { parseEnvWithSchema } from './parse-env';

export const ordersEnvSchema = baseEnvSchema.extend({
  ORDERS_DATABASE_URL: z.string().min(1, 'ORDERS_DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  ACCOUNTS_GRPC_URL: z.string().min(1, 'ACCOUNTS_GRPC_URL is required'),
  ORDERS_KAFKA_BROKERS: z.string(),
  ORDERS_KAFKA_TOPIC: z.string(),
  ORDERS_OUTBOX_BATCH_SIZE: z.coerce.number().int().positive().optional(),
  ORDERS_OUTBOX_POLL_INTERVAL_MS: z.coerce.number().int().positive().optional(),
});

export type OrdersEnv = z.infer<typeof ordersEnvSchema>;

export function loadOrdersEnv(vars: NodeJS.ProcessEnv = process.env): OrdersEnv {
  return parseEnvWithSchema(ordersEnvSchema, vars);
}
