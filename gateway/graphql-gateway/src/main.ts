import process from 'node:process';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { type GatewayEnv, loadGatewayEnv } from '@ticket-hub/config';

import cors from 'cors';
import express, { type Express } from 'express';
import { logger, loggerMiddleware } from 'shared-kernel';
import type { GraphQlContext } from './context';
import { formatError } from './infra/error-mapping';
import { createRedisClient, RedisCache } from './infra/redis-cache';
import { resolvers } from './resolvers';
import { typeDefs } from './schema';
import { AccountsApi } from './services/accounts-api';
import { OrdersApi } from './services/orders-api';

export async function makeApp(env: GatewayEnv): Promise<Express> {
  const accountsApi = new AccountsApi(env.ACCOUNTS_BASE_URL);
  const ordersApi = new OrdersApi(env.ORDERS_BASE_URL);

  const redisClient = await createRedisClient(env.REDIS_URL);
  const cache = new RedisCache(redisClient, 60);

  const server = new ApolloServer<GraphQlContext>({
    typeDefs,
    resolvers,
    formatError,
  });

  await server.start();

  const app = express();

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK' });
  });

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    loggerMiddleware,
    expressMiddleware(server, {
      context: ({ req }: { req: express.Request }): Promise<GraphQlContext> => {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
        const idempotencyKey = (req.headers['x-idempotency-key'] as string | undefined) ?? null;
        const currentUserPromise = accountsApi.me(token);

        return Promise.resolve({
          authToken: token,
          accountsApi,
          ordersApi,
          cache,
          currentUserPromise,
          idempotencyKey,
        });
      },
    }),
  );

  return app;
}

async function bootstrap(): Promise<void> {
  const env = loadGatewayEnv();
  const app = await makeApp(env);

  app.listen(env.PORT, () => {
    logger.info(`GraphQl Gateway listening on port ${env.PORT}`);
  });
}

if (require.main === module) {
  bootstrap().catch((error) => {
    logger.error(error, 'Failed to start GraphQl Gateway');
    process.exit(1);
  });
}
