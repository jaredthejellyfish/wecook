ALTER TABLE `recipes` ADD `title` text NOT NULL;--> statement-breakpoint
ALTER TABLE `recipes` ADD `description` text;--> statement-breakpoint
ALTER TABLE `recipes` ADD `cuisine` text;--> statement-breakpoint
ALTER TABLE `recipes` ADD `difficulty` text NOT NULL;--> statement-breakpoint
ALTER TABLE `recipes` ADD `servings` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `recipes` ADD `prep_time` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `recipes` ADD `cook_time` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `recipes` ADD `total_time` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `recipes` ADD `ingredients` text NOT NULL;--> statement-breakpoint
ALTER TABLE `recipes` ADD `instructions` text NOT NULL;--> statement-breakpoint
ALTER TABLE `recipes` ADD `equipment` text;--> statement-breakpoint
ALTER TABLE `recipes` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `recipes` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `recipes` ADD `video_url` text;--> statement-breakpoint
ALTER TABLE `recipes` DROP COLUMN `name`;--> statement-breakpoint
ALTER TABLE `recipes` DROP COLUMN `time`;