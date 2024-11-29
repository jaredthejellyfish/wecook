import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { task } from '@trigger.dev/sdk/v3';
import crypto from 'crypto';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

import { db } from '@/db/db';
import { type InsertRecipe, recipesTable } from '@/db/schema';
import { RecipeSchema } from '@/schemas/recipe';

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

const generateUserPrompt = ({
  mealType,
  dietaryType,
  allergies,
  cookingTime,
  skillLevel,
  servings,
  cuisineType,
  spiceLevel,
  specialNotes,
  budget,
}: {
  mealType: string;
  dietaryType: string;
  allergies?: string;
  cookingTime: string;
  skillLevel: string;
  servings: string;
  cuisineType: string;
  spiceLevel: string;
  specialNotes?: string;
  budget: string;
}) => {
  const budgetString =
    budget === '$'
      ? 'budget'
      : budget === '$$'
        ? 'mid-range'
        : budget === '$$$'
          ? 'premium'
          : 'luxury';

  return `Create a recipe with the following specifications:

Meal Type: ${mealType}
Dietary Requirements: ${dietaryType}
Allergies/Restrictions: ${allergies || 'None'}
Cooking Time Available: ${cookingTime}
Skill Level: ${skillLevel}
Number of Servings: ${servings}
Cuisine Preference: ${cuisineType}
Spice Level: ${spiceLevel}
Budget: ${budgetString}
Additional Requirements: ${specialNotes || 'None'}

The recipe should be detailed, creative, and health-conscious while strictly adhering to the specified dietary restrictions and allergies. Ensure the complexity matches the skill level and the total cooking time stays within the specified limit.`;
};

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
Key ingredients to highlight: ${recipe.ingredients.slice(0, 3).join(', ')}
`;

// R2 configuration
const r2Config = {
  accountId: process.env.R2_ACCOUNT_ID!,
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  bucketName: process.env.R2_BUCKET_NAME!,
};

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2Config.accessKeyId,
    secretAccessKey: r2Config.secretAccessKey,
  },
});

// Helper function to download image from URL
async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

// Helper function to generate unique filename
function generateFilename(extension: string = 'png'): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(4).toString('hex');
  return `image-${timestamp}-${randomString}.${extension}`;
}

// Helper function to upload image to R2
async function uploadToR2(imageBuffer: Buffer): Promise<string> {
  const filename = generateFilename();

  const uploadCommand = new PutObjectCommand({
    Bucket: r2Config.bucketName,
    Key: filename,
    Body: imageBuffer,
    ContentType: 'image/png',
  });

  try {
    await s3Client.send(uploadCommand);
    return `https://images.wecook.dev/${filename}`;
  } catch (error) {
    throw new Error(`Failed to upload to R2: ${(error as Error).message}`);
  }
}

interface RecipeTaskPayload {
  mealType: string;
  dietaryType: string;
  allergies?: string;
  cookingTime: string;
  skillLevel: string;
  servings: string;
  cuisineType: string;
  spiceLevel: string;
  specialNotes?: string;
  budget: string;
  userId: string;
}

export const recipeGenerationTask = task({
  id: 'recipe-generation-task',
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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: generateUserPrompt(payload),
          },
        ],
        response_format: zodResponseFormat(RecipeSchema, 'recipe'),
        temperature: 0.7,
      });

      const recipe = completion.choices[0].message.parsed;

      if (!recipe) {
        throw new Error('Failed to generate recipe');
      }

      // Validate and fill missing fields
      const validatedRecipe = {
        ...recipe,
        description: recipe.description || 'A delicious recipe',
        cuisine: recipe.cuisine || 'International',
        equipment: recipe.equipment || [],
        tags: [
          ...new Set(
            [
              ...(recipe.tags || []),
              payload.mealType,
              payload.dietaryType,
            ].filter(Boolean),
          ),
        ] as string[],
        notes: recipe.notes || [
          {
            note: 'Store in an airtight container in the refrigerator',
            category: 'storage',
          },
        ],
      };

      // Step 2: Generate image
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: generateImagePrompt(validatedRecipe),
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'natural',
      });

      if (!imageResponse.data[0]?.url) {
        throw new Error('Failed to generate image');
      }

      // Step 3: Download and upload image to R2
      console.log('Downloading DALL-E generated image...');
      const imageBuffer = await downloadImage(imageResponse.data[0].url);

      console.log('Uploading image to R2...');
      const r2ImageUrl = await uploadToR2(imageBuffer);

      // Step 4: Insert into database
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
        image: r2ImageUrl,
        userId: payload.userId,
      };

      const result = await db.insert(recipesTable).values(recipeInsert);

      return {
        success: true,
        recipeId: result.lastInsertRowid,
        recipe: recipeInsert,
      };
    } catch (error) {
      console.error('Error in recipe generation task:', error);
      throw error;
    }
  },
});
