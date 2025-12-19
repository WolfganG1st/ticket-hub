import { eq } from 'drizzle-orm';
import { Event } from '../../modules/events/domain/Event';
import type { EventRepository } from '../../modules/events/domain/EventRepository.port';
import type { Db } from './db';
import { eventRowSchema, events } from './schema';

export class DrizzleEventRepository implements EventRepository {
  constructor(private readonly database: Db) {}

  public async findById(id: string): Promise<Event | null> {
    const row = await this.database.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (!row) {
      return null;
    }

    const parsed = eventRowSchema.parse(row);

    return new Event(
      parsed.id,
      parsed.organizerId,
      parsed.title,
      parsed.description,
      parsed.venue,
      parsed.startsAt,
      parsed.endsAt,
      parsed.createdAt,
    );
  }

  public async findByOrganizerId(id: string): Promise<Event[]> {
    const rows = await this.database.query.events.findMany({
      where: eq(events.organizerId, id),
    });

    const parsed = eventRowSchema.array().parse(rows);

    return parsed.map(
      (row) =>
        new Event(
          row.id,
          row.organizerId,
          row.title,
          row.description,
          row.venue,
          row.startsAt,
          row.endsAt,
          row.createdAt,
        ),
    );
  }

  public async findAll(): Promise<Event[]> {
    const rows = await this.database.query.events.findMany();

    const parsed = eventRowSchema.array().parse(rows);

    return parsed.map(
      (row) =>
        new Event(
          row.id,
          row.organizerId,
          row.title,
          row.description,
          row.venue,
          row.startsAt,
          row.endsAt,
          row.createdAt,
        ),
    );
  }

  public async save(event: Event): Promise<void> {
    const payload = eventRowSchema.parse({
      id: event.id,
      organizerId: event.organizerId,
      title: event.title,
      description: event.description,
      venue: event.venue,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      createdAt: event.createdAt,
    });

    await this.database
      .insert(events)
      .values(payload)
      .onConflictDoUpdate({
        target: events.id,
        set: {
          title: payload.title,
          organizerId: payload.organizerId,
          description: payload.description,
          venue: payload.venue,
          startsAt: payload.startsAt,
          endsAt: payload.endsAt,
        },
      });
  }
}
