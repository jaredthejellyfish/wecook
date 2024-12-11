import { getAuth } from '@clerk/tanstack-start/server'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import { eq } from 'drizzle-orm'
import { getWebRequest } from 'vinxi/http'

import { db } from '@/db/db'
import { recipesTable } from '@/db/schema'
import { transformDbRecord } from '@/schemas/recipe'
import authStateFn from '@/server-fns/auth-redirect'

const recipesByUserId = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await getAuth(getWebRequest())

  if (!userId) {
    // This will error because you're redirecting to a path that doesn't exist yet
    // You can create a sign-in route to handle this
    throw redirect({
      to: '/',
    })
  }

  const data = await db
    .select()
    .from(recipesTable)
    .where(eq(recipesTable.userId, userId))

  const transformedRecipes = []

  for (const recipe of data) {
    const transformedRecipe = transformDbRecord(recipe)
    transformedRecipes.push(transformedRecipe)
  }

  return { recipes: transformedRecipes }
})

export const Route = createFileRoute('/(app)/help/')({
  component: HelpPage,
  beforeLoad: () => authStateFn(),
  loader: () => recipesByUserId(),
})

function HelpPage() {
  return <span>Help</span>
}
