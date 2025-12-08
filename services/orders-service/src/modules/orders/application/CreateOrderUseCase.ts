import { ConflictError, ForbiddenError, type GrpcUser, NotFoundError, ValidationError } from 'shared-kernel';
import { v7 as uuidv7 } from 'uuid';
import type { AccountsGrpcClient } from '../../../infra/grpc/accounts-client';
import type { DistributedLock } from '../../../infra/redis/DistributedLock';
import type { Event, TicketType } from '../../events/domain/Event';
import type { EventRepository } from '../../events/domain/EventRepository';
import type { TicketTypeRepository } from '../../events/domain/TicketTypeRepository';
import { Order } from '../../orders/domain/Order';
import type { OrderRepository } from '../../orders/domain/OrderRepository';

type CreateOrderInput = {
  customerId: string;
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  idempotencyKey?: string | null;
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
    private readonly accountsClient: AccountsGrpcClient,
    private readonly lock: DistributedLock,
  ) {}

  public async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    if (input.quantity <= 0) {
      throw new ValidationError('Quantity must be positive');
    }

    if (input.idempotencyKey) {
      const existing = await this.orderRepository.findByIdempotencyKey(input.idempotencyKey);
      if (existing) {
        return {
          orderId: existing.id,
          totalPriceInCents: existing.totalPriceInCents,
        };
      }
    }

    const lockKey = `ticket-type:${input.ticketTypeId}`;
    const acquired = await this.lock.acquire(lockKey, 3000);
    if (!acquired) {
      throw new ConflictError('Ticket is being updated, try again');
    }

    try {
      const user = await this.ensureUserExists(input.customerId);

      const event = await this.checkEvent(input.eventId);

      const ticketType = await this.checkTicketType(input.ticketTypeId, input.eventId);

      ticketType.reserve(input.quantity);

      const totalPriceInCents = this.calculateTotalPriceInCents(ticketType.priceInCents, input.quantity);

      const orderId = uuidv7();
      const now = new Date();

      const order = new Order(
        orderId,
        user.id,
        event.id,
        ticketType.id,
        input.quantity,
        'PENDING',
        totalPriceInCents,
        now,
      );

      await this.ticketTypeRepository.save(ticketType);
      await this.orderRepository.save(order, input.idempotencyKey);

      return {
        orderId,
        totalPriceInCents,
      };
    } finally {
      await this.lock.release(lockKey);
    }
  }

  private async checkEvent(eventId: string): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }
    return event;
  }

  private async ensureUserExists(userId: string): Promise<GrpcUser> {
    const user = await this.accountsClient.getUserById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role !== 'CUSTOMER') {
      throw new ForbiddenError('User is not a customer');
    }

    return user;
  }

  private async checkTicketType(ticketTypeId: string, eventId: string): Promise<TicketType> {
    const ticketType = await this.ticketTypeRepository.findById(ticketTypeId);
    if (!ticketType) {
      throw new NotFoundError('Ticket type not found');
    }

    if (ticketType.eventId !== eventId) {
      throw new ConflictError('Ticket type does not belong to the event');
    }

    return ticketType;
  }

  private calculateTotalPriceInCents(priceInCents: number, quantity: number): number {
    return priceInCents * quantity;
  }
}
