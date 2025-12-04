import { ValidationError } from 'shared-kernel';
import { v7 as uuidv7 } from 'uuid';
import { Event, TicketType } from '../domain/Event';
import type { EventRepository } from '../domain/EventRepository';
import type { TicketTypeRepository } from '../domain/TicketTypeRepository';

type TicketTypeInput = {
  name: string;
  priceInCents: number;
  totalQuantity: number;
};

type CreateEventInput = {
  organizerId: string;
  title: string;
  description?: string | null;
  venue: string;
  startsAt: Date;
  endsAt: Date;
  ticketTypes: TicketTypeInput[];
};

type CreateEventOutput = {
  eventId: string;
};

export class CreateEventUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly ticketTypeRepository: TicketTypeRepository,
  ) {}

  public async execute(input: CreateEventInput): Promise<CreateEventOutput> {
    if (input.endsAt <= input.startsAt) {
      throw new ValidationError('Event end date must be after start date');
    }

    const eventId = uuidv7();
    const now = new Date();

    const event = new Event(
      eventId,
      input.organizerId,
      input.title,
      input.description ?? null,
      input.venue,
      input.startsAt,
      input.endsAt,
      now,
    );

    await this.eventRepository.save(event);

    for (const ticket of input.ticketTypes) {
      const ticketType = new TicketType(
        uuidv7(),
        eventId,
        ticket.name,
        ticket.priceInCents,
        ticket.totalQuantity,
        ticket.totalQuantity,
        now,
      );

      await this.ticketTypeRepository.save(ticketType);
    }

    return { eventId };
  }
}
