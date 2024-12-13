import { createClerkClient } from '@clerk/backend';
import { getAuth } from '@clerk/tanstack-start/server';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { desc, eq } from 'drizzle-orm';
import { getWebRequest } from 'vinxi/http';

import { db } from '@/db/db';
import {
  bookmarksTable,
  cookedRecipesTable,
  eventsTable,
  recipesTable,
} from '@/db/schema';

const getDashboardData = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await getAuth(getWebRequest());

  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  if (!userId) {
    throw redirect({
      to: '/',
    });
  }

  const user = userId
    ? ((await clerkClient.users.getUser(userId)) as unknown as {
        id: string;
        passwordEnabled: boolean;
        totpEnabled: boolean;
        backupCodeEnabled: boolean;
        twoFactorEnabled: boolean;
        banned: boolean;
        publicMetadata: { [key: string]: {} };
        firstName: string | null;
        fullName: string | null;
      } | null)
    : null;

  const cookedRecipes = await db
    .select({
      id: cookedRecipesTable.id,
      createdAt: cookedRecipesTable.createdAt,
      recipeId: cookedRecipesTable.recipeId,
      title: recipesTable.title,
      image: recipesTable.image,
      description: recipesTable.description,
    })
    .from(cookedRecipesTable)
    .innerJoin(recipesTable, eq(cookedRecipesTable.recipeId, recipesTable.id))
    .where(eq(cookedRecipesTable.userId, userId))
    .orderBy(desc(cookedRecipesTable.createdAt));

  const savedRecipes = await db
    .select({
      id: bookmarksTable.id,
      createdAt: bookmarksTable.createdAt,
      recipeId: bookmarksTable.recipeId,
      title: recipesTable.title,
      image: recipesTable.image,
      description: recipesTable.description,
    })
    .from(bookmarksTable)
    .innerJoin(recipesTable, eq(bookmarksTable.recipeId, recipesTable.id))
    .where(eq(bookmarksTable.userId, userId));

  const eventsData = await db
    .select({
      id: eventsTable.id,
      date: eventsTable.date,
      mealType: eventsTable.mealType,
      userId: eventsTable.userId,
      recipeId: eventsTable.recipeId,
      recipeTitle: recipesTable.title,
      recipeImage: recipesTable.image,
      recipeDescription: recipesTable.description,
      recipeTime: recipesTable.totalTime,
      recipeDifficulty: recipesTable.difficulty,
    })
    .from(eventsTable)
    .leftJoin(recipesTable, eq(eventsTable.recipeId, recipesTable.id))
    .where(eq(eventsTable.userId, userId))
    .limit(3);

  const today = new Date();
  const lastWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay() - 7,
  );
  const thisWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay() - 1,
  );

  const recipesCookedLastWeek = cookedRecipes.filter((recipe) => {
    const recipeDate = new Date(recipe.createdAt);
    return recipeDate >= lastWeek && recipeDate < thisWeek;
  }).length;
  const recipesCookedThisWeek = cookedRecipes.filter((recipe) => {
    const recipeDate = new Date(recipe.createdAt);
    return recipeDate >= thisWeek;
  }).length;
  const recipesCookedSinceLastWeek =
    recipesCookedThisWeek - recipesCookedLastWeek;

  const savesThisWeek = savedRecipes.filter((recipe) => {
    const recipeDate = new Date(recipe.createdAt);
    return recipeDate >= thisWeek;
  }).length;

  const streakDays = (() => {
    if (cookedRecipes.length === 0) return 0;

    // Sort recipes by date, newest first
    const sortedRecipes = [...cookedRecipes].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    let currentStreak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if the most recent recipe is from today or yesterday to continue the streak
    const mostRecentDate = new Date(sortedRecipes[0].createdAt);
    mostRecentDate.setHours(0, 0, 0, 0);
    const daysSinceLastRecipe = Math.floor(
      (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // If the last recipe is older than yesterday, streak is broken
    if (daysSinceLastRecipe > 1) return 0;

    // Calculate streak by checking consecutive days
    for (let i = 1; i < sortedRecipes.length; i++) {
      const currentDate = new Date(sortedRecipes[i].createdAt);
      const prevDate = new Date(sortedRecipes[i - 1].createdAt);
      currentDate.setHours(0, 0, 0, 0);
      prevDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1 || diffDays === 0) {
        if (diffDays === 1) currentStreak++;
      } else {
        break;
      }
    }

    return currentStreak;
  })();

  const timeSaved = cookedRecipes.length * 0.15;

  const stats = {
    recipesCooked: cookedRecipes.length,
    recipesLastWeek: recipesCookedSinceLastWeek,
    savedRecipes: savedRecipes.length,
    newSaves: savesThisWeek,
    streakDays: streakDays,
    timeSaved: timeSaved,
  };

  const generateRecentActivity = (
    cookedRecipesFromDb: typeof cookedRecipes,
    savedRecipesFromDb: typeof savedRecipes,
  ) => {
    // Get 3 most recent cooked recipes (already sorted by date)
    const cookedActivities = cookedRecipesFromDb.slice(0, 3).map((recipe) => ({
      id: recipe.id.toString(),
      recipeId: recipe.recipeId,
      type: 'cooked' as const,
      title: recipe.title,
      image: recipe.image,
      description: recipe.description,
    }));

    // Filter out saved recipes that are already in cooked
    const cookedRecipeIds = new Set(
      cookedActivities.map((recipe) => recipe.recipeId),
    );
    const uniqueSavedRecipes = savedRecipesFromDb
      .filter((recipe) => !cookedRecipeIds.has(recipe.recipeId))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    // Get 3 most recent saved recipes, if we don't have enough unique saves,
    // get more from the original saved recipes list
    let savedActivities = uniqueSavedRecipes.slice(0, 3);

    // If we have fewer than 3 unique saved recipes, add more from the original list
    if (savedActivities.length < 3) {
      const remainingNeeded = 3 - savedActivities.length;
      const additionalSaves = savedRecipesFromDb
        .filter(
          (recipe) => !savedActivities.some((saved) => saved.id === recipe.id),
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, remainingNeeded);

      savedActivities = [...savedActivities, ...additionalSaves];
    }

    // Map the saved activities to the correct format
    const formattedSavedActivities = savedActivities.map((recipe) => ({
      id: recipe.id.toString(),
      recipeId: recipe.recipeId,
      type: 'saved' as const,
      title: recipe.title,
      image: recipe.image,
      description: recipe.description,
    }));

    const recentActivity = [...cookedActivities, ...formattedSavedActivities];
    return recentActivity;
  };

  return {
    user,
    stats,
    recentActivity: generateRecentActivity(cookedRecipes, savedRecipes),
    events: eventsData,
  };
});

export default getDashboardData;