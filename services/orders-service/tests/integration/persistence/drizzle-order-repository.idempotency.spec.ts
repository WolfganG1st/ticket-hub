import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { DrizzleOrderRepository } from '../../../src/infra/persistence/DrizzleOrderRepository';
import { Order } from '../../../src/modules/orders/domain/Order';
import { getOrdersTestContext } from '../../_support/setup';

describe('DrizzleOrderRepository (integration) - Idempotency', () => {
  it('should find order by idempotency key', async () => {
    const { db } = getOrdersTestContext();
    const repository = new DrizzleOrderRepository(db);

    const orderId = uuidv7();
    const customerId = uuidv7();
    const eventId = uuidv7();
    const ticketTypeId = uuidv7();
    const idempotencyKey = 'test-idem-repo-1';

    const order = new Order(orderId, customerId, eventId, ticketTypeId, 2, 'PENDING', 2000, new Date());

    // Save with idempotency key
    await repository.save(order, idempotencyKey);

    // Find by key
    const found = await repository.findByIdempotencyKey(idempotencyKey);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(orderId);
    expect(found?.totalPriceInCents).toBe(2000);

    // Find by non-existent key
    const notFound = await repository.findByIdempotencyKey('non-existent-key');
    expect(notFound).toBeNull();
  });
});
