import { getAuth } from '@clerk/tanstack-start/server';
import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { eq } from 'drizzle-orm';

import { db } from '@/db/db';
import { recipesTable } from '@/db/schema';
import { z } from 'zod';


const BodySchema = z.object({
    recipeId: z.string(),
    isPublic: z.boolean(),
})

export const Route = createAPIFileRoute('/api/recipes/public')({
    POST: async ({ request }) => {
        const { userId } = await getAuth(request);


        if (!userId) {
            // This will error because you're redirecting to a path that doesn't exist yet
            // You can create a sign-in route to handle this
            return json({ bookmarks: [] });
        }

        const { recipeId, isPublic } = BodySchema.parse(await request.json());


        await db
            .update(recipesTable)
            .set({ isPublic })
            .where(eq(recipesTable.id, Number(recipeId)));

        return json({ success: true });
    },
});
