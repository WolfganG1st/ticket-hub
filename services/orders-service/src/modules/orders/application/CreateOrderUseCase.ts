import {
  ConflictError,
  ForbiddenError,
  type GrpcUser,
  NotFoundError,
  orderCreatedEventSchema,
  ValidationError,
} from 'shared-kernel';
import { v7 as uuidv7 } from 'uuid';
import type { AccountsClient } from '../../../infra/accounts/AccountsClient.port';
import type { DistributedLock } from '../../../infra/redis/DistributedLock';
import type { Event } from '../../events/domain/Event';
import type { EventRepository } from '../../events/domain/EventRepository.port';
import type { TicketTypeRepository } from '../../events/domain/TicketTypeRepository.port';
import { Order } from '../../orders/domain/Order';
import type { OrderRepository } from '../domain/OrderRepository.port';
import type { OrderOutboxRepository } from './OrderOutboxRepository';

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
    private readonly accountsClient: AccountsClient,
    private readonly lock: DistributedLock,
    private readonly outboxRepository: OrderOutboxRepository,
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

      const ticketType = await this.ticketTypeRepository.reserveAtomically(input.ticketTypeId, input.quantity);

      if (ticketType.eventId !== input.eventId) {
        throw new ConflictError('Ticket type does not belong to the event');
      }

      const totalPriceInCents = this.calculateTotalPriceInCents(ticketType.priceInCents, input.quantity);

      const orderId = uuidv7();
      const now = new Date();

      const order = new Order(
        orderId,
        user.id,
        event.id,
        input.ticketTypeId,
        input.quantity,
        'PENDING',
        totalPriceInCents,
        now,
      );

      await this.orderRepository.save(order, input.idempotencyKey);

      const orderCreatedEvent = orderCreatedEventSchema.parse({
        eventName: 'OrderCreated',
        orderId,
        customerId: user.id,
        eventId: input.eventId,
        ticketTypeId: input.ticketTypeId,
        quantity: input.quantity,
        totalPriceInCents,
        occurredAt: now.toISOString(),
      });

      await this.outboxRepository.enqueue(orderId, 'ORDER_CREATED', orderCreatedEvent);

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

  private calculateTotalPriceInCents(priceInCents: number, quantity: number): number {
    return priceInCents * quantity;
  }
}
