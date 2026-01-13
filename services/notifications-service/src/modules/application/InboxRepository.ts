export interface InboxRepository {
  tryMarkProcessed(idempotencyKey: string, meta: { eventName: string; orderId: string }): Promise<boolean>;
}
