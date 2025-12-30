import { and, eq, gte, sql } from 'drizzle-orm';
import { NotFoundError } from 'shared-kernel';
import { TicketType } from '../../modules/events/domain/Event';
import { InsufficientStockError } from '../../modules/events/domain/errors/InsufficientStockError';
import type { TicketTypeRepository } from '../../modules/events/domain/TicketTypeRepository.port';
import type { Db } from './db';
import { ticketTypeRowSchema, ticketTypes } from './schema';

export class DrizzleTicketTypeRepository implements TicketTypeRepository {
  constructor(private readonly database: Db) {}

  public async findById(id: string): Promise<TicketType | null> {
    const row = await this.database.query.ticketTypes.findFirst({
      where: eq(ticketTypes.id, id),
    });

    if (!row) {
      return null;
    }

    const parsed = ticketTypeRowSchema.parse(row);

    return new TicketType(
      parsed.id,
      parsed.eventId,
      parsed.name,
      parsed.priceInCents,
      parsed.totalQuantity,
      parsed.remainingQuantity,
      parsed.createdAt,
    );
  }

  public async findByEventId(id: string): Promise<TicketType[]> {
    const rows = await this.database.query.ticketTypes.findMany({
      where: eq(ticketTypes.eventId, id),
    });

    const parsed = ticketTypeRowSchema.array().parse(rows);

    return parsed.map(
      (row) =>
        new TicketType(
          row.id,
          row.eventId,
          row.name,
          row.priceInCents,
          row.totalQuantity,
          row.remainingQuantity,
          row.createdAt,
        ),
    );
  }

  public async save(ticketType: TicketType): Promise<void> {
    const payload = ticketTypeRowSchema.parse({
      id: ticketType.id,
      eventId: ticketType.eventId,
      name: ticketType.name,
      priceInCents: ticketType.priceInCents,
      totalQuantity: ticketType.totalQuantity,
      remainingQuantity: ticketType.remainingQuantity,
      createdAt: ticketType.createdAt,
    });

    await this.database
      .insert(ticketTypes)
      .values(payload)
      .onConflictDoUpdate({
        target: ticketTypes.id,
        set: {
          name: ticketType.name,
          priceInCents: ticketType.priceInCents,
          totalQuantity: ticketType.totalQuantity,
          remainingQuantity: ticketType.remainingQuantity,
        },
      });
  }

  public async reserveAtomically(id: string, quantity: number): Promise<TicketType> {
    const result = await this.database
      .update(ticketTypes)
      .set({
        remainingQuantity: sql`${ticketTypes.remainingQuantity} - ${quantity}`,
      })
      .where(and(eq(ticketTypes.id, id), gte(ticketTypes.remainingQuantity, quantity)))
      .returning();

    if (result.length !== 1) {
      const existing = await this.findById(id);
      if (!existing) {
        throw new NotFoundError('Ticket type not found');
      }
      throw new InsufficientStockError(quantity, existing.remainingQuantity);
    }

    const row = result[0];
    const parsed = ticketTypeRowSchema.parse(row);

    return new TicketType(
      parsed.id,
      parsed.eventId,
      parsed.name,
      parsed.priceInCents,
      parsed.totalQuantity,
      parsed.remainingQuantity,
      parsed.createdAt,
    );
  }
}
