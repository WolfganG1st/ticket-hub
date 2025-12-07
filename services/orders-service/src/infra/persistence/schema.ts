import { integer, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { orderStatusSchema } from 'shared-kernel';
import { z } from 'zod';

export const events = pgTable('events', {
  id: varchar('id', { length: 36 }).primaryKey(),
  organizerId: varchar('organizer_id', { length: 36 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  venue: varchar('venue', { length: 255 }).notNull(),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const eventRowSchema = createSelectSchema(events);

export const newEventRowSchema = createInsertSchema(events, {
  organizerId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  venue: z.string(),
  startsAt: z.date(),
  endsAt: z.date(),
});

export type EventRow = z.infer<typeof eventRowSchema>;
export type NewEventRow = z.infer<typeof newEventRowSchema>;

export const ticketTypes = pgTable('ticket_types', {
  id: varchar('id', { length: 36 }).primaryKey(),
  eventId: varchar('event_id', { length: 36 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  priceInCents: integer('price_in_cents').notNull(),
  totalQuantity: integer('total_quantity').notNull(),
  remainingQuantity: integer('remaining_quantity').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const ticketTypeRowSchema = createSelectSchema(ticketTypes);

export const newTicketTypeRowSchema = createInsertSchema(ticketTypes, {
  eventId: z.string(),
  name: z.string(),
  priceInCents: z.number(),
  totalQuantity: z.number(),
  remainingQuantity: z.number(),
});

export type TicketTypeRow = z.infer<typeof ticketTypeRowSchema>;
export type NewTicketTypeRow = z.infer<typeof newTicketTypeRowSchema>;

export const status = pgEnum('status', orderStatusSchema.options as [string, ...string[]]);
export const orders = pgTable('orders', {
  id: varchar('id', { length: 36 }).primaryKey(),
  customerId: varchar('customer_id', { length: 36 }).notNull(),
  eventId: varchar('event_id', { length: 36 }).notNull(),
  ticketTypeId: varchar('ticket_type_id', { length: 36 }).notNull(),
  quantity: integer('quantity').notNull(),
  status: status('status').notNull(),
  totalPriceInCents: integer('total_price_in_cents').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orderRowSchema = createSelectSchema(orders, {
  status: () => orderStatusSchema,
});

export const newOrderRowSchema = createInsertSchema(orders, {
  customerId: z.string(),
  eventId: z.string(),
  ticketTypeId: z.string(),
  quantity: z.number(),
  status: () => orderStatusSchema,
  totalPriceInCents: z.number(),
});

export type OrderRow = z.infer<typeof orderRowSchema>;
export type NewOrderRow = z.infer<typeof newOrderRowSchema>;
