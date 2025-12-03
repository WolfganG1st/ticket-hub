import type { OrdersEnv } from '@ticket-hub/config';
import { Router } from 'express';
import type { Db } from '../persistence/db';
import { OrdersHttpController } from './OrdersHttpController';

export function buildOrderRouter(db: Db, env: OrdersEnv): Router {
  const router = Router();

  const controller = new OrdersHttpController();

  router.post('/example', controller.example);

  return router;
}
