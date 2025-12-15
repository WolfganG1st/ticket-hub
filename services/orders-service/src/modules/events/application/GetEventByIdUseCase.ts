import { NotFoundError } from 'shared-kernel';
import type { EventRepository } from '../domain/EventRepository';
import type { TicketTypeRepository } from '../domain/TicketTypeRepository';

type GetEventByIdInput = {
  eventId: string;
};

type GetEventByIdOutput = {
  id: string;
  title: string;
  organizerId: string;
  description: string | null;
  venue: string;
  ticketTypes: {
    id: string;
    name: string;
    priceInCents: number;
    totalQuantity: number;
    remainingQuantity: number;
  }[];
  startsAt: string;
  endAt: string;
  createdAt: string;
};

export class GetEventByIdUseCase {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly ticketTypeRepository: TicketTypeRepository,
  ) {}

  async execute(input: GetEventByIdInput): Promise<GetEventByIdOutput> {
    const event = await this.eventRepository.findById(input.eventId);

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const ticketTypes = await this.ticketTypeRepository.findByEventId(input.eventId);

    return {
      id: event.id,
      title: event.title,
      organizerId: event.organizerId,
      description: event.description,
      venue: event.venue,
      ticketTypes: ticketTypes.map((ticketType) => ({
        id: ticketType.id,
        name: ticketType.name,
        priceInCents: ticketType.priceInCents,
        totalQuantity: ticketType.totalQuantity,
        remainingQuantity: ticketType.remainingQuantity,
      })),
      startsAt: event.startsAt.toISOString(),
      endAt: event.endsAt.toISOString(),
      createdAt: event.createdAt.toISOString(),
    };
  }
}
