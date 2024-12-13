CREATE TABLE `cooked_recipes` (
	`id` integer PRIMARY KEY NOT NULL,
	`recipe_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
