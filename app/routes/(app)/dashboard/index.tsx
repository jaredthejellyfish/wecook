import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';

import authStateFn from '@/server-fns/auth-redirect';

export const Route = createFileRoute('/(app)/dashboard/')({
  component: DashboardPage,
  beforeLoad: () => authStateFn(),
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

function DashboardPage() {
  return (
    <>
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight dark:text-white">
            Welcome back!
          </h2>
          <p className="text-muted-foreground dark:text-neutral-400">
            Here's an overview of your cooking activity
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          variants={itemVariants}
          className="rounded-lg border bg-card p-6 dark:bg-neutral-800"
        >
          <div className="text-sm font-medium text-muted-foreground dark:text-neutral-400">
            Recipes Cooked
          </div>
          <div className="mt-2 text-2xl font-bold">24</div>
          <div className="text-xs text-muted-foreground dark:text-neutral-500">
            +2 from last week
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-lg border bg-card p-6 dark:bg-neutral-800"
        >
          <div className="text-sm font-medium text-muted-foreground dark:text-neutral-400">
            Saved Recipes
          </div>
          <div className="mt-2 text-2xl font-bold">47</div>
          <div className="text-xs text-muted-foreground dark:text-neutral-500">
            +5 new saves
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-lg border bg-card p-6 dark:bg-neutral-800"
        >
          <div className="text-sm font-medium text-muted-foreground dark:text-neutral-400">
            Cooking Streak
          </div>
          <div className="mt-2 text-2xl font-bold">5 days</div>
          <div className="text-xs text-muted-foreground dark:text-neutral-500">
            Keep it up!
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-lg border bg-card p-6 dark:bg-neutral-800"
        >
          <div className="text-sm font-medium text-muted-foreground dark:text-neutral-400">
            Time Saved
          </div>
          <div className="mt-2 text-2xl font-bold">3.5 hrs</div>
          <div className="text-xs text-muted-foreground dark:text-neutral-500">
            This week
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={itemVariants}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
      >
        <div className="col-span-4 rounded-lg border bg-card p-6 dark:bg-neutral-800">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-700" />
              <div className="ml-4">
                <p className="text-sm font-medium">
                  Cooked Spaghetti Carbonara
                </p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-700" />
              <div className="ml-4">
                <p className="text-sm font-medium">
                  Saved Chicken Tikka Masala
                </p>
                <p className="text-sm text-muted-foreground">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-700" />
              <div className="ml-4">
                <p className="text-sm font-medium">Cooked Greek Salad</p>
                <p className="text-sm text-muted-foreground">Yesterday</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 rounded-lg border bg-card p-6 dark:bg-neutral-800">
          <h3 className="font-semibold mb-4">Upcoming Meal Prep</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Monday</p>
              <p className="text-sm text-muted-foreground">Grilled Chicken</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Tuesday</p>
              <p className="text-sm text-muted-foreground">Quinoa Bowl</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Wednesday</p>
              <p className="text-sm text-muted-foreground">Fish Tacos</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
