import React, { Suspense, lazy, useState } from 'react';

import { getAuth } from '@clerk/tanstack-start/server';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { eq } from 'drizzle-orm';
import { Filter, Search, SortAsc } from 'lucide-react';
import { getWebRequest } from 'vinxi/http';

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
import { recipesTable } from '@/db/schema';
import { transformDbRecord } from '@/schemas/recipe';
import authStateFn from '@/server-fns/auth-redirect';
import { Skeleton } from '@/components/ui/skeleton';

const PaginatedRecipes = lazy(() => import('@/components/paginated-recipes'));

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
    .where(eq(recipesTable.userId, userId));

  const transformedRecipes = [];

  for (const recipe of data) {
    const transformedRecipe = transformDbRecord(recipe);
    transformedRecipes.push(transformedRecipe);
  }

  return { recipes: transformedRecipes };
});

export const Route = createFileRoute('/(app)/recipes/')({
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

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight dark:text-white">
            All Recipes
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
      </div>

      <div className="space-y-4">
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
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full"/>}>
        <PaginatedRecipes
          filteredRecipes={filteredRecipes}
          activeTab={activeTab}
          searchTerm={searchTerm}
        />
      </Suspense>
    </>
  );
}
