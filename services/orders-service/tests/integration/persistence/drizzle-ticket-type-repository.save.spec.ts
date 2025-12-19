import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { DrizzleTicketTypeRepository } from '../../../src/infra/persistence/DrizzleTicketTypeRepository';
import { TicketType } from '../../../src/modules/events/domain/Event';
import { seedEventWithTicketType } from '../../_support/seed';
import { getOrdersTestContext } from '../../_support/setup';

describe('DrizzleTicketTypeRepository (integration) - Save', () => {
  it('should upsert a ticket type (insert then update)', async () => {
    const { db } = getOrdersTestContext();
    const repository = new DrizzleTicketTypeRepository(db);

    // Seed an event to link the ticket type to
    const { eventId } = await seedEventWithTicketType(db);

    const ticketTypeId = uuidv7();
    const now = new Date();

    const ticketType = new TicketType(ticketTypeId, eventId, 'VIP', 5000, 100, 100, now);

    // 1. Insert
    await repository.save(ticketType);

    const found = await repository.findById(ticketTypeId);
    expect(found).not.toBeNull();
    expect(found?.name).toBe('VIP');
    expect(found?.remainingQuantity).toBe(100);

    // 2. Update
    ticketType.reserve(10); // remaining becomes 90
    await repository.save(ticketType);

    const updated = await repository.findById(ticketTypeId);
    expect(updated).not.toBeNull();
    expect(updated?.remainingQuantity).toBe(90);
  });
});
