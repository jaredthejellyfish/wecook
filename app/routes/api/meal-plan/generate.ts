import { getAuth } from '@clerk/tanstack-start/server';
import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { tasks } from '@trigger.dev/sdk/v3';
import OpenAI from 'openai';
import { z } from 'zod';

import {
  BudgetEnum,
  CookingTimeEnum,
  CuisineTypeEnum,
  DietaryTypeEnum,
  QuerySchema,
  ServingSizeEnum,
  SkillLevelEnum,
  SpiceLevelEnum,
} from '@/schemas/query-schema';
import type { recipeGenerationTaskWithEvent } from '@/trigger/generate-recipe-with-event';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI();

const ExtendedQuerySchema = QuerySchema.extend({
  title: z.string().optional(),
});

type ExtendedRecipeQuery = z.infer<typeof ExtendedQuerySchema>;

const MealPlanGenerationSchema = z.object({
  numberOfDays: z.enum(['3', '5', '7', '14', '28']),
  dietaryType: DietaryTypeEnum,
  allergies: z.string().max(255).optional(),
  cookingTime: CookingTimeEnum,
  skillLevel: SkillLevelEnum,
  servings: ServingSizeEnum,
  spiceLevel: SpiceLevelEnum,
  budget: BudgetEnum,
  cuisinePreferences: CuisineTypeEnum,
  mealPreferences: z.object({
    breakfast: z.boolean(),
    lunch: z.boolean(),
    dinner: z.boolean(),
    snacks: z.boolean(),
  }),
  weekendCooking: z.enum(['same', 'more', 'less']),
  leftoverPreference: z.enum(['none', 'some', 'lots']),
  specialNotes: z.string().max(255).optional(),
});

type MealPlanGenerationInput = z.infer<typeof MealPlanGenerationSchema>;
const getMealOrder = (mealType: string): number => {
  switch (mealType) {
    case 'breakfast':
      return 0;
    case 'brunch':
      return 1;
    case 'lunch':
      return 2;
    case 'dinner':
      return 3;
    case 'snack':
      return 4;
    default:
      return 5;
  }
};

const generateRecipeTitle = async (
  query: ExtendedRecipeQuery,
  existingTitles: string[] = [],
): Promise<string> => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a creative chef who creates appealing recipe titles. Generate a single, concise recipe title (max 60 characters) that reflects the requirements. Return ONLY the title, nothing else. The title must be unique and different from any previously generated titles.',
      },
      {
        role: 'user',
        content: `Create a unique title for a ${query.mealType} recipe that is:
                - ${query.dietaryType} diet
                - ${query.cookingTime} cooking time
                - ${query.skillLevel} skill level
                - ${query.cuisineType} cuisine
                - ${query.spiceLevel} spice level
                ${query.allergies ? `- Avoiding: ${query.allergies}` : ''}
                ${query.specialNotes ? `- Special notes: ${query.specialNotes}` : ''}
                
                Previously generated titles (DO NOT reuse these):
                ${existingTitles.map((title, index) => `${index + 1}. ${title}`).join('\n')}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 60,
    presence_penalty: 0.3,
    frequency_penalty: 0.8,
  });

  return completion.choices[0].message.content?.trim() || 'Delicious Recipe';
};

const generateMealPlans = async (
  input: MealPlanGenerationInput,
): Promise<ExtendedRecipeQuery[]> => {
  const numberOfDays = parseInt(input.numberOfDays);
  const mealPlans: ExtendedRecipeQuery[] = [];
  const generatedTitles: string[] = [];

  // Get selected meal types from preferences
  const selectedMeals = Object.entries(input.mealPreferences)
    .filter(([, isSelected]) => isSelected)
    .map(([mealType]) => {
      switch (mealType) {
        case 'breakfast':
          return 'breakfast';
        case 'lunch':
          return 'lunch';
        case 'dinner':
          return 'dinner';
        case 'snacks':
          return 'snack';
        default:
          return 'dinner'; // fallback
      }
    });

  // Generate meals
  for (let day = 0; day < numberOfDays; day++) {
    for (let meal = 0; meal < selectedMeals.length; meal++) {
      const isWeekend = day % 7 >= 5; // Saturday or Sunday

      // Adjust cooking time and skill level based on weekend preference
      let adjustedCookingTime = input.cookingTime;
      let adjustedSkillLevel = input.skillLevel;
      if (isWeekend) {
        switch (input.weekendCooking) {
          case 'more':
            adjustedCookingTime = '1 hour';
            adjustedSkillLevel = 'intermediate';
            break;
          case 'less':
            adjustedCookingTime = '15 minutes';
            adjustedSkillLevel = 'beginner';
            break;
        }
      }

      // Adjust servings based on leftover preference
      let adjustedServings = input.servings;
      if (input.leftoverPreference !== 'none') {
        if (
          (input.leftoverPreference === 'lots' && day % 3 === 0) ||
          (input.leftoverPreference === 'some' && day % 2 === 0)
        ) {
          adjustedServings = '3-4';
        }
      }

      const mealPlan: ExtendedRecipeQuery = {
        mealType: selectedMeals[meal],
        dietaryType: input.dietaryType,
        allergies: input.allergies,
        cookingTime: adjustedCookingTime,
        skillLevel: adjustedSkillLevel,
        servings: adjustedServings,
        cuisineType: input.cuisinePreferences,
        spiceLevel: input.spiceLevel,
        specialNotes: input.specialNotes,
        budget: input.budget,
      };

      // Validate the generated meal plan
      try {
        const validatedMealPlan = ExtendedQuerySchema.parse(mealPlan);
        // Generate unique title for the recipe
        const title = await generateRecipeTitle(
          validatedMealPlan,
          generatedTitles,
        );
        validatedMealPlan.title = title;
        generatedTitles.push(title);
        mealPlans.push(validatedMealPlan);
      } catch (error) {
        console.error('Invalid meal plan generated:', error);
        meal--; // Retry this meal
      }
    }
  }

  return mealPlans;
};

export const APIRoute = createAPIFileRoute('/api/meal-plan/generate')({
  POST: async ({ request }: { request: Request }) => {
    try {
      const { userId } = await getAuth(request);
      if (!userId) {
        return json(
          { error: 'Unauthorized', batchId: null, publicAccessToken: null },
          { status: 401 },
        );
      }

      const body = await request.json();

      const parsedBody = MealPlanGenerationSchema.transform((data) => ({
        ...data,
        dietaryType: data.dietaryType.toLowerCase(),
        cookingTime: data.cookingTime.toLowerCase(),
        skillLevel: data.skillLevel.toLowerCase(),
        servings: data.servings.toLowerCase(),
        spiceLevel: data.spiceLevel.toLowerCase(),
        budget: data.budget.toLowerCase(),
        cuisinePreferences: data.cuisinePreferences.toLowerCase(),
        numberOfDays: data.numberOfDays,
        allergies: data.allergies,
        mealPreferences: data.mealPreferences,
        weekendCooking: data.weekendCooking,
        leftoverPreference: data.leftoverPreference,
        specialNotes: data.specialNotes,
      })).parse(body);

      const mealPlans = await generateMealPlans(parsedBody);

      // Get current date as the starting point
      const startDate = new Date();

      // Prepare batch items with proper date scheduling
      const batchItems = mealPlans.map((plan, index) => {
        const selectedMealCount = Object.values(
          parsedBody.mealPreferences,
        ).filter(Boolean).length;
        const dayIndex = Math.floor(index / selectedMealCount);

        // Create a new date object for this meal
        const mealDate = new Date(startDate);
        mealDate.setDate(startDate.getDate() + dayIndex);

        // Format the date according to the specified format
        const formattedDate = mealDate.toLocaleDateString('en-US', {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

        return {
          payload: {
            ...plan,
            userId,
            date: formattedDate,
            dayIndex,
            mealIndex: index % selectedMealCount,
          },
          options: {
            idempotencyKey: `recipe-${userId}-${Date.now()}-${index}`,
            concurrencyKey: `user-${userId}`,
            ttl: '30m',
            metadata: {
              mealType: plan.mealType,
              dayIndex,
              mealIndex: index % selectedMealCount,
              scheduledDate: formattedDate,
            },
            tags: [
              `user:${userId}`,
              `meal:${plan.mealType}`,
              `diet:${plan.dietaryType}`,
              `cuisine:${plan.cuisineType}`,
              `day:${dayIndex + 1}`,
            ],
          },
        };
      });

      // Sort batch items by date and meal order to ensure proper ordering
      batchItems.sort((a, b) => {
        const dateA = new Date(a.payload.date);
        const dateB = new Date(b.payload.date);

        if (dateA.getTime() === dateB.getTime()) {
          // If same day, sort by meal order
          return (
            getMealOrder(a.payload.mealType) - getMealOrder(b.payload.mealType)
          );
        }
        return dateA.getTime() - dateB.getTime();
      });

      // Batch trigger the recipe generation tasks with type safety
      const batchResult = await tasks.batchTrigger<
        typeof recipeGenerationTaskWithEvent
      >('recipe-generation-task-with-event', batchItems, {
        // Global batch options
        idempotencyKey: `meal-plan-${userId}-${Date.now()}`,
      });

      if (!batchResult.batchId) {
        return json(
          {
            error: 'Failed to trigger batch recipe generation',
            batchId: null,
            publicAccessToken: null,
          },
          { status: 500 },
        );
      }

      return json({
        batchId: batchResult.batchId,
        publicAccessToken: batchResult.publicAccessToken,
      });
    } catch (error) {
      console.error('Error generating meal plans:', error);
      return json(
        {
          error: 'Failed to generate meal plans',
          message: error,
          batchId: null,
          publicAccessToken: null,
        },
        { status: 500 },
      );
    }
  },
});
