import process from 'node:process';
import { loadNotificationsEnv } from '@ticket-hub/config';
import { Pool } from 'pg';
import { logger } from 'shared-kernel';
import { createKafkaConsumer } from './infra/kafka/createKafkaConsumer';
import { startOrdersEventsConsumer } from './infra/kafka/orders-events-consumer';
import { DrizzleInboxRepository } from './infra/persistence/DrizzleInboxRepository';
import { createDb } from './infra/persistence/db';

async function bootstrapInboxWorker(): Promise<void> {
  const env = loadNotificationsEnv();
  const pool = new Pool({
    connectionString: env.NOTIFICATIONS_DATABASE_URL,
  });
  const db = createDb(pool);
  const inboxRepository = new DrizzleInboxRepository(db);

  const consumer = createKafkaConsumer({
    clientId: 'notifications-inbox-worker',
    brokers: env.NOTIFICATIONS_KAFKA_BROKERS,
    groupId: env.NOTIFICATIONS_CONSUMER_GROUP_ID,
  });

  await consumer.connect();

  const worker = await startOrdersEventsConsumer({
    inboxRepository,
    consumer,
    topic: env.NOTIFICATIONS_KAFKA_TOPIC,
  });

  const shutdown = async () => {
    logger.info('Shutting down inbox worker...');
    await pool.end();
    await worker.shutdown();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  logger.info('Inbox worker started. Press Ctrl+C to stop.');
}

bootstrapInboxWorker().catch((error) => {
  logger.error(error, 'Inbox worker failed to start');
  process.exit(1);
});
