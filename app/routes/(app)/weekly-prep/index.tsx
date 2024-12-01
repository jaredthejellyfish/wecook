import { lazy, useState } from 'react';

import { getAuth } from '@clerk/tanstack-start/server';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import { addMonths, format, subMonths } from 'date-fns';
import { eq } from 'drizzle-orm';
import { motion } from 'framer-motion';
import { getWebRequest } from 'vinxi/http';

import Header from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import { SidebarProvider } from '@/components/ui/sidebar';

import authStateFn from '@/server-fns/auth-redirect';

import { db } from '@/db/db';
import { eventsTable, recipesTable } from '@/db/schema';

const LazyCalendar = lazy(() => import('@/components/Calendar/index'));

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
  loader: () => eventsWithRecipesByUserId(),
  beforeLoad: () => authStateFn(),
});

function WeeklyPrepPage() {
  const { events } = Route.useLoaderData();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
          >
            <LazyCalendar />
          </motion.div>
        </div>
      </div>
    </SidebarProvider>
  );
}
