import type { Order } from './Order';

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  save(order: Order, idempotencyKey?: string | null): Promise<void>;
  findByIdempotencyKey(key: string): Promise<Order | null>;
}
