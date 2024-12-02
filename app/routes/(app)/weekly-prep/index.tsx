import { getAuth } from '@clerk/tanstack-start/server';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { eq } from 'drizzle-orm';
import { getWebRequest } from 'vinxi/http';

import Calendar from '@/components/Calendar';

import { db } from '@/db/db';
import { eventsTable, recipesTable } from '@/db/schema';
import authStateFn from '@/server-fns/auth-redirect';

const eventsWithRecipesByUserId = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { userId } = await getAuth(getWebRequest());

    if (!userId) {
      // This will error because you're redirecting to a path that doesn't exist yet
      // You can create a sign-in route to handle this
      throw redirect({
        to: '/',
      });
    }

    const data = await db
      .select({
        id: eventsTable.id,
        title: eventsTable.title,
        description: eventsTable.description,
        time: eventsTable.time,
        userId: eventsTable.userId,
        recipeId: eventsTable.recipeId,
        recipeTitle: recipesTable.title,
      })
      .from(eventsTable)
      .leftJoin(recipesTable, eq(eventsTable.recipeId, recipesTable.id))
      .where(eq(eventsTable.userId, userId));

    return { events: data };
  },
);

export const Route = createFileRoute('/(app)/weekly-prep/')({
  component: WeeklyPrepPage,
  beforeLoad: () => authStateFn(),
  loader: () => eventsWithRecipesByUserId(),
});

function WeeklyPrepPage() {
  const { events } = Route.useLoaderData();

  console.log('events', events);

  return <Calendar />;
}
