import { type Consumer, Kafka } from 'kafkajs';
import { ValidationError } from 'shared-kernel';

type CreateKafkaConsumer = {
  clientId: string;
  brokers: string;
  groupId: string;
};

export function createKafkaConsumer(input: CreateKafkaConsumer): Consumer {
  const brokers = input.brokers
    .split(',')
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  if (brokers.length === 0) {
    throw new ValidationError('Kafka brokers list is empty');
  }

  const kafka = new Kafka({
    clientId: input.clientId,
    brokers,
  });

  return kafka.consumer({
    groupId: input.groupId,
  });
}
