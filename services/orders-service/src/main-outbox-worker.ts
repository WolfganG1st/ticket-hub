import process from 'node:process';
import { loadOrdersEnv } from '@ticket-hub/config';
import { Kafka } from 'kafkajs';
import { logger } from 'shared-kernel';
import { startOrderOutboxWorker } from './infra/outbox/OrderOutboxWorker';
import { DrizzleOrderOutboxRepository } from './infra/persistence/DrizzleOrderOutboxRepository';
import { createDb } from './infra/persistence/db';

async function bootstrapOutboxWorker(): Promise<void> {
  const env = loadOrdersEnv();
  const db = createDb(env.ORDERS_DATABASE_URL);
  const outboxRepository = new DrizzleOrderOutboxRepository(db);

  const kafka = new Kafka({
    clientId: 'orders-outbox-worker',
    brokers: env.ORDERS_KAFKA_BROKERS.split(',').map((broker) => broker.trim()),
  });

  const producer = kafka.producer();
  await producer.connect();

  await startOrderOutboxWorker({
    outboxRepository,
    producer,
    batchSize: env.ORDERS_OUTBOX_BATCH_SIZE ?? 50,
    pollIntervalMs: env.ORDERS_OUTBOX_POLL_INTERVAL_MS ?? 1000,
  });
}

bootstrapOutboxWorker().catch((error) => {
  logger.error('Outbox worker failed to start:', error);
  process.exit(1);
});
