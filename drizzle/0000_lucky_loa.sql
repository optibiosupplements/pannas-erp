CREATE TABLE "background_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_type" text NOT NULL,
	"payload" jsonb,
	"status" text DEFAULT 'Pending' NOT NULL,
	"attempts" integer DEFAULT 0,
	"error" text,
	"scheduled_for" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"notes" text,
	"status" text DEFAULT 'Active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_id" integer,
	"direction" text NOT NULL,
	"from_email" text NOT NULL,
	"to_email" text NOT NULL,
	"subject" text,
	"body" text,
	"status" text DEFAULT 'Sent' NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"ingredient_name" text NOT NULL,
	"common_name" text,
	"category" text,
	"form" text,
	"assay_percentage" numeric(5, 2),
	"cost_per_kg" numeric(10, 2),
	"supplier" text,
	"moq" integer,
	"lead_time_days" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manufacturers" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"capabilities" jsonb,
	"notes" text,
	"status" text DEFAULT 'Active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"rfq_id" integer,
	"title" text NOT NULL,
	"value" numeric(12, 2),
	"stage" text DEFAULT 'Lead' NOT NULL,
	"probability" integer DEFAULT 0,
	"expected_close_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_specifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"spec_number" text NOT NULL,
	"rfq_id" integer,
	"product_name" text NOT NULL,
	"product_format" text,
	"serving_size" text,
	"servings_per_container" integer,
	"order_quantity" integer,
	"packaging_type" text,
	"bottle_size" text,
	"label_type" text,
	"formula_json" jsonb,
	"total_raw_material_cost" numeric(10, 2),
	"manufacturing_cost" numeric(10, 2),
	"packaging_cost" numeric(10, 2),
	"total_cost_per_unit" numeric(10, 2),
	"customer_price" numeric(10, 2),
	"margin_percentage" numeric(5, 2),
	"notes" text,
	"status" text DEFAULT 'Draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_specifications_spec_number_unique" UNIQUE("spec_number")
);
--> statement-breakpoint
CREATE TABLE "rfqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfq_number" text NOT NULL,
	"customer_id" integer,
	"status" text DEFAULT 'New' NOT NULL,
	"product_description" text,
	"original_email_subject" text,
	"original_email_body" text,
	"email_attachment_urls" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rfqs_rfq_number_unique" UNIQUE("rfq_number")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"role" text DEFAULT 'USER' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_rfq_id_rfqs_id_fk" FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;