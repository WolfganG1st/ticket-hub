import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { getOrdersTestContext } from '../../_support/setup';

describe('CreateEvent (integration) - Validation', () => {
  it('should return 400 when startsAt is in the past', async () => {
    const { app } = getOrdersTestContext();

    const startsAt = new Date();
    const yesterday = startsAt.getDate() - 1;
    startsAt.setDate(yesterday);
    const endsAt = new Date();
    const tomorrow = endsAt.getDate() + 1;
    endsAt.setDate(tomorrow);

    const body = {
      organizerId: uuidv7(),
      title: 'Past Event',
      venue: 'Venue',
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      ticketTypes: [
        {
          name: 'General',
          priceInCents: 1000,
          totalQuantity: 10,
        },
      ],
    };

    const response = await request(app).post('/api/v1/events').send(body);
    expect(response.status).toBe(400);
  });

  it('should return 400 when ticketTypes is empty', async () => {
    const { app } = getOrdersTestContext();

    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() + 1);
    const endsAt = new Date(startsAt);
    endsAt.setHours(endsAt.getHours() + 2);

    const body = {
      organizerId: uuidv7(),
      title: 'No Tickets Event',
      venue: 'Venue',
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      ticketTypes: [],
    };

    const response = await request(app).post('/api/v1/events').send(body);
    expect(response.status).toBe(400);
  });

  it('should return 400 when ticketTypes contains invalid priceInCents (<= 0)', async () => {
    const { app } = getOrdersTestContext();

    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() + 1);
    const endsAt = new Date(startsAt);
    endsAt.setHours(endsAt.getHours() + 2);

    const body = {
      organizerId: uuidv7(),
      title: 'Free Event',
      venue: 'Venue',
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      ticketTypes: [
        {
          name: 'Free',
          priceInCents: 0, // Invalid if <= 0 is the rule
          totalQuantity: 10,
        },
      ],
    };

    const response = await request(app).post('/api/v1/events').send(body);
    expect(response.status).toBe(400);
  });

  it('should return 400 when ticketTypes contains invalid totalQuantity (<= 0)', async () => {
    const { app } = getOrdersTestContext();

    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() + 1);
    const endsAt = new Date(startsAt);
    endsAt.setHours(endsAt.getHours() + 2);

    const body = {
      organizerId: uuidv7(),
      title: 'Zero Qty Event',
      venue: 'Venue',
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      ticketTypes: [
        {
          name: 'Zero',
          priceInCents: 1000,
          totalQuantity: 0,
        },
      ],
    };

    const response = await request(app).post('/api/v1/events').send(body);
    expect(response.status).toBe(400);
  });

  it('should return 400 when organizerId is not a valid uuid', async () => {
    const { app } = getOrdersTestContext();

    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() + 1);
    const endsAt = new Date(startsAt);
    endsAt.setHours(endsAt.getHours() + 2);

    const body = {
      organizerId: 'not-a-uuid',
      title: 'Invalid Organizer Event',
      venue: 'Venue',
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      ticketTypes: [
        {
          name: 'General',
          priceInCents: 1000,
          totalQuantity: 10,
        },
      ],
    };

    const response = await request(app).post('/api/v1/events').send(body);
    expect(response.status).toBe(400);
  });
});
