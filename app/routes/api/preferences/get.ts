import { preferencesTable } from '@/db/schema'
import { json } from '@tanstack/start'
import { eq } from 'drizzle-orm'
import { createAPIFileRoute } from '@tanstack/start/api'
import { db } from '@/db/db'
import { getAuth } from '@clerk/tanstack-start/server'


export const APIRoute = createAPIFileRoute('/api/preferences/get')({
    GET: async ({ request }) => {
        const { userId } = await getAuth(request)

        if (!userId) {
            return json({ preferences: null })
        }

        const preferences = await db
            .select()
            .from(preferencesTable)
            .where(eq(preferencesTable.userId, userId))

        return json({ preferences: preferences[0] })
    },
})
