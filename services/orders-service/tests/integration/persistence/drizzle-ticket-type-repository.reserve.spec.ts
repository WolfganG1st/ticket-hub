import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { DrizzleTicketTypeRepository } from '../../../src/infra/persistence/DrizzleTicketTypeRepository';
import { ticketTypes } from '../../../src/infra/persistence/schema';
import { InsufficientStockError } from '../../../src/modules/events/domain/errors/InsufficientStockError';
import { createOrdersTestContext } from '../../_support/context';
import { seedEventWithTicketType } from '../../_support/seed';

describe('DrizzleTicketTypeRepository (integration) - Reserve', () => {
  it('should decrement remainingQuantity atomically', async () => {
    const { db } = await createOrdersTestContext();
    const repository = new DrizzleTicketTypeRepository(db);

    const { ticketTypeId } = await seedEventWithTicketType(db, { remaining: 10 });

    await repository.reserveAtomically(ticketTypeId, 2);

    const [row] = await db.select().from(ticketTypes).where(eq(ticketTypes.id, ticketTypeId));
    expect(row.remainingQuantity).toBe(8);
  });

  it('should not decrement if insufficient quantity', async () => {
    const { db } = await createOrdersTestContext();
    const repository = new DrizzleTicketTypeRepository(db);

    const { ticketTypeId } = await seedEventWithTicketType(db, { remaining: 1 });

    await expect(repository.reserveAtomically(ticketTypeId, 2)).rejects.toThrow(InsufficientStockError);

    const [row] = await db.select().from(ticketTypes).where(eq(ticketTypes.id, ticketTypeId));
    expect(row.remainingQuantity).toBe(1); // Should not have changed
  });
});
