import { ValidationError } from 'shared-kernel';
import { describe, expect, it } from 'vitest';
import { Event } from '../../../src/modules/events/domain/Event';

describe('Event (unit) - Validation', () => {
  it('should reject endsAt before startsAt', () => {
    const startsAt = new Date('2024-01-02T10:00:00Z');
    const endsAt = new Date('2024-01-01T10:00:00Z'); // Before startsAt

    expect(() => {
      new Event('event-id', 'organizer-id', 'My Event', 'Description', 'Venue', startsAt, endsAt, new Date());
    }).toThrow(ValidationError);
  });
});
