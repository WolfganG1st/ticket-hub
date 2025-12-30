import { eq } from 'drizzle-orm';
import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { events, ticketTypes } from '../../../src/infra/persistence/schema';
import { getOrdersTestContext } from '../../_support/setup';

describe('CreateEvent (integration)', () => {
  it('should create event with ticketTypes (201) and persist all rows', async () => {
    const { app, db } = getOrdersTestContext();

    const organizerId = uuidv7();
    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() + 1); // tomorrow
    const endsAt = new Date(startsAt);
    endsAt.setHours(endsAt.getHours() + 2);

    const body = {
      organizerId,
      title: 'Integration Test Event',
      description: 'A test event',
      venue: 'Test Venue',
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      ticketTypes: [
        {
          name: 'VIP',
          priceInCents: 10000,
          totalQuantity: 50,
        },
        {
          name: 'General',
          priceInCents: 5000,
          totalQuantity: 100,
        },
      ],
    };

    const response = await request(app).post('/api/v1/events').send(body);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('eventId');

    const eventId = response.body.eventId;

    // Verify event persistence
    const savedEvent = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    expect(savedEvent).toBeDefined();
    expect(savedEvent?.title).toBe(body.title);
    expect(savedEvent?.organizerId).toBe(organizerId);

    // Verify ticket types persistence
    const savedTicketTypes = await db.query.ticketTypes.findMany({
      where: eq(ticketTypes.eventId, eventId),
    });

    expect(savedTicketTypes).toHaveLength(2);
    expect(savedTicketTypes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'VIP',
          priceInCents: 10000,
          totalQuantity: 50,
          remainingQuantity: 50,
        }),
        expect.objectContaining({
          name: 'General',
          priceInCents: 5000,
          totalQuantity: 100,
          remainingQuantity: 100,
        }),
      ]),
    );
  });

  it('should be idempotent when same x-idempotency-key is reused', async () => {
    const { app, db } = getOrdersTestContext();

    const organizerId = uuidv7();
    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() + 1); // tomorrow
    const endsAt = new Date(startsAt);
    endsAt.setHours(endsAt.getHours() + 2);

    const body = {
      organizerId,
      title: 'Integration Test Event',
      description: 'A test event',
      venue: 'Test Venue',
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      ticketTypes: [
        {
          name: 'VIP',
          priceInCents: 10000,
          totalQuantity: 50,
        },
        {
          name: 'General',
          priceInCents: 5000,
          totalQuantity: 100,
        },
      ],
    };

    const response = await request(app).post('/api/v1/events').send(body);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('eventId');

    const eventId = response.body.eventId;

    // Verify event persistence
    const savedEvent = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    expect(savedEvent).toBeDefined();
    expect(savedEvent?.title).toBe(body.title);
    expect(savedEvent?.organizerId).toBe(organizerId);

    // Verify ticket types persistence
    const savedTicketTypes = await db.query.ticketTypes.findMany({
      where: eq(ticketTypes.eventId, eventId),
    });

    expect(savedTicketTypes).toHaveLength(2);
    expect(savedTicketTypes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'VIP',
          priceInCents: 10000,
          totalQuantity: 50,
          remainingQuantity: 50,
        }),
        expect.objectContaining({
          name: 'General',
          priceInCents: 5000,
          totalQuantity: 100,
          remainingQuantity: 100,
        }),
      ]),
    );
  });
});
