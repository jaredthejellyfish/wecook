import { getAuth } from '@clerk/tanstack-start/server'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import { eq } from 'drizzle-orm'
import { getWebRequest } from 'vinxi/http'

import Calendar from '@/components/Calendar'

import { db } from '@/db/db'
import { type SelectEvent, eventsTable, recipesTable } from '@/db/schema'
import type { CalendarEvent } from '@/lib/types'
import authStateFn from '@/server-fns/auth-redirect'

const transformEvents = (events: SelectEvent[]): CalendarEvent[] => {
  return events.map((event) => ({
    ...event,
    date: new Date(event.date),
  }))
}

const eventsWithRecipesByUserId = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { userId } = await getAuth(getWebRequest())

    if (!userId) {
      // This will error because you're redirecting to a path that doesn't exist yet
      // You can create a sign-in route to handle this
      throw redirect({
        to: '/',
      })
    }

    const data = await db
      .select({
        id: eventsTable.id,
        date: eventsTable.date,
        mealType: eventsTable.mealType,
        userId: eventsTable.userId,
        recipeId: eventsTable.recipeId,
        recipeTitle: recipesTable.title,
        recipeImage: recipesTable.image,
        recipeDescription: recipesTable.description,
      })
      .from(eventsTable)
      .leftJoin(recipesTable, eq(eventsTable.recipeId, recipesTable.id))
      .where(eq(eventsTable.userId, userId))

    const events = transformEvents(data)

    return { events } as { events: CalendarEvent[] }
  },
)

export const Route = createFileRoute('/(app)/weekly-prep/')({
  component: WeeklyPrepPage,
  beforeLoad: () => authStateFn(),
  loader: () => eventsWithRecipesByUserId(),
})

function WeeklyPrepPage() {
  const { events } = Route.useLoaderData()

  return <Calendar events={events as CalendarEvent[]} />
}
