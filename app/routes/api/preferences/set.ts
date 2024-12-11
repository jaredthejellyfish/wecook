import { preferencesTable } from '@/db/schema'
import { db } from '@/db/db'
import { getAuth } from '@clerk/tanstack-start/server'
import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const preferencesSchema = z.object({
  dietaryType: z.string().nullable().optional(),
  allergies: z.string().nullable().optional(),
  cookingTime: z.string().nullable().optional(),
  skillLevel: z.string().nullable().optional(),
  servings: z.string().nullable().optional(),
  cuisineType: z.string().nullable().optional(),
  spiceLevel: z.string().nullable().optional(),
  specialNotes: z.string().nullable().optional(),
  budget: z.string().nullable().optional(),
})

export const Route = createAPIFileRoute('/api/preferences/set')({
  POST: async ({ request }) => {
    try {
      const { userId } = await getAuth(request)

      if (!userId) {
        return json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      const body = await request.json()
      const { preferences } = body

      // Validate preferences
      const validatedPreferences = preferencesSchema.parse(preferences)

      // Try to update existing preferences first
      const updated = await db
        .update(preferencesTable)
        .set({
          ...validatedPreferences,
          userId,
        })
        .where(eq(preferencesTable.userId, userId))
        .returning()

      // If no rows were updated, insert new preferences
      if (!updated.length) {
        const inserted = await db
          .insert(preferencesTable)
          .values({
            ...validatedPreferences,
            userId,
          })
          .returning()

        return json({ preferences: inserted[0] })
      }

      return json({ preferences: updated[0] })
    } catch (error) {
      console.error('Error updating preferences:', error)

      if (error instanceof z.ZodError) {
        return json(
          {
            success: false,
            error: 'Invalid preferences format',
            details: error.issues,
          },
          { status: 400 },
        )
      }

      return json(
        {
          success: false,
          error: 'Failed to update preferences',
        },
        { status: 500 },
      )
    }
  },
})
