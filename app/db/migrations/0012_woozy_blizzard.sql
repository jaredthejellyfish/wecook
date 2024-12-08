ALTER TABLE `events` ADD `date` text NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `meal_type` text NOT NULL;--> statement-breakpoint
ALTER TABLE `events` DROP COLUMN `time`;--> statement-breakpoint
ALTER TABLE `events` DROP COLUMN `title`;--> statement-breakpoint
ALTER TABLE `events` DROP COLUMN `description`;