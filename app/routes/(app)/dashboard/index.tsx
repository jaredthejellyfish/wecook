import { Suspense, lazy } from 'react';

import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';

import { Skeleton } from '@/components/ui/skeleton';

import authStateFn from '@/server-fns/auth-redirect';
import getDashboardData from '@/server-fns/dashboard-data';

// Lazy load components
const StatsCards = lazy(() => import('@/components/dashboard/stats-cards'));
const RecentActivity = lazy(
  () => import('@/components/dashboard/recent-activity'),
);
const RecommendedRecipes = lazy(
  () => import('@/components/dashboard/recommended-recipes'),
);
const MealPlan = lazy(() => import('@/components/dashboard/meal-plan'));

export const Route = createFileRoute('/(app)/dashboard/')({
  component: DashboardPage,
  beforeLoad: () => authStateFn(),
  loader: () => getDashboardData(),
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

function DashboardPage() {
  const {
    user: authData,
    stats,
    recentActivity,
    events,
  } = Route.useLoaderData();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight dark:text-white">
            Welcome back, {authData?.firstName ?? 'Chef'}! 👋
          </h2>
          <p className="text-muted-foreground dark:text-neutral-400">
            Your weekly cooking progress is looking great
          </p>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
        <StatsCards stats={stats} />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity & Recommendations */}
        <motion.div variants={itemVariants} className="md:col-span-4 space-y-4">
          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <RecentActivity activities={recentActivity} />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <RecommendedRecipes recipes={events} />
          </Suspense>
        </motion.div>

        {/* Meal Plan & Achievements */}
        <motion.div variants={itemVariants} className="md:col-span-3 space-y-4">
          <Suspense fallback={<Skeleton className="h-[250px] w-full" />}>
            <MealPlan meals={events} />
          </Suspense>
        </motion.div>
      </div>
    </motion.div>
  );
}
