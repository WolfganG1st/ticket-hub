import process from 'node:process';
import type { Consumer, EachMessagePayload } from 'kafkajs';
import { logger, type OrderEvent, orderEventSchema } from 'shared-kernel';
import type { InboxRepository } from '../../modules/application/InboxRepository';

type StartOrdersEventsConsumerInput = {
  consumer: Consumer;
  topic: string;
  inboxRepository: InboxRepository;
};

export async function startOrdersEventsConsumer(
  params: StartOrdersEventsConsumerInput,
): Promise<{ shutdown: () => Promise<void> }> {
  const { consumer, topic, inboxRepository } = params;

  await consumer.subscribe({ topic, fromBeginning: false });

  let isShuttingDown = false;

  await consumer.run({
    eachMessage: async (payload: EachMessagePayload) => {
      if (isShuttingDown) {
        return;
      }

      const { message, partition } = payload;

      if (!message.value) {
        logger.warn({ topic, partition }, 'Kafka message missing value');
        return;
      }

      const raw = message.value.toString('utf8');

      let parsed: OrderEvent;
      try {
        const json = JSON.parse(raw);
        parsed = orderEventSchema.parse(json);
      } catch (error) {
        logger.error({ error, topic, partition, raw }, 'Failed to parse OrderEvent');
        return;
      }

      const idempotencyKey = buildIdempotencyKey(parsed);

      const firstTime = await inboxRepository.tryMarkProcessed(idempotencyKey, {
        eventName: parsed.eventName,
        orderId: parsed.orderId,
      });

      if (!firstTime) {
        logger.debug(
          {
            topic,
            partition,
            eventName: parsed.eventName,
            orderId: parsed.orderId,
            idempotencyKey,
          },
          'Duplicate event ignored',
        );
        return;
      }

      handleEvent(parsed);
    },
  });

  async function shutdown(): Promise<void> {
    isShuttingDown = true;
    await consumer.stop();
    await consumer.disconnect();
    process.exit(0);
  }

  return { shutdown };
}

function buildIdempotencyKey(event: OrderEvent): string {
  if (event.eventName === 'OrderCreated') {
    return `${event.eventName}:${event.orderId}:${event.occurredAt}`;
  }

  return `${event.eventName}:${event.orderId}:${event.paidAt}`;
}

function handleEvent(event: OrderEvent): void {
  if (event.eventName === 'OrderCreated') {
    logger.info(
      {
        orderId: event.orderId,
        customerId: event.customerId,
        eventId: event.eventId,
        ticketTypeId: event.ticketTypeId,
        quantity: event.quantity,
        totalPriceInCents: event.totalPriceInCents,
        occurredAt: event.occurredAt,
      },
      'OrderCreated processed',
    );
    return;
  }

  logger.info({ orderId: event.orderId, paidAt: event.paidAt }, 'OrderPaid processed');
}
