ALTER TABLE `recipes` ALTER COLUMN "tags" TO "tags" text NOT NULL;--> statement-breakpoint
ALTER TABLE `recipes` ALTER COLUMN "notes" TO "notes" text NOT NULL;--> statement-breakpoint
ALTER TABLE `recipes` DROP COLUMN `video_url`;