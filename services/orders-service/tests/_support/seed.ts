// tests/_support/seed.ts
import { v7 as uuidv7 } from 'uuid';
import { events, ticketTypes } from '../../src/infra/persistence/schema';
import type { OrdersDb } from './context';

export async function seedEventWithTicketType(
  db: OrdersDb,
  input?: { remaining?: number },
): Promise<{ eventId: string; ticketTypeId: string }> {
  const now = new Date();
  const eventId = uuidv7();
  const ticketTypeId = uuidv7();

  await db.insert(events).values({
    id: eventId,
    organizerId: uuidv7(),
    title: 'Test event',
    description: null,
    venue: 'Test venue',
    startsAt: new Date(now.getTime() + 60_000),
    endsAt: new Date(now.getTime() + 120_000),
    createdAt: now,
  });

  await db.insert(ticketTypes).values({
    id: ticketTypeId,
    eventId,
    name: 'General',
    priceInCents: 1000,
    totalQuantity: 10,
    remainingQuantity: input?.remaining ?? 10,
    createdAt: now,
  });

  return { eventId, ticketTypeId };
}
