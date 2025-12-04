import { ConflictError, NotFoundError, ValidationError } from 'shared-kernel';
import { v7 as uuidv7 } from 'uuid';
import type { EventRepository } from '../../events/domain/EventRepository';
import type { TicketTypeRepository } from '../../events/domain/TicketTypeRepository';
import { Order } from '../../orders/domain/Order';
import type { OrderRepository } from '../../orders/domain/OrderRepository';

type CreateOrderInput = {
  customerId: string;
  eventId: string;
  ticketTypeId: string;
  quantity: number;
};

type CreateOrderOutput = {
  orderId: string;
  totalPriceInCents: number;
};

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly eventRepository: EventRepository,
    private readonly ticketTypeRepository: TicketTypeRepository,
  ) {}

  public async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    if (input.quantity <= 0) {
      throw new ValidationError('Quantity must be positive');
    }

    const event = await this.eventRepository.findById(input.eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const ticketType = await this.ticketTypeRepository.findById(input.ticketTypeId);
    if (!ticketType) {
      throw new NotFoundError('Ticket type not found');
    }

    if (ticketType.eventId !== event.id) {
      throw new ConflictError('Ticket type does not belong to the event');
    }

    ticketType.reserve(input.quantity);

    const totalPriceInCents = ticketType.priceInCents * input.quantity;
    const orderId = uuidv7();
    const now = new Date();

    const order = new Order(
      orderId,
      input.customerId,
      event.id,
      ticketType.id,
      input.quantity,
      'PENDING',
      totalPriceInCents,
      now,
    );

    await this.ticketTypeRepository.save(ticketType);
    await this.orderRepository.save(order);

    return {
      orderId,
      totalPriceInCents,
    };
  }
}
