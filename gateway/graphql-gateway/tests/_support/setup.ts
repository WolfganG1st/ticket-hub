import process from 'node:process';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { createGatewayTestContext, type GatewayTestContext } from './context';

process.env.TZ = 'UTC';

declare global {
  var __gatewayTestContext: GatewayTestContext;
}

beforeAll(async () => {
  global.__gatewayTestContext = await createGatewayTestContext();
});

beforeEach(async () => {
  if (global.__gatewayTestContext) {
    await global.__gatewayTestContext.reset();
  }
});

afterAll(async () => {
  if (global.__gatewayTestContext) {
    await global.__gatewayTestContext.close();
  }
});
