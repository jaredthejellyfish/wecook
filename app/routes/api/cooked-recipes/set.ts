import { getAuth } from '@clerk/tanstack-start/server'
import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { and, eq } from 'drizzle-orm'
import { getWebRequest } from 'vinxi/http'
import z from 'zod'

import { db } from '@/db/db'
import { cookedRecipesTable } from '@/db/schema'

const RecipeListSchema = z.object({
  recipeId: z.string(),
})

export const APIRoute = createAPIFileRoute('/api/cooked-recipes/set')({
  POST: async ({ request }) => {
    try {
      const { userId } = await getAuth(getWebRequest())

      if (!userId) {
        return json({ error: 'Unauthorized' }, { status: 401 })
      }

      const body = await request.json()
      const validatedParams = RecipeListSchema.parse(body)

      if (!validatedParams.recipeId) {
        return json({ error: 'Recipe ID is required' }, { status: 400 })
      }

      try {
        const createdHasBeenCooked = await db
          .insert(cookedRecipesTable)
          .values({
            userId,
            recipeId: parseInt(validatedParams.recipeId),
            createdAt: new Date().toLocaleDateString('en-US'),
          })
          .returning()

        return json({ hasBeenCooked: createdHasBeenCooked })
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.message.includes('UNIQUE constraint failed')
        ) {
          await db
            .delete(cookedRecipesTable)
            .where(
              and(
                eq(cookedRecipesTable.userId, userId),
                eq(
                  cookedRecipesTable.recipeId,
                  parseInt(validatedParams.recipeId),
                ),
              ),
            )
            .execute()

          return json({ hasBeenCooked: false })
        }

        throw error // Re-throw if it's a different error
      }
    } catch {
      return json({ error: 'Failed to cook recipe' }, { status: 500 })
    }
  },
})
