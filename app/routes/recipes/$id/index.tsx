import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';

import { getAuth } from '@clerk/tanstack-start/server';
import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { eq } from 'drizzle-orm';
import { motion } from 'framer-motion';
import { Bookmark, ChefHat, Clock, Printer, Share2, Users } from 'lucide-react';
import { getWebRequest } from 'vinxi/http';

import Header from '@/components/header';
import { RecipeDetails } from '@/components/recipe/RecipeDetails';
import { SidebarNav } from '@/components/sidebar-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { db } from '@/db/db';
import { recipesTable } from '@/db/schema';
import { useBookmarkRecipe } from '@/hooks/useBookmarkRecipe';
import { useBookmarks } from '@/hooks/useBookmarks';
import { cn } from '@/lib/utils';
import { transformDbRecord } from '@/schemas/recipe';

const recipeById = createServerFn({ method: 'GET' })
  .validator((id: string) => {
    if (!id || id.trim() === '') {
      throw new Error('Valid recipe ID is required');
    }
    return id;
  })
  .handler(async (ctx) => {
    const { userId } = await getAuth(getWebRequest());

    if (!userId) {
      throw redirect({
        to: '/',
      });
    }

    const id = ctx.data;

    try {
      const data = await db
        .select()
        .from(recipesTable)
        .where(eq(recipesTable.id, Number(id)))
        .limit(1);

      if (!data.length) {
        throw notFound();
      }

      const recipe = data[0];
      const transformedRecipe = transformDbRecord(recipe);

      return { recipe: transformedRecipe };
    } catch (error) {
      // Add better error handling for database errors
      if (error instanceof Error) {
        throw new Error(`Failed to fetch recipe: ${error.message}`);
      }
      throw error;
    }
  });

export const Route = createFileRoute('/recipes/$id/')({
  component: RecipePage,
  loader: async ({ context, params }) => {
    try {
      return await recipeById({ data: params.id });
    } catch (error) {
      // Handle or rethrow error as needed
      console.error('Failed to load recipe:', error);
      throw error;
    }
  },
});

function RecipePage() {
  const [activeTab, setActiveTab] = useState('ingredients');
  const { recipe: recipeData } = Route.useLoaderData();
  const { data: bookmarks } = useBookmarks();
  const bookmarkMutation = useBookmarkRecipe();

  // Memoize animation variants
  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    }),
    [],
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          type: 'spring',
          stiffness: 100,
        },
      },
    }),
    [],
  );

  // Memoize bookmark handler
  const handleBookmark = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      await bookmarkMutation.mutateAsync({
        data: { recipe_id: recipeData.id },
      });
    },
    [bookmarkMutation, recipeData.id],
  );

  // Memoize bookmark status
  const isBookmarked = useMemo(
    () => bookmarks?.some((b) => b.recipeId === recipeData.id),
    [bookmarks, recipeData.id],
  );

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
            className="flex-1 space-y-6 p-8 pt-6"
          >
            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:hidden"
            >
              <div>
                <motion.h1
                  variants={itemVariants}
                  className="text-3xl font-bold tracking-tight dark:text-white"
                >
                  {recipeData.title}
                </motion.h1>
                <motion.p
                  variants={itemVariants}
                  className="text-muted-foreground dark:text-neutral-400"
                >
                  {recipeData.description}
                </motion.p>
              </div>
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBookmark}
                  disabled={bookmarkMutation.isPending}
                >
                  <Bookmark
                    className={cn('h-4 w-4', isBookmarked && 'fill-primary')}
                  />
                  {bookmarkMutation.isPending ? 'Saving...' : 'Bookmark'}
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid gap-6 md:grid-cols-2 md:hidden"
            >
              <motion.div
                variants={itemVariants}
                className="aspect-video overflow-hidden rounded-lg"
              >
                <motion.img
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src={recipeData.image}
                  alt={recipeData.title}
                  width={800}
                  height={450}
                  className="object-cover w-full h-full"
                />
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="flex flex-col justify-between"
              >
                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-2 gap-4"
                >
                  <motion.div
                    variants={itemVariants}
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Total Time</p>
                      <p className="text-2xl font-bold">
                        {recipeData.totalTime} mins
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    variants={itemVariants}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Servings</p>
                      <p className="text-2xl font-bold">
                        {recipeData.servings}
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    variants={itemVariants}
                    className="flex items-center gap-2"
                  >
                    <ChefHat className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Difficulty</p>
                      <p className="text-2xl font-bold">
                        {recipeData.difficulty}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  className="mt-4 flex flex-wrap gap-2"
                >
                  {recipeData.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>

            <div className="hidden md:block">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-t from-black/50 to-transparent rounded-lg overflow-hidden relative"
              >
                <motion.img
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src={recipeData.image}
                  alt={recipeData.title}
                  width={800}
                  height={300}
                  className="object-cover w-full h-full max-h-96"
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="absolute bottom-0 left-0 right-0 p-4 z-50"
                >
                  <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-3xl font-bold tracking-tight text-white"
                  >
                    {recipeData.title}
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mt-4 flex flex-wrap gap-2"
                  >
                    {recipeData.tags?.map((tag, index) => (
                      <motion.div
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                      >
                        <Badge variant="secondary">{tag}</Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex items-center gap-2 absolute top-4 right-4 z-50"
                >
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBookmark}
                      disabled={bookmarkMutation.isPending}
                    >
                      <Bookmark
                        className={cn(
                          'h-4 w-4',
                          isBookmarked && 'fill-primary',
                        )}
                      />
                      {bookmarkMutation.isPending ? 'Saving...' : 'Bookmark'}
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <Button variant="outline" size="sm">
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    <Button variant="outline" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </motion.div>
                </motion.div>

                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-md text-muted-foreground mt-4"
              >
                {recipeData.description}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-4 flex flex-wrap gap-2 md:hidden"
              >
                {recipeData.tags?.map((tag, index) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                  >
                    <Badge variant="secondary">{tag}</Badge>
                  </motion.div>
                ))}
              </motion.div>
              <RecipeDetails recipe={recipeData} />
            </div>

            <Separator className="my-6" />

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                <TabsTrigger value="notes" className="hidden lg:inline-flex">
                  Notes
                </TabsTrigger>
              </TabsList>
              <TabsContent value="ingredients" className="mt-6">
                <ul className="space-y-4">
                  {recipeData.ingredients.map((ingredient, index) => (
                    <motion.li
                      key={index}
                      variants={itemVariants}
                      className="flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">
                          {ingredient.amount} {ingredient.unit}{' '}
                          {ingredient.name}
                        </p>
                        {ingredient.notes && (
                          <p className="text-sm text-muted-foreground">
                            {ingredient.notes}
                          </p>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="instructions" className="mt-6">
                <ol className="space-y-4">
                  {recipeData.instructions.map((step, index) => (
                    <motion.li
                      key={index}
                      variants={itemVariants}
                      className="flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {step.stepNumber}
                      </div>
                      <div>
                        <p>{step.instruction}</p>
                        {step.timingInMinutes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Estimated time: {step.timingInMinutes} minutes
                          </p>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </TabsContent>
              <TabsContent value="notes" className="mt-6">
                <ul className="space-y-4">
                  {recipeData.notes?.map((note, index) => (
                    <motion.li
                      key={index}
                      variants={itemVariants}
                      className="flex items-start gap-4"
                    >
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
                      <div>
                        <p>{note.note}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Category: {note.category}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </SidebarProvider>
  );
}
