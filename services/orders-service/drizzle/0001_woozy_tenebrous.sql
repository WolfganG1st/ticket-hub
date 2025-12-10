CREATE TYPE "public"."status" AS ENUM('PENDING', 'PAID', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "order_outbox" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"aggregate_id" varchar(36) NOT NULL,
	"type" varchar(64) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "order_outbox_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "idempotency_key" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_idempotency_key_unique" UNIQUE("idempotency_key");