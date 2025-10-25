ALTER TABLE "ingredients" ADD COLUMN "synonyms" jsonb;--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "cas_number" text;--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "search_vector" text;