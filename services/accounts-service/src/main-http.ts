import { loadAccountsEnv } from 'config';
import express, { Router } from 'express';
import { buildAccountRouter } from './modules/accounts/infra/http/accounts-routes';

import { globalErrorHandler } from './modules/accounts/infra/http/utils/global-error-handler';

function bootstrapHttp(): void {
  const env = loadAccountsEnv();

  const app = express();
  app.use(express.json());

  const v1Router = Router();
  v1Router.use('/accounts', buildAccountRouter());

  app.use('/api/v1', v1Router);

  app.use(globalErrorHandler);

  app.listen(env.PORT, () => {
    console.log(`${env.SERVICE_NAME} started on port ${env.PORT}`);
  });
}

bootstrapHttp();
