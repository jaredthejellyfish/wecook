CREATE TABLE `bookmarks` (
	`id` integer PRIMARY KEY NOT NULL,
	`recipe_id` integer NOT NULL,
	`user_id` text NOT NULL
);
