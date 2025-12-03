import { loadAccountsEnv } from '@ticket-hub/config';
import express, { Router } from 'express';
import { buildAccountRouter } from './modules/accounts/infra/http/accounts-routes';
import { globalErrorHandler } from './modules/accounts/infra/http/utils/global-error-handler';
import { createDb } from './modules/accounts/infra/persistence/db';

function bootstrapHttp(): void {
  const env = loadAccountsEnv();
  const db = createDb(env.ACCOUNTS_DATABASE_URL);

  const app = express();
  app.use(express.json());

  const v1Router = Router();
  v1Router.use('/accounts', buildAccountRouter(db, env));

  app.use('/api/v1', v1Router);

  app.use(globalErrorHandler);

  app.listen(env.PORT, () => {});
}

bootstrapHttp();
