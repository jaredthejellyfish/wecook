import { getAuth } from '@clerk/tanstack-start/server';
import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { and } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { getWebRequest } from 'vinxi/http';
import z from 'zod';

import { db } from '@/db/db';
import { cookedRecipesTable } from '@/db/schema';

const RecipeListSchema = z.object({
  recipeId: z.string(),
});

export const APIRoute = createAPIFileRoute('/api/cooked-recipes/get')({
  GET: async ({ request }) => {
    const { userId } = await getAuth(getWebRequest());

    if (!userId) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);
    const validatedParams = RecipeListSchema.parse(params);

    const hasBeenCooked = await db
      .select()
      .from(cookedRecipesTable)
      .where(
        and(
          eq(cookedRecipesTable.userId, userId),
          eq(cookedRecipesTable.recipeId, parseInt(validatedParams.recipeId)),
        ),
      );

    return json([...hasBeenCooked]);
  },
});
