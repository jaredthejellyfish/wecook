ALTER TABLE `recipes` ADD `public` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `recipes` DROP COLUMN `is_public`;