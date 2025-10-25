ALTER TABLE "ingredients" ADD COLUMN "ingredient_id" text;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "supplier_type" text;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_ingredient_id_unique" UNIQUE("ingredient_id");