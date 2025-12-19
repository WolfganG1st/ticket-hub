import { type AccountsEnv, loadAccountsEnv } from '@ticket-hub/config';
import express, { type Express } from 'express';
import { logger, loggerMiddleware } from 'shared-kernel';
import { buildAccountRouter } from './modules/accounts/infra/http/accounts-routes';
import { globalErrorHandler } from './modules/accounts/infra/http/utils/global-error-handler';
import { createDb, type Db } from './modules/accounts/infra/persistence/db';

export function makeApp(db: Db, env: AccountsEnv): Express {
  const app = express();
  app.use(express.json());
  app.use(loggerMiddleware);

  app.use('/api/v1', buildAccountRouter(db, env));

  app.use(globalErrorHandler);
  return app;
}

function bootstrapHttp(): void {
  const env = loadAccountsEnv();
  const db = createDb(env.ACCOUNTS_DATABASE_URL);
  const app = makeApp(db, env);

  app.listen(env.PORT, () => {
    logger.info(`Accounts service listening on port ${env.PORT}`);
  });
}

if (require.main === module) {
  bootstrapHttp();
}
