import { loadOrdersEnv } from '@ticket-hub/config';
import express, { Router } from 'express';
import { buildOrderRouter } from './modules/infra/http/orders-routes';
import { globalErrorHandler } from './modules/infra/http/utils/global-error-handler';
import { createDb } from './modules/infra/persistence/db';

function bootstrapHttp(): void {
  const env = loadOrdersEnv();
  const db = createDb(env.ORDERS_DATABASE_URL);

  const app = express();
  app.use(express.json());

  const v1Router = Router();
  v1Router.use('/orders', buildOrderRouter(db, env));

  app.use('/api/v1', v1Router);

  app.use(globalErrorHandler);

  app.listen(env.PORT, () => {});
}

bootstrapHttp();
