import { z } from "zod";

// Base schemas for structured data
const ingredientSchema = z.object({
  name: z.string(),
  amount: z.number(),
  unit: z.string(),
  notes: z.string().optional(),
  isOptional: z.boolean().optional(),
  category: z.string().optional(),
});

const instructionSchema = z.object({
  stepNumber: z.number(),
  instruction: z.string(),
  timingInMinutes: z.number().optional(),
});

const equipmentSchema = z.object({
  name: z.string(),
  isRequired: z.boolean(),
  notes: z.string().optional(),
});

const recipeNoteSchema = z.object({
  note: z.string(),
  category: z.enum(["tip", "variation", "storage"]),
});

export const RecipeSchemaFromDB = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  cuisine: z.string().optional(),
  difficulty: z.string(),
  servings: z.number(),
  prepTime: z.number(),
  cookTime: z.number(),
  totalTime: z.number(),
  ingredients: z
    .array(ingredientSchema)
    .transform((arr) => JSON.stringify(arr)),
  instructions: z
    .array(instructionSchema)
    .transform((arr) => JSON.stringify(arr)),
  equipment: z
    .array(equipmentSchema)
    .optional()
    .transform((arr) => (arr ? JSON.stringify(arr) : null)),
  tags: z
    .array(z.string())
    .optional()
    .transform((arr) => (arr ? JSON.stringify(arr) : null)),
  notes: z
    .array(recipeNoteSchema)
    .optional()
    .transform((arr) => (arr ? JSON.stringify(arr) : null)),
  image: z.string(),
  videoUrl: z.string().optional(),
  userId: z.string(),
});

export const RecipeSchema = RecipeSchemaFromDB.extend({
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  cuisine: z.string().optional(),
  difficulty: z.string(),
  servings: z.number(),
  prepTime: z.number(),
  cookTime: z.number(),
  totalTime: z.number(),
  ingredients: z.array(ingredientSchema),
  instructions: z.array(instructionSchema),
  equipment: z.array(equipmentSchema).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.array(recipeNoteSchema).optional(),
  image: z.string(),
  userId: z.string(),
});

export type RecipeFromDB = z.infer<typeof RecipeSchemaFromDB>;
export type Recipe = z.infer<typeof RecipeSchema>;

const transformDbRecord = (rawData: RecipeFromDB) => {
  const jsonData = {
    ...rawData,
    ingredients: JSON.parse(rawData.ingredients),
    instructions: JSON.parse(rawData.instructions),
    equipment: rawData.equipment ? JSON.parse(rawData.equipment) : undefined,
    tags: rawData.tags ? JSON.parse(rawData.tags) : undefined,
    notes: rawData.notes ? JSON.parse(rawData.notes) : undefined,
  };

  return RecipeSchema.parse(jsonData);
};

export { transformDbRecord };
