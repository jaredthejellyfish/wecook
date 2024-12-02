import { getAuth } from '@clerk/tanstack-start/server'
import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { tasks } from '@trigger.dev/sdk/v3'
import { z } from 'zod'

import { recipeGenerationTask } from '@/trigger/generate-recipe'

// Query parameter validation schema
const QuerySchema = z.object({
  mealType: z.string(),
  dietaryType: z.string(),
  allergies: z.string().optional(),
  cookingTime: z.string(),
  skillLevel: z.string(),
  servings: z.string(),
  cuisineType: z.string(),
  spiceLevel: z.string(),
  specialNotes: z.string().optional(),
  budget: z.string(),
})

export const Route = createAPIFileRoute('/api/recipes/generate')({
  GET: async ({ request }) => {


    try {
      const url = new URL(request.url)
      const params = Object.fromEntries(url.searchParams)
      const validatedParams = QuerySchema.parse(params)
      const { userId } = await getAuth(request)

      if (!userId) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      // Trigger the recipe generation task
      const handle = await tasks.trigger<typeof recipeGenerationTask>(
        'recipe-generation-task',
        {
          mealType: validatedParams.mealType,
          dietaryType: validatedParams.dietaryType,
          allergies: validatedParams.allergies,
          cookingTime: validatedParams.cookingTime,
          skillLevel: validatedParams.skillLevel,
          servings: validatedParams.servings,
          cuisineType: validatedParams.cuisineType,
          spiceLevel: validatedParams.spiceLevel,
          specialNotes: validatedParams.specialNotes,
          budget: validatedParams.budget,
          userId,
        },
      )

      if (!handle.id) {
        return json(
          {
            success: false,
            error: 'Failed to generate recipe',
          },
          { status: 500 },
        )
      }

      return json({
        success: true,
        data: handle,
      })
    } catch (error) {
      console.error('Error generating recipe:', error)

      if (error instanceof z.ZodError) {
        return json(
          {
            success: false,
            error: 'Invalid parameters',
            details: error.issues,
          },
          { status: 400 },
        )
      }

      return json(
        {
          success: false,
          error: 'Internal server error',
        },
        { status: 500 },
      )
    }
  },
})
