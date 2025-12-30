import type { Event } from './Event';

export interface EventRepository {
  findById(id: string): Promise<Event | null>;
  findByOrganizerId(organizerId: string): Promise<Event[]>;
  findByIdempotencyKey(key: string): Promise<Event | null>;
  findAll(): Promise<Event[]>;
  save(event: Event, idempotencyKey?: string | null): Promise<void>;
}
