import { NotFoundError } from 'shared-kernel';
import type { OrderRepository } from '../domain/OrderRepository.port';

export type GetOrderByIdInput = {
  orderId: string;
};

export type GetOrderByIdOutput = {
  id: string;
  customerId: string;
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  status: string;
  totalPriceInCents: number;
  createdAt: Date;
};

export class GetOrderByIdUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  public async execute(input: GetOrderByIdInput): Promise<GetOrderByIdOutput> {
    const order = await this.orderRepository.findById(input.orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return {
      id: order.id,
      customerId: order.customerId,
      eventId: order.eventId,
      ticketTypeId: order.ticketTypeId,
      quantity: order.quantity,
      status: order.status,
      totalPriceInCents: order.totalPriceInCents,
      createdAt: order.createdAt,
    };
  }
}
