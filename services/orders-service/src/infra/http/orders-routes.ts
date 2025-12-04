import type { OrdersEnv } from '@ticket-hub/config';
import { Router } from 'express';
import { CreateEventUseCase } from '../../modules/events/application/CreateEventUseCase';
import { GetEventByIdUseCase } from '../../modules/events/application/GetEventByIdUseCase';
import { ListEventsUseCase } from '../../modules/events/application/ListEventsUseCase';
import { CreateOrderUseCase } from '../../modules/orders/application/CreateOrderUseCase';
import { PayOrderUseCase } from '../../modules/orders/application/PayOrderUseCase';
import { DrizzleEventRepository } from '../persistence/DrizzleEventRepository';
import { DrizzleOrderRepository } from '../persistence/DrizzleOrderRepository';
import { DrizzleTicketTypeRepository } from '../persistence/DrizzleTicketTypeRepository';
import type { Db } from '../persistence/db';
import { OrdersHttpController } from './OrdersHttpController';

export function buildOrderRouter(db: Db, _env: OrdersEnv): Router {
  const router = Router();

  const eventRepository = new DrizzleEventRepository(db);
  const ticketTypeRepository = new DrizzleTicketTypeRepository(db);
  const orderRepository = new DrizzleOrderRepository(db);

  const createEventUseCase = new CreateEventUseCase(eventRepository, ticketTypeRepository);
  const listEventsUseCase = new ListEventsUseCase(eventRepository);
  const getEventByIdUseCase = new GetEventByIdUseCase(eventRepository, ticketTypeRepository);

  const createOrderUseCase = new CreateOrderUseCase(orderRepository, eventRepository, ticketTypeRepository);
  const payOrderUseCase = new PayOrderUseCase(orderRepository);

  const controller = new OrdersHttpController(
    createEventUseCase,
    listEventsUseCase,
    getEventByIdUseCase,
    createOrderUseCase,
    payOrderUseCase,
  );

  router.post('/events', controller.createEvent);
  router.get('/events', controller.listEvents);
  router.get('/events/:id', controller.getEventById);

  router.post('/orders', controller.createOrder);
  router.post('/orders/:id/pay', controller.payOrder);

  return router;
}
