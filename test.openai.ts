import { RecipeSchema } from "@/schemas/recipe";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI();

// Define detailed prompt templates
const SYSTEM_PROMPT = `You are a professional chef and food photographer with expertise in creating healthy, innovative recipes.
Follow these guidelines:
1. Create unique recipes that combine traditional and modern elements
2. Focus on nutritional balance and health benefits
3. Ensure ingredients are readily available
4. Include specific measurements and detailed instructions
5. Consider dietary restrictions and alternatives
6. Provide precise cooking times and temperatures
7. Add chef's tips and serving suggestions
8. Include estimated nutritional information`;

const IMAGE_PROMPT_TEMPLATE = (recipe: z.infer<typeof RecipeSchema>) => `
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
Key ingredients to highlight: ${recipe.ingredients.slice(0, 3).join(', ')}
`;

async function generateRecipeAndImage(category: string, dietary?: string) {
  try {
    // Generate recipe
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Create a ${dietary ? dietary + ' ' : ''}recipe for ${category}. 
                   The recipe should be detailed, creative, and health-conscious.`,
        },
      ],
      response_format: zodResponseFormat(RecipeSchema, "recipe"),
      temperature: 0.7, // Add some creativity while maintaining coherence
    });

    const recipe = completion.choices[0].message.parsed;

    if (!recipe) {
      throw new Error("Failed to generate recipe");
    }

    // Generate image
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: IMAGE_PROMPT_TEMPLATE(recipe),
      n: 1,
      size: "1024x1024",
      quality: "hd", // Use highest quality setting
      style: "natural", // Maintain realistic food photography style
    });

    if (!imageResponse.data[0]?.url) {
      throw new Error("Failed to generate image");
    }

    return {
      recipe,
      imageUrl: imageResponse.data[0].url,
      success: true,
    };
  } catch (error) {
    console.error("Error generating recipe and image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}



import { db } from "@/db/db"; // Assuming this is your Drizzle database instance
import { recipesTable } from "@/db/schema";



interface GeneratedRecipeResult {
  recipe: z.infer<typeof RecipeSchema>;
  imageUrl: string;
  success: true;
}

interface GeneratedRecipeError {
  success: false;
  error: string;
}

type GenerateRecipeResult = GeneratedRecipeResult | GeneratedRecipeError;

export async function insertGeneratedRecipe(
  generatedResult: GenerateRecipeResult,
  userId: string
) {
  if (!generatedResult.success) {
    throw new Error(`Failed to generate recipe: ${generatedResult.error}`);
  }

  const { recipe, imageUrl } = generatedResult;

  try {
    const recipeInsert = {
      title: recipe.title,
      description: recipe.description || null,
      category: recipe.category,
      cuisine: recipe.cuisine || null,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: recipe.totalTime,
      ingredients: JSON.stringify(recipe.ingredients),
      instructions: JSON.stringify(recipe.instructions),
      equipment: recipe.equipment ? JSON.stringify(recipe.equipment) : null,
      tags: recipe.tags ? JSON.stringify(recipe.tags) : null,
      notes: recipe.notes ? JSON.stringify(recipe.notes) : null,
      image: imageUrl,
      videoUrl: recipe.videoUrl || null,
      userId: userId,
    };

    const result = await db.insert(recipesTable).values(recipeInsert);
    
    return {
      success: true as const,
      recipeId: result.lastInsertRowid,
      recipe: recipeInsert,
    };
  } catch (error) {
    console.error("Error inserting recipe:", error);
    throw new Error(
      `Failed to insert recipe: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Example usage:
async function main() {
  const userId = "user123";
  const generatedResult = await generateRecipeAndImage("breakfast", "high-protein vegetarian");
  
  try {
    const insertResult = await insertGeneratedRecipe(generatedResult, userId);
    if (insertResult.success) {
      console.log(`Recipe inserted successfully with ID: ${insertResult.recipeId}`);
    }
  } catch (error) {
    console.error("Failed to insert recipe:", error);
  }
}

main();