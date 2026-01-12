import process from 'node:process';
import { loadOrdersEnv } from '@ticket-hub/config';
import { Kafka } from 'kafkajs';
import { Pool } from 'pg';
import { logger } from 'shared-kernel';
import { startOrderOutboxWorker } from './infra/outbox/OrderOutboxWorker';
import { DrizzleOrderOutboxRepository } from './infra/persistence/DrizzleOrderOutboxRepository';
import { createDb } from './infra/persistence/db';

async function bootstrapOutboxWorker(): Promise<void> {
  const env = loadOrdersEnv();
  const pool = new Pool({
    connectionString: env.ORDERS_DATABASE_URL,
  });
  const db = createDb(pool);
  const outboxRepository = new DrizzleOrderOutboxRepository(db);

  const kafka = new Kafka({
    clientId: 'orders-outbox-worker',
    brokers: env.ORDERS_KAFKA_BROKERS.split(',').map((broker) => broker.trim()),
  });

  const producer = kafka.producer();
  await producer.connect();

  const worker = startOrderOutboxWorker({
    outboxRepository,
    producer,
    topic: env.ORDERS_KAFKA_TOPIC ?? '',
    batchSize: env.ORDERS_OUTBOX_BATCH_SIZE ?? 50,
    pollIntervalMs: env.ORDERS_OUTBOX_POLL_INTERVAL_MS ?? 1000,
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, initiating graceful shutdown...`);

    await worker.shutdown();
    await producer.disconnect();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  logger.info('Outbox worker started. Press Ctrl+C to stop.');
}

bootstrapOutboxWorker().catch((error) => {
  logger.error('Outbox worker failed to start:', error);
  process.exit(1);
});
