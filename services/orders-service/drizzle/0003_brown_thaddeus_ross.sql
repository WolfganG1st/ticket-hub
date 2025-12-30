CREATE TYPE "public"."order_outbox_status" AS ENUM('PENDING', 'SENT', 'FAILED');--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "idempotency_key" varchar(100);--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_idempotency_key_unique" UNIQUE("idempotency_key");