import { createEventRequestSchema, createOrderRequestSchema, ValidationError } from 'shared-kernel';
import type { CreateEventUseCase } from '../../modules/events/application/CreateEventUseCase';
import type { GetEventByIdUseCase } from '../../modules/events/application/GetEventByIdUseCase';
import type { ListEventsUseCase } from '../../modules/events/application/ListEventsUseCase';
import type { CreateOrderUseCase } from '../../modules/orders/application/CreateOrderUseCase';
import type { GetOrderByIdUseCase } from '../../modules/orders/application/GetOrderByIdUseCase';
import type { PayOrderUseCase } from '../../modules/orders/application/PayOrderUseCase';
import { safeHttpHandler } from './utils/safe-http-handler';

export class OrdersHttpController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly listEventsUseCase: ListEventsUseCase,
    private readonly getEventByIdUseCase: GetEventByIdUseCase,
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderByIdUseCase: GetOrderByIdUseCase,
    private readonly payOrderUseCase: PayOrderUseCase,
  ) {}

  public createEvent = safeHttpHandler(async (req, res) => {
    const headerValue = req.header('x-idempotency-key');
    const idempotencyKeyHeader = Array.isArray(headerValue) ? headerValue[0] : (headerValue ?? null);
    const parsed = createEventRequestSchema.parse(req.body);

    const startsAt = new Date(parsed.startsAt);
    const endsAt = new Date(parsed.endsAt);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new ValidationError('Invalid date format');
    }

    const result = await this.createEventUseCase.execute({
      idempotencyKey: idempotencyKeyHeader,
      organizerId: parsed.organizerId,
      title: parsed.title,
      description: parsed.description,
      venue: parsed.venue,
      startsAt,
      endsAt,
      ticketTypes: parsed.ticketTypes,
    });

    res.status(201).json({ eventId: result.eventId });
  });

  public listEvents = safeHttpHandler(async (req, res) => {
    const organizerId = typeof req.query.organizerId === 'string' ? req.query.organizerId : undefined;

    const result = await this.listEventsUseCase.execute({
      organizerId,
    });

    res.status(200).json(result);
  });

  public getEventById = safeHttpHandler(async (req, res) => {
    const { id } = req.params as { id: string };

    const result = await this.getEventByIdUseCase.execute({ eventId: id });

    res.status(200).json(result);
  });

  public createOrder = safeHttpHandler(async (req, res) => {
    const headerValue = req.header('x-idempotency-key');
    const idempotencyKeyHeader = Array.isArray(headerValue) ? headerValue[0] : (headerValue ?? null);
    const parsed = createOrderRequestSchema.parse(req.body);

    const result = await this.createOrderUseCase.execute({
      idempotencyKey: idempotencyKeyHeader,
      customerId: parsed.customerId,
      eventId: parsed.eventId,
      ticketTypeId: parsed.ticketTypeId,
      quantity: parsed.quantity,
    });

    res.status(201).json({ orderId: result.orderId, totalPriceInCents: result.totalPriceInCents });
  });

  public getOrderById = safeHttpHandler(async (req, res) => {
    const { id } = req.params as { id: string };

    const result = await this.getOrderByIdUseCase.execute({ orderId: id });

    res.status(200).json(result);
  });

  public payOrder = safeHttpHandler(async (req, res) => {
    const { id } = req.params as { id: string };

    const result = await this.payOrderUseCase.execute({ orderId: id });

    res.status(200).json(result);
  });
}
