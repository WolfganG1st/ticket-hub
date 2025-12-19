import { eq } from 'drizzle-orm';
import { Order } from '../../modules/orders/domain/Order';
import type { OrderRepository } from '../../modules/orders/domain/OrderRepository.port';
import type { Db } from './db';
import { newOrderRowSchema, orderRowSchema, orders } from './schema';

export class DrizzleOrderRepository implements OrderRepository {
  constructor(private readonly database: Db) {}

  public async findById(id: string): Promise<Order | null> {
    const row = await this.database.query.orders.findFirst({
      where: eq(orders.id, id),
    });

    if (!row) {
      return null;
    }

    const parsed = orderRowSchema.parse(row);

    return new Order(
      parsed.id,
      parsed.customerId,
      parsed.eventId,
      parsed.ticketTypeId,
      parsed.quantity,
      parsed.status,
      parsed.totalPriceInCents,
      parsed.createdAt,
    );
  }

  public async findByEventId(id: string): Promise<Order[]> {
    const rows = await this.database.query.orders.findMany({
      where: eq(orders.eventId, id),
    });

    const parsed = orderRowSchema.array().parse(rows);

    return parsed.map(
      (row) =>
        new Order(
          row.id,
          row.customerId,
          row.eventId,
          row.ticketTypeId,
          row.quantity,
          row.status,
          row.totalPriceInCents,
          row.createdAt,
        ),
    );
  }

  public async findAll(): Promise<Order[]> {
    const rows = await this.database.query.orders.findMany();

    const parsed = orderRowSchema.array().parse(rows);

    return parsed.map(
      (row) =>
        new Order(
          row.id,
          row.customerId,
          row.eventId,
          row.ticketTypeId,
          row.quantity,
          row.status,
          row.totalPriceInCents,
          row.createdAt,
        ),
    );
  }

  public async save(order: Order, idempotencyKey?: string | null): Promise<void> {
    const payload = newOrderRowSchema.parse({
      id: order.id,
      customerId: order.customerId,
      eventId: order.eventId,
      ticketTypeId: order.ticketTypeId,
      quantity: order.quantity,
      status: order.status,
      totalPriceInCents: order.totalPriceInCents,
      createdAt: order.createdAt,
      idempotencyKey,
    });

    await this.database
      .insert(orders)
      .values(payload)
      .onConflictDoUpdate({
        target: orders.id,
        set: {
          customerId: payload.customerId,
          eventId: payload.eventId,
          ticketTypeId: payload.ticketTypeId,
          quantity: payload.quantity,
          status: payload.status,
          totalPriceInCents: payload.totalPriceInCents,
        },
      });
  }

  public async findByIdempotencyKey(key: string): Promise<Order | null> {
    const row = await this.database.query.orders.findFirst({
      where: eq(orders.idempotencyKey, key),
    });

    if (!row) {
      return null;
    }

    const parsed = orderRowSchema.parse(row);

    return new Order(
      parsed.id,
      parsed.customerId,
      parsed.eventId,
      parsed.ticketTypeId,
      parsed.quantity,
      parsed.status,
      parsed.totalPriceInCents,
      parsed.createdAt,
    );
  }
}
