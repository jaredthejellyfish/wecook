import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const recipesTable = sqliteTable('recipes', {
  id: integer('id').primaryKey(),

  // Basic Information
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  cuisine: text('cuisine').notNull(),
  difficulty: text('difficulty').notNull(),
  servings: integer('servings').notNull(),

  // Time Information
  prepTime: integer('prep_time').notNull(),
  cookTime: integer('cook_time').notNull(),
  totalTime: integer('total_time').notNull(),

  // Recipe Components (stored as JSON strings)
  ingredients: text('ingredients').notNull(), // JSON array of Ingredient objects
  instructions: text('instructions').notNull(), // JSON array of Instruction objects
  equipment: text('equipment').notNull(), // Optional JSON array of Equipment objects
  tags: text('tags').notNull(), // Optional JSON array of strings
  notes: text('notes').notNull(), // Optional JSON array of RecipeNote objects

  // Media
  image: text('image').notNull(), // Single image URL as per Zod schema

  // Meta Information
  userId: text('user_id').notNull(),

  isPublic: integer('public', { mode: 'boolean' })
    .notNull()
    .default(sql`false`),

  // Timestamps
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const bookmarksTable = sqliteTable('bookmarks', {
  id: integer('id').primaryKey(),
  recipeId: integer('recipe_id')
    .notNull()
    .references(() => recipesTable.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const preferencesTable = sqliteTable('preferences', {
  id: integer('id').primaryKey(),
  userId: text('user_id').unique(),
  dietaryType: text('dietary_type'),
  allergies: text('allergies'),
  cookingTime: text('cooking_time'),
  skillLevel: text('skill_level'),
  servings: text('servings'),
  cuisineType: text('cuisine_type'),
  spiceLevel: text('spice_level'),
  specialNotes: text('special_notes'),
  budget: text('budget'),
});

export const eventsTable = sqliteTable(
  'events',
  {
    id: integer('id').primaryKey(),
    date: text('date').notNull(),
    mealType: text('meal_type').notNull(),
    userId: text('user_id').notNull(),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipesTable.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    unique_event: uniqueIndex('unique_event').on(
      table.userId,
      table.date,
      table.mealType,
    ),
  }),
);

export const cookedRecipesTable = sqliteTable(
  'cooked_recipes',
  {
    id: integer('id').primaryKey(),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipesTable.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    unique_cooked_recipe: uniqueIndex('unique_cooked_recipe').on(
      table.recipeId,
      table.userId,
      table.createdAt
    ),
  })
);

export type InsertRecipe = typeof recipesTable.$inferInsert;
export type SelectRecipe = typeof recipesTable.$inferSelect;

export type InsertBookmark = typeof bookmarksTable.$inferInsert;
export type SelectBookmark = typeof bookmarksTable.$inferSelect;

export type InsertPreference = typeof preferencesTable.$inferInsert;
export type SelectPreference = typeof preferencesTable.$inferSelect;

export type InsertEvent = typeof eventsTable.$inferInsert;
export type SelectEvent = typeof eventsTable.$inferSelect;

export type InsertCookedRecipe = typeof cookedRecipesTable.$inferInsert;
export type SelectCookedRecipe = typeof cookedRecipesTable.$inferSelect;
