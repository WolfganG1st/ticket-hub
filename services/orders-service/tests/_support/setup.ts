import { afterAll, beforeAll, beforeEach } from 'vitest';

import type { OrdersTestContext } from './context';
import { createOrdersTestContext } from './context';

declare global {
  var __ordersTestContext: OrdersTestContext | undefined;
}

beforeAll(async () => {
  globalThis.__ordersTestContext = await createOrdersTestContext();
});

beforeEach(async () => {
  await globalThis.__ordersTestContext?.reset();
});

afterAll(async () => {
  await globalThis.__ordersTestContext?.close();
  globalThis.__ordersTestContext = undefined;
});

export function getOrdersTestContext(): OrdersTestContext {
  if (!globalThis.__ordersTestContext) {
    throw new Error('Orders test context not initialized');
  }
  return globalThis.__ordersTestContext;
}
