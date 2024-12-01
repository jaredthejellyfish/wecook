DROP INDEX IF EXISTS "preferences_user_id_unique";--> statement-breakpoint
ALTER TABLE `recipes` ALTER COLUMN "public" TO "public" integer NOT NULL DEFAULT false;--> statement-breakpoint
CREATE UNIQUE INDEX `preferences_user_id_unique` ON `preferences` (`user_id`);