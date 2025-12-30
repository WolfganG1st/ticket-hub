import { ValidationError } from 'shared-kernel';
import { describe, expect, it } from 'vitest';
import { TicketType } from '../../../src/modules/events/domain/Event';
import { InsufficientStockError } from '../../../src/modules/events/domain/errors/InsufficientStockError';

describe('TicketType (unit) - Reserve', () => {
  it('should reserve when enough stock', () => {
    const ticketType = new TicketType(
      'tt-id',
      'event-id',
      'General Admission',
      1000,
      100,
      100, // remaining
      new Date(),
    );

    ticketType.reserve(10);

    expect(ticketType.remainingQuantity).toBe(90);
  });

  it('should throw when reserving more than remainingQuantity', () => {
    const ticketType = new TicketType(
      'tt-id',
      'event-id',
      'General Admission',
      1000,
      100,
      5, // remaining
      new Date(),
    );

    expect(() => ticketType.reserve(6)).toThrow(InsufficientStockError);
  });

  it('should reject zero/negative reserve quantity', () => {
    const ticketType = new TicketType('tt-id', 'event-id', 'General Admission', 1000, 100, 100, new Date());

    expect(() => ticketType.reserve(0)).toThrow(ValidationError);
    expect(() => ticketType.reserve(-1)).toThrow(ValidationError);
  });
});
