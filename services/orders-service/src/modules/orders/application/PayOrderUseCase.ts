import { NotFoundError, orderPaidEventSchema } from 'shared-kernel';
import type { OrderRepository } from '../domain/OrderRepository.port';
import type { OrderOutboxRepository } from './OrderOutboxRepository';

type PayOrderInput = {
  orderId: string;
};

type PayOrderOutput = {
  id: string;
  status: 'PAID';
};

export class PayOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly outboxRepository: OrderOutboxRepository,
  ) {}

  public async execute(input: PayOrderInput): Promise<PayOrderOutput> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    order.pay();

    await this.orderRepository.save(order);

    const orderPaidEvent = orderPaidEventSchema.parse({
      eventName: 'OrderPaid',
      orderId: order.id,
      paidAt: new Date().toISOString(),
    });

    await this.outboxRepository.enqueue(order.id, 'ORDER_PAID', orderPaidEvent);

    return {
      id: order.id,
      status: 'PAID',
    };
  }
}
