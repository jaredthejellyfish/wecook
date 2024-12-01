import { useState } from 'react';

import { getAuth } from '@clerk/tanstack-start/server';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { eq } from 'drizzle-orm';
import { motion } from "motion/react";
import { Filter, Search, SortAsc } from 'lucide-react';
import { getWebRequest } from 'vinxi/http';

import RecipeCard from '@/components/recipe-card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { db } from '@/db/db';
import { type SelectBookmark, recipesTable } from '@/db/schema';
import { transformDbRecord } from '@/schemas/recipe';
import authStateFn from '@/server-fns/auth-redirect';

const recipesByUserId = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await getAuth(getWebRequest());

  if (!userId) {
    // This will error because you're redirecting to a path that doesn't exist yet
    // You can create a sign-in route to handle this
    throw redirect({
      to: '/',
    });
  }

  const data = await db
    .select()
    .from(recipesTable)
    .where(eq(recipesTable.isPublic, true));

  const transformedRecipes = [];

  for (const recipe of data) {
    const transformedRecipe = transformDbRecord(recipe);
    transformedRecipes.push(transformedRecipe);
  }

  return { recipes: transformedRecipes };
});

export const Route = createFileRoute('/(app)/recipes/public/')({
  component: RecipesPage,
  beforeLoad: () => authStateFn(),
  loader: () => recipesByUserId(),
});

function RecipesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Snack'];

  const { recipes } = Route.useLoaderData();

  const filteredRecipes = recipes.filter((recipe) => {
    const titleMatch = recipe.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const categoryMatch =
      activeTab.toLowerCase() === 'all' ||
      recipe.category.toLowerCase() === activeTab.toLowerCase();
    return titleMatch && categoryMatch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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
  };

  const { data: bookmarks, refetch: refetchBookmarks } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const res = await fetch('/api/bookmarks');
      const data = (await res.json()) as { bookmarks: SelectBookmark[] };
      return data.bookmarks ?? [];
    },
  });

  return (
    <>
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight dark:text-white">
            Public Recipes
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            No recipes found
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
    </>
  );
}
