import type { Producer } from 'kafkajs';
import { logger } from 'shared-kernel';
import type { OrderOutboxRepository } from '../../modules/orders/application/OrderOutboxRepository';

type StartOrderOutboxWorkerInput = {
  outboxRepository: OrderOutboxRepository;
  producer: Producer;
  topic: string;
  batchSize: number;
  pollIntervalMs: number;
};

type OrderOutboxWorker = {
  shutdown: () => Promise<void>;
};

export type ProcessOutboxBatchInput = {
  outboxRepository: OrderOutboxRepository;
  producer: Producer;
  topic: string;
  batchSize: number;
};

export const processOutboxBatch = async (input: ProcessOutboxBatchInput): Promise<void> => {
  const { outboxRepository, producer, topic, batchSize } = input;

  const pendingEntries = await outboxRepository.claimPending(batchSize);

  if (pendingEntries.length === 0) {
    return;
  }

  for (const event of pendingEntries) {
    try {
      await producer.send({
        topic,
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
};

export function startOrderOutboxWorker(input: StartOrderOutboxWorkerInput): OrderOutboxWorker {
  const { outboxRepository, producer, topic, batchSize, pollIntervalMs } = input;

  let isShuttingDown = false;
  let currentTimeout: NodeJS.Timeout | null = null;
  let loopPromise: Promise<void> | null = null;

  const sleepCancellable = (ms: number): Promise<void> => {
    return new Promise((resolve) => {
      currentTimeout = setTimeout(() => {
        currentTimeout = null;
        resolve();
      }, ms);
    });
  };

  const processLoop = async (): Promise<void> => {
    while (!isShuttingDown) {
      try {
        await processOutboxBatch({ outboxRepository, producer, topic, batchSize });
        await sleepCancellable(pollIntervalMs);
      } catch (error) {
        logger.error(`Outbox worker loop error ${error}`);
        await sleepCancellable(pollIntervalMs);
      }
    }
  };

  const shutdown = async (): Promise<void> => {
    if (isShuttingDown) {
      return;
    }

    logger.info('Shutting down outbox worker...');
    isShuttingDown = true;

    if (currentTimeout) {
      clearTimeout(currentTimeout);
      currentTimeout = null;
    }

    if (await loopPromise) {
      await loopPromise;
    }
  };

  loopPromise = processLoop().catch((error) => {
    logger.error('Outbox worker fatal error:', error);
  });

  return { shutdown };
}
