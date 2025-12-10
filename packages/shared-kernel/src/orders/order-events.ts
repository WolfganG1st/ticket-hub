import { z } from 'zod';

export const orderCreatedEventSchema = z.object({
  eventName: z.literal('OrderCreated'),
  orderId: z.uuidv7(),
  customerId: z.uuidv7(),
  eventId: z.uuidv7(),
  ticketTypeId: z.uuidv7(),
  quantity: z.number().int().positive(),
  totalPriceInCents: z.number().int().nonnegative(),
  occurredAt: z.iso.datetime(),
});

export type OrderCreatedEvent = z.infer<typeof orderCreatedEventSchema>;

export const orderPaidEventSchema = z.object({
  eventName: z.literal('OrderPaid'),
  orderId: z.uuidv7(),
  paidAt: z.iso.datetime(),
});

export type OrderPaidEvent = z.infer<typeof orderPaidEventSchema>;
