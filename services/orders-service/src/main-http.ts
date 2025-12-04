import { loadOrdersEnv } from '@ticket-hub/config';
import express from 'express';
import { logger, loggerMiddleware } from 'shared-kernel';
import { buildOrderRouter } from './infra/http/orders-routes';
import { globalErrorHandler } from './infra/http/utils/global-error-handler';
import { createDb } from './infra/persistence/db';

function bootstrapHttp(): void {
  const env = loadOrdersEnv();
  const db = createDb(env.ORDERS_DATABASE_URL);

  const app = express();
  app.use(express.json());
  app.use(loggerMiddleware);

  app.use('/api/v1', buildOrderRouter(db, env));

  app.use(globalErrorHandler);

  app.listen(env.PORT, () => {
    logger.info(`Orders service listening on port ${env.PORT}`);
  });
}

bootstrapHttp();
