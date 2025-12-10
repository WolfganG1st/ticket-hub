import type { Producer } from 'kafkajs';
import { logger } from 'shared-kernel';
import type { OrderOutboxRepository } from '../../modules/orders/application/OrderOutboxRepository';

type StartOrderOutboxWorkerInput = {
  outboxRepository: OrderOutboxRepository;
  producer: Producer;
  batchSize: number;
  pollIntervalMs: number;
};

export async function startOrderOutboxWorker(input: StartOrderOutboxWorkerInput): Promise<void> {
  const { outboxRepository, producer, batchSize, pollIntervalMs } = input;

  while (true) {
    try {
      const pendingEntries = await outboxRepository.findPending(batchSize);

      if (pendingEntries.length === 0) {
        await sleep(pollIntervalMs);
        continue;
      }

      for (const event of pendingEntries) {
        try {
          await producer.send({
            topic: 'orders.events',
            messages: [
              {
                key: event.aggregateId,
                value: JSON.stringify(event.payload),
                headers: {
                  type: event.type,
                },
              },
            ],
          });

          await outboxRepository.markAsSent(event.id);
        } catch (error) {
          logger.error(`Failed to publish outbox event ${event.id}, ${error}`);
          await outboxRepository.markAsFailed(event.id, (error as Error).message);
        }
      }
    } catch (error) {
      logger.error(`Outbox worker loop error ${error}`);
      await sleep(pollIntervalMs);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
