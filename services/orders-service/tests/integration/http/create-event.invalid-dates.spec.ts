import request from 'supertest';
import { v7 as uuidv7 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { getOrdersTestContext } from '../../_support/setup';

describe('CreateEvent (integration) - Invalid Dates', () => {
  it('should return 400 BadRequest when endsAt is before startsAt', async () => {
    const { app } = getOrdersTestContext();

    const organizerId = uuidv7();
    const now = new Date();
    const startsAt = new Date(now.getTime() + 1000 * 60 * 60); // 1 hour from now
    const endsAt = new Date(now.getTime()); // now (before startsAt)

    const response = await request(app)
      .post('/api/v1/events')
      .send({
        organizerId,
        title: 'Invalid Date Event',
        venue: 'Test Venue',
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        ticketTypes: [
          {
            name: 'General Admission',
            priceInCents: 1000,
            totalQuantity: 100,
          },
        ],
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'VALIDATION_ERROR',
      }),
    );
  });
});
