import { z } from 'zod';

export const createEventRequestSchema = z.object({
  organizerId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  venue: z.string().min(1),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
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
  customerId: z.string().min(1),
  eventId: z.string().min(1),
  ticketTypeId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
