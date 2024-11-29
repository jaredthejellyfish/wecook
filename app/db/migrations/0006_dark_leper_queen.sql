CREATE TABLE `preferences` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text,
	`dietary_type` text,
	`allergies` text,
	`cooking_time` text,
	`skill_level` text,
	`servings` text,
	`cuisine_type` text,
	`spice_level` text,
	`special_notes` text,
	`budget` text
);
--> statement-breakpoint
ALTER TABLE `bookmarks` ALTER COLUMN "recipe_id" TO "recipe_id" integer NOT NULL REFERENCES recipes(id) ON DELETE no action ON UPDATE no action;