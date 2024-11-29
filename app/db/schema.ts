import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const recipesTable = sqliteTable("recipes", {
  id: integer("id").primaryKey(),

  // Basic Information
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  cuisine: text("cuisine").notNull(),
  difficulty: text("difficulty").notNull(),
  servings: integer("servings").notNull(),

  // Time Information
  prepTime: integer("prep_time").notNull(),
  cookTime: integer("cook_time").notNull(),
  totalTime: integer("total_time").notNull(),

  // Recipe Components (stored as JSON strings)
  ingredients: text("ingredients").notNull(), // JSON array of Ingredient objects
  instructions: text("instructions").notNull(), // JSON array of Instruction objects
  equipment: text("equipment").notNull(), // Optional JSON array of Equipment objects
  tags: text("tags").notNull(), // Optional JSON array of strings
  notes: text("notes").notNull(), // Optional JSON array of RecipeNote objects

  // Media
  image: text("image").notNull(), // Single image URL as per Zod schema

  // Meta Information
  userId: text("user_id").notNull(),

  // Timestamps
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const bookmarksTable = sqliteTable("bookmarks", {
  id: integer("id").primaryKey(),
  recipeId: integer("recipe_id").notNull().references(() => recipesTable.id),
  userId: text("user_id").notNull(),
});

export type InsertRecipe = typeof recipesTable.$inferInsert;
export type SelectRecipe = typeof recipesTable.$inferSelect;

export type InsertBookmark = typeof bookmarksTable.$inferInsert;
export type SelectBookmark = typeof bookmarksTable.$inferSelect;
