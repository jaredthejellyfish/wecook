import { db } from '@/db/db';
import { bookmarksTable, recipesTable } from '@/db/schema';
import { DeleteRecipeSchema } from '@/schemas/delete-recipe';
import { getAuth } from '@clerk/tanstack-start/server';
import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { eq } from 'drizzle-orm';

export const Route = createAPIFileRoute('/api/recipes/delete')({
    GET: async ({ request }) => {

        const url = new URL(request.url);
        const params = Object.fromEntries(url.searchParams);

        const { recipeId } = DeleteRecipeSchema.parse(params);

        const { userId } = await getAuth(request);

        if (!userId) {
            return json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const bookmarks = await db.delete(bookmarksTable).where(eq(bookmarksTable.recipeId, Number(recipeId)));
        const recipe = await db.delete(recipesTable).where(eq(recipesTable.id, Number(recipeId)));

        if (!bookmarks || !recipe) {
            return json({ success: false, error: 'Failed to delete recipe' }, { status: 500 });
        }

        return json({ success: true });
    },
})
