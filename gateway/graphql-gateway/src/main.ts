import process from 'node:process';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { loadGatewayEnv } from '@ticket-hub/config';

import cors from 'cors';
import express from 'express';
import { logger, loggerMiddleware } from 'shared-kernel';
import type { GraphQlContext } from './context';
import { createRedisClient, RedisCache } from './infra/redis-cache';
import { resolvers } from './resolvers';
import { typeDefs } from './schema';
import { AccountsApi } from './services/accounts-api';
import { OrdersApi } from './services/orders-api';

async function bootstrap(): Promise<void> {
  const env = loadGatewayEnv();

  const accountsApi = new AccountsApi(env.ACCOUNTS_BASE_URL);
  const ordersApi = new OrdersApi(env.ORDERS_BASE_URL);

  const redisClient = await createRedisClient(env.REDIS_URL);
  const cache = new RedisCache(redisClient, 60);

  const server = new ApolloServer<GraphQlContext>({
    typeDefs,
    resolvers,
  });

  await server.start();

  const app = express();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    loggerMiddleware,
    expressMiddleware(server, {
      context: ({ req }: { req: express.Request }): Promise<GraphQlContext> => {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

        const currentUserPromise = accountsApi.me(token);

        return Promise.resolve({
          authToken: token,
          accountsApi,
          ordersApi,
          cache,
          currentUserPromise,
        });
      },
    }),
  );

  app.listen(env.PORT, () => {
    logger.info(`GraphQl Gateway listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.error(`Failed to start GraphQl Gateway, ${error}`);
  process.exit(1);
});
