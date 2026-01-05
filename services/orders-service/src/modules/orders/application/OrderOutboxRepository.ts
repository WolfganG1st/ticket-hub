import type { OrderCreatedEvent, OrderPaidEvent } from 'shared-kernel';

export type OrderOutboxType = 'ORDER_CREATED' | 'ORDER_PAID';

export type OrderOutboxPayload = OrderCreatedEvent | OrderPaidEvent;

export interface OrderOutboxRepository {
  enqueue(aggregateId: string, type: OrderOutboxType, payload: OrderOutboxPayload): Promise<void>;

  claimPending(batchSize: number): Promise<
    {
      id: string;
      aggregateId: string;
      type: OrderOutboxType;
      payload: OrderOutboxPayload;
      createdAt: Date;
    }[]
  >;

  markAsSent(id: string): Promise<void>;
  markAsFailed(id: string, errorMessage?: string): Promise<void>;
}
