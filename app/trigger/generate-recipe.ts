import { task } from "@trigger.dev/sdk/v3";
import OpenAI from "openai";
import { z } from "zod";
import { RecipeSchema } from "@/schemas/recipe";
import { zodResponseFormat } from "openai/helpers/zod";
import { db } from "@/db/db";
import { recipesTable, type InsertRecipe } from "@/db/schema";
import { sql } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a professional chef and food photographer with expertise in creating healthy, innovative recipes.
Follow these guidelines:
1. Create unique recipes that combine traditional and modern elements
2. Focus on nutritional balance and health benefits
3. Ensure ingredients are readily available
4. Include specific measurements and detailed instructions
5. Consider dietary restrictions and alternatives
6. Provide precise cooking times and temperatures
7. Add chef's tips and serving suggestions
8. Include estimated nutritional information

Important: All fields must be provided. Use empty strings or arrays instead of null values.
- description should be a non-empty string
- cuisine should be a non-empty string (e.g. "International" if unknown)
- equipment should be a non-empty array (even if just basic kitchen tools)
- tags should be a non-empty array (at least include dietary and category)
- notes should be a non-empty array (at least include one storage tip)`;

const generateImagePrompt = (recipe: z.infer<typeof RecipeSchema>) => `
Create a professional food photography shot of: ${recipe.title}

Style guidelines:
- Overhead angle with natural lighting
- Fresh, vibrant ingredients
- Professional food styling with garnishes
- Clean, minimal background
- Sharp focus on the main dish
- Complementary props and tableware
- Color palette emphasizing fresh ingredients

The dish should look: ${recipe.description}
Key ingredients to highlight: ${recipe.ingredients.slice(0, 3).join(", ")}
`;

interface RecipeTaskPayload {
  category: string;
  dietary?: string;
  userId: string;
}

export const recipeGenerationTask = task({
  id: "recipe-generation-task",
  retry: {
    maxAttempts: 5,
    factor: 1.8,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 60_000,
    randomize: true,
  },
  run: async (payload: RecipeTaskPayload) => {
    try {
      // Step 1: Generate recipe
      const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: `Create a ${payload.dietary ? payload.dietary + " " : ""}recipe for ${payload.category}. 
                     The recipe should be detailed, creative, and health-conscious.`,
          },
        ],
        response_format: zodResponseFormat(RecipeSchema, "recipe"),
        temperature: 0.7,
      });

      const recipe = completion.choices[0].message.parsed;

      if (!recipe) {
        throw new Error("Failed to generate recipe");
      }

      // Validate and fill missing fields
      const validatedRecipe = {
        ...recipe,
        description: recipe.description || "A delicious recipe",
        cuisine: recipe.cuisine || "International",
        equipment: recipe.equipment || [],
        tags: [
          ...new Set(
            [...(recipe.tags || []), payload.category, payload.dietary].filter(
              Boolean,
            ),
          ),
        ] as string[],
        notes: recipe.notes || [
          {
            note: "Store in an airtight container in the refrigerator",
            category: "storage",
          },
        ],
      };

      // Step 2: Generate image
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: generateImagePrompt(validatedRecipe),
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "natural",
      });

      if (!imageResponse.data[0]?.url) {
        throw new Error("Failed to generate image");
      }

      // Step 3: Insert into database
      const recipeInsert: InsertRecipe = {
        title: validatedRecipe.title,
        description: validatedRecipe.description,
        category: validatedRecipe.category,
        cuisine: validatedRecipe.cuisine,
        difficulty: validatedRecipe.difficulty,
        servings: validatedRecipe.servings,
        prepTime: validatedRecipe.prepTime,
        cookTime: validatedRecipe.cookTime,
        totalTime: validatedRecipe.totalTime,
        ingredients: JSON.stringify(validatedRecipe.ingredients),
        instructions: JSON.stringify(validatedRecipe.instructions),
        equipment: JSON.stringify(validatedRecipe.equipment),
        tags: JSON.stringify(validatedRecipe.tags),
        notes: JSON.stringify(validatedRecipe.notes),
        image: imageResponse.data[0].url,
        userId: payload.userId,
      };

      const result = await db.insert(recipesTable).values(recipeInsert);

      return {
        success: true,
        recipeId: result.lastInsertRowid,
        recipe: recipeInsert,
      };
    } catch (error) {
      console.error("Error in recipe generation task:", error);
      throw error;
    }
  },
});
