import * as React from 'react';
import { Suspense, lazy, useState } from 'react';

import { getAuth } from '@clerk/tanstack-start/server';
import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { eq } from 'drizzle-orm';
import { motion } from 'framer-motion';
import { getWebRequest } from 'vinxi/http';

import RecipeNavigation from '@/components/recipe-navigation';
import RecipeOptionsContent from '@/components/recipe-options';
import { RecipeDetails } from '@/components/recipe/RecipeDetails';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { db } from '@/db/db';
import { recipesTable } from '@/db/schema';
import { transformDbRecord } from '@/schemas/recipe';

const LazyRecipeOptions = lazy(() =>
  Promise.resolve({ default: RecipeOptionsContent }),
);

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

      if (userId !== transformedRecipe.userId && !transformedRecipe.isPublic) {
        throw redirect({
          to: '/recipes/public',
        });
      }

      return {
        recipe: transformedRecipe,
        isOwned: userId === transformedRecipe.userId,
      };
    } catch (error) {
      // Add better error handling for database errors
      if (error instanceof Error) {
        throw new Error(`Failed to fetch recipe: ${error.message}`);
      }
      throw error;
    }
  });

export const Route = createFileRoute('/(app)/recipes/$id/')({
  component: RecipePage,
  loader: async ({ params }) => {
    try {
      return await recipeById({ data: params.id });
    } catch (error) {
      // Handle or rethrow error as needed
      console.error('Failed to load recipe:', error);
      throw error;
    }
  },
});

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

function RecipePage() {
  const [activeTab, setActiveTab] = useState('ingredients');
  const { recipe: recipeData, isOwned } = Route.useLoaderData();

  return (
    <>
      <RecipeNavigation title={recipeData.title} isOwned={isOwned} />
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
        <Suspense fallback={<div>Loading...</div>}>
          <LazyRecipeOptions
            id={recipeData.id}
            isPublic={recipeData.isPublic}
            isOwned={isOwned}
          />
        </Suspense>
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
          <RecipeDetails recipe={recipeData} />
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
          <Suspense fallback={<div>Loading...</div>}>
            <LazyRecipeOptions
              id={recipeData.id}
              isPublic={recipeData.isPublic}
              isOwned={isOwned}
            />
          </Suspense>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
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
    </>
  );
}
