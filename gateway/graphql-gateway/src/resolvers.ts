import { UnauthorizedError } from 'shared-kernel';
import type { GraphQlContext } from './context';

type MeArgs = Record<string, never>;
type EventsArgs = { organizerId?: string | null };
type EventArgs = { id: string };
type OrdersByCustomerArgs = { customerId: string };

type CreateEventArgs = {
  input: {
    title: string;
    description?: string | null;
    venue: string;
    startsAt: string;
    endsAt: string;
    ticketTypes: {
      name: string;
      priceInCents: number;
      totalQuantity: number;
    }[];
  };
};

type CreateOrderArgs = {
  input: {
    eventId: string;
    ticketTypeId: string;
    quantity: number;
  };
};

type PayOrderArgs = { id: string };

export const resolvers = {
  Query: {
    me: async (_parent: unknown, _args: MeArgs, ctx: GraphQlContext) => {
      const user = await ctx.currentUserPromise;
      return user;
    },

    events: async (_parent: unknown, args: EventsArgs, ctx: GraphQlContext) => {
      const key = args.organizerId ? `events:organizer:${args.organizerId}` : 'events:all';

      const cached = await ctx.cache.get<unknown[]>(key);
      if (cached) {
        return cached;
      }

      const events = await ctx.ordersApi.listEvents(args.organizerId ?? undefined);

      await ctx.cache.set(key, events, 60);

      return events;
    },

    event: async (_parent: unknown, args: EventArgs, ctx: GraphQlContext) => {
      const key = `event:${args.id}`;

      const cached = await ctx.cache.get<unknown>(key);
      if (cached) {
        return cached;
      }

      const event = await ctx.ordersApi.getEventById(args.id);
      if (!event) {
        return null;
      }

      await ctx.cache.set(key, event, 60);
      return event;
    },

    ordersByCustomer: async (_parent: unknown, args: OrdersByCustomerArgs, ctx: GraphQlContext) => {
      const orders = await ctx.ordersApi.listOrdersByCustomer(args.customerId);
      return orders;
    },
  },

  Mutation: {
    createEvent: async (_parent: unknown, args: CreateEventArgs, ctx: GraphQlContext) => {
      const me = await ctx.currentUserPromise;

      if (!me) {
        throw new UnauthorizedError('Unauthorized');
      }

      const payload = {
        organizerId: me.id,
        title: args.input.title,
        description: args.input.description ?? null,
        venue: args.input.venue,
        startsAt: args.input.startsAt,
        endsAt: args.input.endsAt,
        ticketTypes: args.input.ticketTypes,
      };

      const result = await ctx.ordersApi.createEvent(payload);

      await ctx.cache.delete('events:all');
      await ctx.cache.delete(`events:organizer:${me.id}`);

      return result;
    },

    createOrder: async (_parent: unknown, args: CreateOrderArgs, ctx: GraphQlContext) => {
      const me = await ctx.currentUserPromise;

      if (!me) {
        throw new UnauthorizedError('Unauthorized');
      }

      const result = await ctx.ordersApi.createOrder({
        customerId: me.id,
        eventId: args.input.eventId,
        ticketTypeId: args.input.ticketTypeId,
        quantity: args.input.quantity,
      });

      await ctx.cache.delete(`event:${args.input.eventId}`);
      await ctx.cache.delete('events:all');
      await ctx.cache.delete(`events:organizer:${me.id}`);

      return result;
    },

    payOrder: async (_parent: unknown, args: PayOrderArgs, ctx: GraphQlContext) => {
      const result = await ctx.ordersApi.payOrder(args.id);
      return result;
    },
  },
};
