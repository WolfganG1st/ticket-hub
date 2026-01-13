import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const orderInbox = pgTable('order_inbox', {
  id: varchar('id', { length: 36 }).primaryKey(),
  idempotencyKey: varchar('idempotency_key', { length: 100 }).unique(),
  eventName: varchar('event_name', { length: 64 }).notNull(),
  orderId: varchar('order_id', { length: 36 }).notNull(),
  receivedAt: timestamp('received_at').defaultNow().notNull(),
});

export const orderInboxRowSchema = createSelectSchema(orderInbox);

export const newOrderInboxRowSchema = createInsertSchema(orderInbox, {
  id: z.uuidv7(),
  idempotencyKey: z.string(),
  eventName: z.string(),
  orderId: z.uuidv7(),
  receivedAt: z.date(),
});

export type OrderInboxRow = z.infer<typeof orderInboxRowSchema>;
export type NewOrderInboxRow = z.infer<typeof newOrderInboxRowSchema>;
