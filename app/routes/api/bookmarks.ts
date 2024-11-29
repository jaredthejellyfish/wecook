import { getAuth } from '@clerk/tanstack-start/server';
import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { eq } from 'drizzle-orm';

import { db } from '@/db/db';
import { bookmarksTable } from '@/db/schema';

export const Route = createAPIFileRoute('/api/bookmarks')({
  GET: async ({ request, params }) => {
    const { userId } = await getAuth(request);

    if (!userId) {
      // This will error because you're redirecting to a path that doesn't exist yet
      // You can create a sign-in route to handle this
      return json({ bookmarks: [] });
    }

    const bookmarks = await db
      .select()
      .from(bookmarksTable)
      .where(eq(bookmarksTable.userId, userId));

    return json({ bookmarks: bookmarks ?? [] });
  },
});
