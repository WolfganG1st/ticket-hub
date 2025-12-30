import { z } from 'zod';

export const createEventRequestSchema = z.object({
  organizerId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullish(),
  venue: z.string().min(1),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  ticketTypes: z
    .array(
      z.object({
        name: z.string().min(1),
        priceInCents: z.number().int().positive(),
        totalQuantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export type CreateEventRequest = z.infer<typeof createEventRequestSchema>;

export const createOrderRequestSchema = z.object({
  customerId: z.uuid(),
  eventId: z.uuid(),
  ticketTypeId: z.uuid(),
  quantity: z.number().int().positive(),
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
