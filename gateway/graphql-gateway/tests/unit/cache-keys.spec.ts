import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQlContext } from '../../src/context';
import { resolvers } from '../../src/resolvers';

describe('Cache Keys (unit)', () => {
  const mockCache = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };

  const mockOrdersApi = {
    listEvents: vi.fn(),
    getEventById: vi.fn(),
    createEvent: vi.fn(),
    createOrder: vi.fn(),
    payOrder: vi.fn(),
    listOrdersByCustomer: vi.fn(),
  };

  const ctx = {
    cache: mockCache,
    ordersApi: mockOrdersApi,
    currentUserPromise: Promise.resolve({ id: 'user-1' }),
  } as unknown as GraphQlContext;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate stable cache key for events query', async () => {
    mockCache.get.mockResolvedValue(null);
    mockOrdersApi.listEvents.mockResolvedValue([]);

    await resolvers.Query.events({}, { organizerId: 'org-1' }, ctx);
    expect(mockCache.get).toHaveBeenCalledWith('events:organizer:org-1');

    await resolvers.Query.events({}, {}, ctx);
    expect(mockCache.get).toHaveBeenCalledWith('events:all');
  });

  it('should generate stable cache key for event query', async () => {
    mockCache.get.mockResolvedValue(null);
    mockOrdersApi.getEventById.mockResolvedValue({ id: 'evt-1' });

    await resolvers.Query.event({}, { id: 'evt-1' }, ctx);
    expect(mockCache.get).toHaveBeenCalledWith('event:evt-1');
  });

  it('should not cache mutations (only invalidate)', async () => {
    mockOrdersApi.createEvent.mockResolvedValue({ eventId: 'evt-2' });

    await resolvers.Mutation.createEvent(
      {},
      {
        input: {
          title: 'New Event',
          venue: 'Venue',
          startsAt: '2025-01-01',
          endsAt: '2025-01-02',
          ticketTypes: [],
        },
      },
      ctx,
    );

    expect(mockCache.get).not.toHaveBeenCalled();
    expect(mockCache.set).not.toHaveBeenCalled();
    expect(mockCache.delete).toHaveBeenCalledWith('events:all');
    expect(mockCache.delete).toHaveBeenCalledWith('events:organizer:user-1');
  });
});
