import { task } from '@trigger.dev/sdk/v3';
import { OpenAI } from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import { PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

import { db } from '@/db/db';
import { recipesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { RecipeSchema } from '@/schemas/recipe';
import type { z } from 'zod';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

const SYSTEM_PROMPT = `You are a professional recipe editor with expertise in modifying recipes while maintaining their core characteristics.
Follow these guidelines:
1. Preserve the recipe's overall structure and format
2. Make changes based on the provided modification note
3. Maintain nutritional balance when making substitutions
4. Keep instructions clear and detailed
5. Consider dietary restrictions when making changes
6. Preserve cooking temperatures and adjust times if needed
7. Update chef's tips and notes as needed
8. Maintain all required fields in the recipe structure

Important: All fields must be provided. Use existing values if not specifically modified.
Never return null values - use empty strings or arrays instead.`;

// Helper function to generate unique filename
function generateFilename(extension: string = 'png'): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(4).toString('hex');
    return `image-${timestamp}-${randomString}.${extension}`;
}

// Helper function to download image from URL
async function downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
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

// Helper function to delete image from R2
async function deleteFromR2(imageUrl: string): Promise<void> {
    // Extract filename from URL
    const filename = imageUrl.split('/').pop();
    if (!filename) {
        throw new Error('Invalid image URL');
    }

    const deleteCommand = new DeleteObjectCommand({
        Bucket: r2Config.bucketName,
        Key: filename,
    });

    try {
        await s3Client.send(deleteCommand);
    } catch (error) {
        console.error(`Failed to delete image from R2: ${(error as Error).message}`);
        // Don't throw error here as it's not critical to the main operation
    }
}

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
Key ingredients to highlight: ${recipe.ingredients.slice(0, 3).map((ing: { name: string }) => ing.name).join(', ')}
`;

interface EditRecipeTaskPayload {
    recipeId: number;
    note: string;
    userId: string;
    regenerateImage?: boolean;
}

export const editRecipeTask = task({
    id: 'recipe-edit-task',
    retry: {
        maxAttempts: 5,
        factor: 1.8,
        minTimeoutInMs: 1000,
        maxTimeoutInMs: 60_000,
        randomize: true,
    },
    run: async (payload: EditRecipeTaskPayload) => {
        try {
            // 1. Fetch and validate the recipe
            const [recipe] = await db
                .select()
                .from(recipesTable)
                .where(eq(recipesTable.id, payload.recipeId))
                .limit(1);

            if (!recipe) {
                throw new Error(`Recipe with ID ${payload.recipeId} not found`);
            }

            // Verify ownership
            if (recipe.userId !== payload.userId) {
                throw new Error('Unauthorized to edit this recipe');
            }

            // Parse JSON fields
            const currentRecipe = {
                ...recipe,
                ingredients: JSON.parse(recipe.ingredients),
                instructions: JSON.parse(recipe.instructions),
                equipment: JSON.parse(recipe.equipment),
                tags: JSON.parse(recipe.tags),
                notes: JSON.parse(recipe.notes),
            };

            // 2. Generate modified recipe
            const completion = await openai.beta.chat.completions.parse({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT,
                    },
                    {
                        role: 'user',
                        content: `Original Recipe:
${JSON.stringify(currentRecipe, null, 2)}

Modification Note:
${payload.note}

Please output the modified recipe in valid JSON format, maintaining the exact same structure.
The image URL should remain unchanged unless specifically mentioned in the note.`,
                    },
                ],
                response_format: zodResponseFormat(RecipeSchema, 'recipe'),
                temperature: 0.7,
            });

            const modifiedRecipe = completion.choices[0].message.parsed;

            if (!modifiedRecipe) {
                throw new Error('Failed to edit recipe');
            }

            // 3. Generate new image if requested or if recipe title/description changed significantly
            let newImageUrl = currentRecipe.image;
            if (payload.regenerateImage ||
                modifiedRecipe.title !== currentRecipe.title ||
                modifiedRecipe.description !== currentRecipe.description) {

                // Generate new image
                const imageResponse = await openai.images.generate({
                    model: 'dall-e-3',
                    prompt: generateImagePrompt(modifiedRecipe),
                    n: 1,
                    size: '1024x1024',
                    quality: 'hd',
                    style: 'natural',
                });

                if (!imageResponse.data[0]?.url) {
                    throw new Error('Failed to generate new image');
                }

                // Download and upload new image
                console.log('Downloading DALL-E generated image...');
                const imageBuffer = await downloadImage(imageResponse.data[0].url);

                console.log('Uploading new image to R2...');
                newImageUrl = await uploadToR2(imageBuffer);

                // Delete old image
                console.log('Deleting old image from R2...');
                await deleteFromR2(currentRecipe.image);
            }

            // 4. Validate the modified recipe
            const requiredFields = [
                'title',
                'description',
                'category',
                'cuisine',
                'difficulty',
                'servings',
                'prepTime',
                'cookTime',
                'totalTime',
                'ingredients',
                'instructions',
                'equipment',
                'tags',
                'notes',
                'image',
            ];

            for (const field of requiredFields) {
                if (!(field in modifiedRecipe)) {
                    throw new Error(`Modified recipe is missing required field: ${field}`);
                }
            }

            // 5. Update the recipe in the database
            const updatedRecipe = await db
                .update(recipesTable)
                .set({
                    ...modifiedRecipe,
                    image: newImageUrl,
                    ingredients: JSON.stringify(modifiedRecipe.ingredients),
                    instructions: JSON.stringify(modifiedRecipe.instructions),
                    equipment: JSON.stringify(modifiedRecipe.equipment),
                    tags: JSON.stringify(modifiedRecipe.tags),
                    notes: JSON.stringify(modifiedRecipe.notes),
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(recipesTable.id, payload.recipeId))
                .returning();

            return {
                success: true,
                recipeId: payload.recipeId,
                recipe: updatedRecipe[0],
                imageUpdated: newImageUrl !== currentRecipe.image,
            };
        } catch (error) {
            console.error('Error in recipe edit task:', error);
            throw error;
        }
    },
});