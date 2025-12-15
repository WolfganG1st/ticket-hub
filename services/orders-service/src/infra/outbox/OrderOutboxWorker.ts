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

  const publishEvent = async (event: {
    id: string;
    aggregateId: string;
    type: string;
    payload: unknown;
  }): Promise<void> => {
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
  };

  const processBatch = async (
    entries: Array<{ id: string; aggregateId: string; type: string; payload: unknown }>,
  ): Promise<void> => {
    for (const event of entries) {
      if (isShuttingDown) {
        break;
      }

      try {
        await publishEvent(event);
      } catch (error) {
        logger.error(`Failed to publish outbox event ${event.id}, ${error}`);
        await outboxRepository.markAsFailed(event.id, (error as Error).message);
      }
    }
  };

  const processLoop = async (): Promise<void> => {
    while (!isShuttingDown) {
      try {
        const pendingEntries = await outboxRepository.findPending(batchSize);

        if (pendingEntries.length === 0) {
          await sleepCancellable(pollIntervalMs);
          continue;
        }

        await processBatch(pendingEntries);
      } catch (error) {
        logger.error(`Outbox worker loop error ${error}`);
        await sleepCancellable(pollIntervalMs);
      }
    }

    logger.info('Outbox worker stopped');
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

    if (loopPromise) {
      await loopPromise;
    }
  };

  loopPromise = processLoop().catch((error) => {
    logger.error('Outbox worker fatal error:', error);
  });

  return { shutdown };
}
