import process from 'node:process';
import { z } from 'zod';
import { baseEnvSchema } from './base-env';
import { parseEnvWithSchema } from './parse-env';

export const notificationsEnvSchema = baseEnvSchema.extend({
  NOTIFICATIONS_DATABASE_URL: z.string().min(1, 'NOTIFICATIONS_DATABASE_URL is required'),
  NOTIFICATIONS_KAFKA_BROKERS: z.string(),
  NOTIFICATIONS_KAFKA_TOPIC: z.string(),
  NOTIFICATIONS_CONSUMER_GROUP_ID: z.string(),
});

export type NotificationsEnv = z.infer<typeof notificationsEnvSchema>;

export function loadNotificationsEnv(vars: NodeJS.ProcessEnv = process.env): NotificationsEnv {
  return parseEnvWithSchema(notificationsEnvSchema, vars);
}
