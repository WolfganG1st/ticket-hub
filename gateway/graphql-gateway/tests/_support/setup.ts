import { afterAll, beforeAll, beforeEach } from 'vitest';
import { createGatewayTestContext, type GatewayTestContext } from './context';

declare global {
  var __gatewayTestContext: GatewayTestContext;
}

beforeAll(async () => {
  globalThis.__gatewayTestContext = await createGatewayTestContext();
});

beforeEach(async () => {
  await globalThis.__gatewayTestContext.reset();
});

afterAll(async () => {
  await globalThis.__gatewayTestContext.close();
});
