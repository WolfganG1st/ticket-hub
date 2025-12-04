import { loadOrdersEnv } from '@ticket-hub/config';
import express, { Router } from 'express';
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

  const v1Router = Router();
  v1Router.use('/orders', buildOrderRouter(db, env));

  app.use('/api/v1', v1Router);

  app.use(globalErrorHandler);

  app.listen(env.PORT, () => {
    logger.info(`Orders service listening on port ${env.PORT}`);
  });
}

bootstrapHttp();
