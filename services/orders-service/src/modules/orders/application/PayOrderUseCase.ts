import { NotFoundError } from 'shared-kernel';
import type { OrderRepository } from '../domain/OrderRepository.port';

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

    order.pay();

    await this.orderRepository.save(order);

    return {
      id: order.id,
      status: 'PAID',
    };
  }
}
