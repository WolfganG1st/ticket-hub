import type { EventRepository } from '../domain/EventRepository';

type ListEventsInput = {
  organizerId?: string;
};

type ListEventsOutput = {
  id: string;
  title: string;
  organizerId: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}[];

export class ListEventsUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  public async execute(input: ListEventsInput): Promise<ListEventsOutput> {
    const events = input.organizerId
      ? await this.eventRepository.findByOrganizerId(input.organizerId)
      : await this.eventRepository.findAll();

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      organizerId: event.organizerId,
      venue: event.venue,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
      createdAt: event.createdAt.toISOString(),
    }));
  }
}
