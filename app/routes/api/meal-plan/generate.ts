import {
    CookingTimeEnum,
    SpiceLevelEnum,
    ServingSizeEnum,
    QuerySchema,
    SkillLevelEnum,
    DietaryTypeEnum,
    BudgetEnum,
    CuisineTypeEnum,
} from '@/schemas/query-schema'
import { cuisineTypes } from '@/constants/recipe-form'
import type { RecipeQuery } from '@/schemas/query-schema'
import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { z } from 'zod'
import { tasks } from '@trigger.dev/sdk/v3'
import { getAuth } from '@clerk/tanstack-start/server'
import type { recipeGenerationTaskWithEvent } from '@/trigger/generate-recipe-with-event'

const MealPlanGenerationSchema = z.object({
    numberOfDays: z.string(),
    mealsPerDay: z.string(),
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
})

type MealPlanGenerationInput = z.infer<typeof MealPlanGenerationSchema>

const getMealOrder = (mealType: string): number => {
    switch (mealType) {
        case 'Breakfast':
        case 'Brunch':
            return 0;
        case 'Lunch':
        case 'Light Meal':
            return 1;
        case 'Snack':
            return 2;
        case 'Dinner':
        case 'Supper':
            return 3;
        default:
            return 4;
    }
}

const generateMealPlans = (input: MealPlanGenerationInput): RecipeQuery[] => {
    const numberOfDays = parseInt(input.numberOfDays)
    const mealsPerDay = parseInt(input.mealsPerDay)
    const mealPlans: RecipeQuery[] = []

    // Parse cuisine preferences into array
    const cuisinePreferences = input.cuisinePreferences
        .split(',')
        .map((cuisine) => cuisine.trim())
        .filter((cuisine) => cuisineTypes.includes(cuisine))

    // Get valid cuisine types based on preferences
    const getValidCuisines = () => {
        return cuisinePreferences.length > 0 ? cuisinePreferences : cuisineTypes
    }

    // Generate appropriate meal types based on time of day and preferences
    const getMealTypeForIndex = (index: number, dayIndex: number): string => {
        const mealIndex = index % mealsPerDay
        const isWeekend = dayIndex % 7 >= 5 // Saturday or Sunday

        // Adjust cooking complexity for weekends
        if (isWeekend) {
            switch (input.weekendCooking) {
                case 'more':
                    // Increase cooking time and complexity for weekends
                    input.cookingTime = '60 minutes'
                    input.skillLevel = 'Intermediate'
                    break
                case 'less':
                    // Decrease cooking time and complexity for weekends
                    input.cookingTime = '15 minutes'
                    input.skillLevel = 'Beginner'
                    break
            }
        }

        // Return meal type based on preferences
        switch (mealIndex) {
            case 0:
                return input.mealPreferences.breakfast ? 'Breakfast' : 'Brunch'
            case 1:
                return input.mealPreferences.lunch ? 'Lunch' : 'Light Meal'
            case 2:
                return input.mealPreferences.dinner ? 'Dinner' : 'Supper'
            default:
                return input.mealPreferences.snacks ? 'Snack' : 'Light Meal'
        }
    }

    // Helper function to get random item from array
    const getRandomItem = <T,>(items: T[]): T => {
        return items[Math.floor(Math.random() * items.length)]
    }

    // Adjust cooking time based on leftover preferences
    const adjustForLeftovers = (dayIndex: number) => {
        switch (input.leftoverPreference) {
            case 'lots':
                // Every third day, increase portions and cooking time for batch cooking
                if (dayIndex % 3 === 0) {
                    return {
                        servings: '3-4',
                        cookingTime: '60 minutes',
                    }
                }
                break
            case 'some':
                // Every other day, slightly increase portions
                if (dayIndex % 2 === 0) {
                    return {
                        servings: '3-4',
                        cookingTime: input.cookingTime,
                    }
                }
                break
        }
        return {
            servings: input.servings,
            cookingTime: input.cookingTime,
        }
    }

    // Generate meals
    for (let day = 0; day < numberOfDays; day++) {
        for (let meal = 0; meal < mealsPerDay; meal++) {
            const currentIndex = day * mealsPerDay + meal
            const leftoverSettings = adjustForLeftovers(day)

            const mealPlan: RecipeQuery = {
                mealType: getMealTypeForIndex(currentIndex, day),
                dietaryType: input.dietaryType,
                allergies: input.allergies,
                cookingTime: leftoverSettings.cookingTime,
                skillLevel: input.skillLevel,
                servings: leftoverSettings.servings,
                cuisineType: getRandomItem(getValidCuisines()),
                spiceLevel: input.spiceLevel,
                specialNotes: input.specialNotes,
                budget: input.budget,
            }

            // Validate the generated meal plan
            try {
                QuerySchema.parse(mealPlan)
                mealPlans.push(mealPlan)
            } catch (error) {
                console.error('Invalid meal plan generated:', error)
                meal-- // Retry this meal
            }
        }
    }

    return mealPlans
}
const handler = async ({ request }: { request: Request }) => {
    try {
        const { userId } = await getAuth(request)
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const parsedBody = MealPlanGenerationSchema.parse(body)
        const mealPlans = generateMealPlans(parsedBody)

        // Get current date as the starting point
        const startDate = new Date()
        
        // Prepare batch items with proper date scheduling
        const batchItems = mealPlans.map((plan, index) => {
            // Calculate which day this meal belongs to
            const dayIndex = Math.floor(index / parseInt(parsedBody.mealsPerDay))
            
            // Create a new date object for this meal
            const mealDate = new Date(startDate)
            mealDate.setDate(startDate.getDate() + dayIndex)
            
            // Format the date according to the specified format
            const formattedDate = mealDate.toLocaleDateString('en-US', {
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })

            return {
                payload: {
                    ...plan,
                    userId,
                    date: formattedDate,
                    dayIndex,
                    mealIndex: index % parseInt(parsedBody.mealsPerDay),
                },
                options: {
                    idempotencyKey: `recipe-${userId}-${Date.now()}-${index}`,
                    concurrencyKey: `user-${userId}`,
                    ttl: '30m',
                    metadata: {
                        mealType: plan.mealType,
                        dayIndex,
                        mealIndex: index % parseInt(parsedBody.mealsPerDay),
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
            }
        })

        // Sort batch items by date and meal order to ensure proper ordering
        batchItems.sort((a, b) => {
            const dateA = new Date(a.payload.date)
            const dateB = new Date(b.payload.date)
            
            if (dateA.getTime() === dateB.getTime()) {
                // If same day, sort by meal order
                return getMealOrder(a.payload.mealType) - getMealOrder(b.payload.mealType)
            }
            return dateA.getTime() - dateB.getTime()
        })

        // Batch trigger the recipe generation tasks with type safety
        const batchResult = await tasks.batchTrigger<typeof recipeGenerationTaskWithEvent>(
            'recipe-generation-task-with-event',
            batchItems,
            {
                // Global batch options
                idempotencyKey: `meal-plan-${userId}-${Date.now()}`,
            },
        )

        if (!batchResult.batchId) {
            return json(
                {
                    success: false,
                    error: 'Failed to trigger batch recipe generation',
                },
                { status: 500 },
            )
        }

        return json({
            success: true,
            mealPlans,
            generation: {
                batchId: batchResult.batchId,
                runs: batchResult.runs,
                totalRecipes: mealPlans.length,
            },
        })
    } catch (error) {
        console.error('Error generating meal plans:', error)
        return json(
            { error: 'Failed to generate meal plans', message: error },
            { status: 500 },
        )
    }
}

export { generateMealPlans }
export const Route = createAPIFileRoute('/api/meal-plan/generate')({
    POST: handler,
})