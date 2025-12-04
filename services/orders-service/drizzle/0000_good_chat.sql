CREATE TABLE "events" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"organizer_id" varchar(36) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"venue" varchar(255) NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"event_id" varchar(36) NOT NULL,
	"ticket_type_id" varchar(36) NOT NULL,
	"quantity" integer NOT NULL,
	"status" "status" NOT NULL,
	"total_price_in_cents" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_types" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"event_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"price_in_cents" integer NOT NULL,
	"total_quantity" integer NOT NULL,
	"remaining_quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
