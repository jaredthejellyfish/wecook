import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const recipesTable = sqliteTable('recipes', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
});

export type InsertRecipe = typeof recipesTable.$inferInsert;
export type SelectRecipe = typeof recipesTable.$inferSelect;


