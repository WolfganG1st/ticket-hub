# Ticket Hub

Ticket Hub is a small event-ticketing platform built as a practical playground for distributed systems patterns in **Node.js + TypeScript**, focusing on clean boundaries, reliability, and observability.

It’s intentionally scoped to stay understandable while still being "real enough" to demonstrate:

- **Microservices** with clear boundaries
- **GraphQL Gateway** at the edge
- **gRPC** for internal service-to-service communication
- **Redis** for caching and distributed locking
- **Kafka + Outbox Pattern** for event-driven workflows and eventual consistency
- A monorepo setup with shared packages (env config, shared contracts)

This repo is less about "ticketing features" and more about the **engineering patterns** behind a modern backend.

---

## What you can do today

### Product flow
- Create an account (signup/login) and retrieve current user (`/me`)
- Create events and ticket types
- Create orders with stock reservation
- Pay orders
- Use the GraphQL API as a single entry point
- Watch domain events flowing through Kafka (and verify via Kafka UI)
- Run a dedicated Outbox worker that publishes events reliably

### Architecture flow (what’s interesting)
- `orders-service` no longer trusts the client blindly: it calls `accounts-service` via **gRPC** to validate user existence and role
- Order creation uses:
  - **Idempotency** (`Idempotency-Key`) to prevent duplicate orders
  - **Distributed locking** via Redis to prevent stock over-selling (safe release with Lua)
  - **Outbox** table written in the same transaction boundary as the order write
  - **Outbox worker** publishing to Kafka (`orders.events`)
- `graphql-gateway` caches query results using Redis (cache-aside) and invalidates on mutations
- `notifications-service` consumes `orders.events` and validates payloads using shared Zod schemas

---

## Services

### `accounts-service`
- HTTP API for authentication:
  - `POST /api/v1/signup`
  - `POST /api/v1/login`
  - `GET /api/v1/me`
- gRPC server for internal lookups:
  - `AccountsService.GetUserById`

### `orders-service`
- HTTP API for events and orders:
  - `POST /api/v1/events`
  - `GET /api/v1/events`
  - `GET /api/v1/events/:id`
  - `POST /api/v1/orders`
  - `POST /api/v1/orders/:id/pay`
- Core patterns:
  - stock reservation
  - idempotent order creation
  - redis lock
  - outbox record on `OrderCreated`, `OrderPaid` (and evolving)

### `orders-service-outbox` (dedicated process)
- Reads pending outbox entries
- Publishes to Kafka topic (`ORDERS_KAFKA_TOPIC`, default `orders.events`)
- Marks entries as SENT/FAILED

### `graphql-gateway`
- Apollo Server + Express
- Talks to `accounts-service` and `orders-service` over HTTP
- Redis cache-aside for common queries
- Propagates idempotency key

### `notifications-service`
- Kafka consumer for `orders.events`
- Validates incoming messages with shared Zod schemas
- Currently logs events (future: emails, billing, integrations)

---

## Repo layout

```txt
.
├─ services/
│  ├─ accounts-service/
│  ├─ orders-service/
│  └─ notifications-service/
├─ gateway/
│  └─ graphql-gateway/
├─ packages/
│  ├─ shared-kernel/        # Zod schemas, shared types, errors, logging helpers
│  └─ config/               # typed env loading (Zod)
└─ infra/
   ├─ docker/
   │  └─ docker-compose.dev.yml
   └─ proto/
      ├─ accounts.proto
      └─ orders.proto
```
---

## Running locally (Docker)

The dev stack is controlled by Docker Compose profiles.

### Start full stack

```bash
docker compose -f infra/docker/docker-compose.dev.yml --profile stack up -d --build
pnpm dev
```

### Useful URLs

* GraphQL: `http://localhost:4000/graphql`
* Kafka UI: `http://localhost:8081`
* RedisInsight: `http://localhost:5540`

---

## GraphQL API (quick examples)

### Query: current user

```graphql
query Me {
  me {
    id
    name
    email
    role
  }
}
```

### Query: list events (cached)

```graphql
query Events {
  events {
    id
    title
    venue
    startsAt
    endsAt
  }
}
```

### Mutation: create event

```graphql
mutation CreateEvent {
  createEvent(
    input: {
      title: "Indie Night"
      venue: "Downtown"
      startsAt: "2026-01-20T20:00:00Z"
      endsAt: "2026-01-20T23:00:00Z"
      ticketTypes: [
        { name: "Standard", priceInCents: 5000, totalQuantity: 100 }
        { name: "VIP", priceInCents: 15000, totalQuantity: 20 }
      ]
    }
  ) {
    eventId
  }
}
```

### Mutation: create order (idempotent)

Send header: `x-idempotency-key: <your-key>`

```graphql
mutation CreateOrder($eventId: ID!, $ticketTypeId: ID!) {
  createOrder(input: { eventId: $eventId, ticketTypeId: $ticketTypeId, quantity: 2 }) {
    orderId
    totalPriceInCents
  }
}
```

---

## Event-driven flow

### Outbox -> Kafka

When an order is created, `orders-service` writes:

* the order
* the updated ticket stock
* an outbox entry (type `ORDER_CREATED`)

Then `orders-service-outbox` publishes it to Kafka (`orders.events`).

### Kafka -> Consumers

`notifications-service` consumes `orders.events`, validates it using shared schemas, and logs it.

You can inspect the topic messages via Kafka UI.

---

## What is implemented (Checklist)

### Monorepo foundations

* [x] PNPM workspace with shared packages
* [x] Typed env loading with Zod (`@ticket-hub/config`)
* [x] Shared contracts and errors (`shared-kernel`)

### accounts-service

* [x] HTTP signup/login/me with JWT
* [x] Drizzle + Postgres persistence
* [x] gRPC server (`GetUserById`)
* [x] Error mapping and structured handling

### orders-service

* [x] Events + ticket types CRUD (minimal)
* [x] Order creation with:

  * [x] stock reservation
  * [x] distributed lock (Redis) with safe release (Lua)
  * [x] idempotency via `Idempotency-Key`
  * [x] gRPC validation against accounts-service
* [x] Pay order endpoint (basic)
* [x] Publish `ORDER_CREATED` and `ORDER_PAID` event via outbox

### Kafka / Outbox

* [x] Outbox table + repository
* [x] Dedicated outbox worker publishing to Kafka
* [x] Kafka UI for inspection
* [ ] Add retry strategy + DLQ topic (`orders.events.dlq`)
* [ ] Add a reprocessor job/CLI for FAILED outbox events

### graphql-gateway

* [x] Apollo GraphQL gateway
* [x] Redis cache-aside for common queries
* [x] Cache invalidation on mutations
* [x] Idempotency key propagation

### notifications-service (Phase 2.2)

* [x] Kafka consumer for `orders.events`
* [x] Zod validation for event payloads
* [x] Implement consumer side idempotency (Inbox table) in notifications-service
* [x] Basic handler/logging (future extensions ready)

### CQRS + Read models

* [ ] Create a projector service (or worker) that builds a read model from Kafka events
* [ ] Add denormalized tables like:

  * `event_orders_summary` / `event_sales`
  * `customer_orders_summary`
  * `order_timeline`
* [ ] Update GraphQL queries to read from read model:

  * `eventSales(eventId)`
  * `customerOrders(customerId)`
  * `orderTimeline(orderId)`

### Sharding (simulated)

* [ ] Run 2 Postgres databases (North America / South America shards)
* [ ] Implement a `ShardRouter` in orders-service
* [ ] Demonstrate repository choosing the correct shard based on partition key

### Observability

* [ ] Correlation IDs end-to-end (Gateway -> Orders -> Accounts -> Kafka)
* [ ] Prometheus metrics:

  * orders created
  * lock failures
  * outbox published/failed
  * cache hit/miss
* [ ] OpenTelemetry tracing (at least gateway + orders)
* [ ] Health endpoints across services

### AWS deployment

* [ ] Deploy one service + RDS
* [ ] Add Redis (ElastiCache)
* [ ] Add Kafka (MSK) or managed alternative
* [ ] Run gateway in ECS/Fargate
* [ ] Store secrets in SSM/Secrets Manager
