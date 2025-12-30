import { ConflictError } from 'shared-kernel';
import { describe, expect, it } from 'vitest';
import { Order } from '../../../src/modules/orders/domain/Order';

describe('Order (unit) - State Transitions', () => {
  it('should allow pay from PENDING -> PAID', () => {
    const order = new Order('order-id', 'customer-id', 'event-id', 'ticket-type-id', 1, 'PENDING', 1000, new Date());

    order.pay();

    expect(order.status).toBe('PAID');
  });

  it('should reject pay when already PAID', () => {
    const order = new Order('order-id', 'customer-id', 'event-id', 'ticket-type-id', 1, 'PAID', 1000, new Date());

    expect(() => order.pay()).toThrow(ConflictError);
  });
});
