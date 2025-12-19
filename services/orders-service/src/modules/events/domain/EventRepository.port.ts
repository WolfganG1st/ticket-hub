import type { Event } from './Event';

export interface EventRepository {
  findById(id: string): Promise<Event | null>;
  findByOrganizerId(organizerId: string): Promise<Event[]>;
  findAll(): Promise<Event[]>;
  save(event: Event): Promise<void>;
}
