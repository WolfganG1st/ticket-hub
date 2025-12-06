export const typeDefs = `#graphql
    enum UserRole {
		CUSTOMER
		ORGANIZER
		ADMIN
	}

	enum OrderStatus {
		PENDING
		PAID
		CANCELLED
	}

	type User {
		id: ID!
		name: String!
		email: String!
		role: UserRole!
	}

	type Event {
		id: ID!
		title: String!
		description: String
		organizerId: ID!
		venue: String!
		startsAt: String!
		endsAt: String!
		createdAt: String!
	}

	type Order {
		id: ID!
		customerId: ID!
		eventId: ID!
		ticketTypeId: ID!
		quantity: Int!
		status: OrderStatus!
		totalPriceInCents: Int!
		createdAt: String!
	}

	type Query {
		me: User
		events(organizerId: ID): [Event!]!
		event(id: ID!): Event
		ordersByCustomer(customerId: ID!): [Order!]!
	}

	input CreateEventTicketTypeInput {
		name: String!
		priceInCents: Int!
		totalQuantity: Int!
	}

	input CreateEventInput {
		title: String!
		description: String
		venue: String!
		startsAt: String!
		endsAt: String!
		ticketTypes: [CreateEventTicketTypeInput!]!
	}

	input CreateOrderInput {
		eventId: ID!
		ticketTypeId: ID!
		quantity: Int!
	}

	type CreateEventPayload {
		eventId: ID!
	}

	type CreateOrderPayload {
		orderId: ID!
		totalPriceInCents: Int!
	}

	type PayOrderPayload {
		id: ID!
		status: OrderStatus!
	}

	type Mutation {
		createEvent(input: CreateEventInput!): CreateEventPayload!
		createOrder(input: CreateOrderInput!): CreateOrderPayload!
		payOrder(id: ID!): PayOrderPayload!
	}
`;
