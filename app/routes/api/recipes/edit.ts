import { getAuth } from '@clerk/tanstack-start/server'
import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { tasks } from '@trigger.dev/sdk/v3'
import { z } from 'zod'

import { editRecipeTask } from '@/trigger/edit-recipe'

// Body validation schema
const BodySchema = z.object({
  recipeId: z.string(),
  note: z.string(),
})

export const Route = createAPIFileRoute('/api/recipes/edit')({
  POST: async ({ request }) => {

    try {
      const body = await request.json()
      const validatedBody = BodySchema.parse(body)
      const { userId } = await getAuth(request)

      if (!userId) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      // Trigger the recipe generation task
      const handle = await tasks.trigger<typeof editRecipeTask>(
        'recipe-edit-task',
        {
          recipeId: Number(validatedBody.recipeId),
          note: validatedBody.note,
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
