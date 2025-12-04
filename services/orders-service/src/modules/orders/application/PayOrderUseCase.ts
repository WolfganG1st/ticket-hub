import { ConflictError, NotFoundError } from 'shared-kernel';
import type { OrderRepository } from '../domain/OrderRepository';

type PayOrderInput = {
  orderId: string;
};

type PayOrderOutput = {
  id: string;
  status: 'PAID';
};

export class PayOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  public async execute(input: PayOrderInput): Promise<PayOrderOutput> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === 'PAID') {
      throw new ConflictError('Order already paid');
    }

    order.pay();

    await this.orderRepository.save(order);

    return {
      id: order.id,
      status: 'PAID',
    };
  }
}
