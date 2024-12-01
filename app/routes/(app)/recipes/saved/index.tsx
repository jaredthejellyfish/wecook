import { useState } from 'react'

import { getAuth } from '@clerk/tanstack-start/server'
import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import { eq } from 'drizzle-orm'
import { motion } from 'framer-motion'
import { Bookmark, Clock, Filter, Search, SortAsc } from 'lucide-react'
import { getWebRequest } from 'vinxi/http'

import Header from '@/components/header'
import RecipeCard from '@/components/recipe-card'
import { SidebarNav } from '@/components/sidebar-nav'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import authStateFn from '@/server-fns/auth-redirect'
import bookmarkRecipeFn from '@/server-fns/bookmark-recipe'

import { db } from '@/db/db'
import { type SelectBookmark, bookmarksTable, recipesTable } from '@/db/schema'
import { cn } from '@/lib/utils'
import { transformDbRecord } from '@/schemas/recipe'

const bookmarkedRecipesByUserId = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const { userId } = await getAuth(getWebRequest())

      if (!userId) {
        throw redirect({
          to: '/',
        })
      }

      const data = await db
        .select({
          recipe: recipesTable,
        })
        .from(bookmarksTable)
        .innerJoin(recipesTable, eq(bookmarksTable.recipeId, recipesTable.id))
        .where(eq(bookmarksTable.userId, userId))

      const transformedRecipes = []

      for (const { recipe } of data) {
        const transformedRecipe = transformDbRecord(recipe)
        transformedRecipes.push(transformedRecipe)
      }

      return { recipes: transformedRecipes ?? [], userId: userId }
    } catch (error) {
      console.error(error)
      return { recipes: [] }
    }
  },
)

export const Route = createFileRoute('/(app)/recipes/saved/')({
  component: SavedRecipesPage,
  loader: () => bookmarkedRecipesByUserId(),
  beforeLoad: () => authStateFn(),
})

function SavedRecipesPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const categories = ['All', 'Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Snack']

  const { recipes: initialData, userId } = Route.useLoaderData()

  const { data: recipes, refetch: refetchBookmarks } = useQuery({
    queryKey: ['bookmarked-recipes'],
    initialData: initialData,
    queryFn: async () => {
      const { recipes } = await bookmarkedRecipesByUserId()
      return recipes
    },
  })

  const bookmarks = recipes?.map((recipe) => ({
    recipeId: recipe.id,
    userId: userId ?? '',
    id: 0,
  }))

  const filteredRecipes = recipes.filter((recipe) => {
    const titleMatch = recipe.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const categoryMatch =
      activeTab.toLowerCase() === 'all' ||
      recipe.category.toLowerCase() === activeTab.toLowerCase()
    return titleMatch && categoryMatch
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  }

  return (
    <SidebarProvider>
      <Header />
      <div className="relative flex min-h-screen flex-col top-16 w-full bg-gradient-to-b from-white to-neutral-100 dark:bg-gradient-to-b dark:from-neutral-800/50 dark:to-neutral-900/50 dark:text-white">
        <div className="flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <SidebarNav />
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex-1 space-y-6 md:p-8 p-3 pt-6"
          >
            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight dark:text-white">
                  Saved Recipes
                </h2>
                <p className="text-muted-foreground dark:text-neutral-400">
                  {recipes?.length} recipes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Vegetarian</DropdownMenuItem>
                    <DropdownMenuItem>Gluten-free</DropdownMenuItem>
                    <DropdownMenuItem>Low-carb</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SortAsc className="mr-2 h-4 w-4" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Newest</DropdownMenuItem>
                    <DropdownMenuItem>Oldest</DropdownMenuItem>
                    <DropdownMenuItem>A-Z</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search recipes..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="flex w-full overflow-x-auto">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.toLowerCase()}
                      value={category.toLowerCase()}
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </motion.div>

            <motion.div
              variants={containerVariants}
              className="flex flex-col gap-y-4 sm:grid sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full"
            >
              {filteredRecipes.length === 0 && (
                <motion.div
                  variants={itemVariants}
                  className="col-span-full text-center text-muted-foreground dark:text-neutral-400"
                >
                  Looks like you haven't saved any recipes yet.
                </motion.div>
              )}

              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  refetchBookmarks={refetchBookmarks}
                  bookmarks={bookmarks ?? []}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </SidebarProvider>
  )
}
