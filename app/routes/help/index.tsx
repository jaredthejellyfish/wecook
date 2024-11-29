import { getAuth } from '@clerk/tanstack-start/server';
import { Link, createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { eq } from 'drizzle-orm';
import { motion } from 'framer-motion';
import { getWebRequest } from 'vinxi/http';

import Header from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import { SidebarProvider } from '@/components/ui/sidebar';

import authStateFn from '@/reusable-fns/auth-redirect';

import { db } from '@/db/db';
import { recipesTable } from '@/db/schema';
import { transformDbRecord } from '@/schemas/recipe';

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

export const Route = createFileRoute('/help/')({
  component: DashboardPage,
  loader: () => recipesByUserId(),
  beforeLoad: () => authStateFn(),
});

export default function DashboardPage() {
  const { recipes } = Route.useLoaderData();

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
          ></motion.div>
        </div>
      </div>
    </SidebarProvider>
  );
}
