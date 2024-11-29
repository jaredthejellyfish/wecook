import { motion } from "framer-motion";
import { createFileRoute } from "@tanstack/react-router";
import { SidebarNav } from "@/components/sidebar-nav";
import { SidebarProvider } from "@/components/ui/sidebar";

import Header from "@/components/header";

import authStateFn from "@/reusable-fns/auth-redirect";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
  beforeLoad: () => authStateFn(),
});

export default function DashboardPage() {
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
        type: "spring",
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
            className="flex-1 space-y-6 p-8 pt-6"
          >

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

            <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4 rounded-lg border bg-card p-6 dark:bg-neutral-800">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-700" />
                    <div className="ml-4">
                      <p className="text-sm font-medium">Cooked Spaghetti Carbonara</p>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-700" />
                    <div className="ml-4">
                      <p className="text-sm font-medium">Saved Chicken Tikka Masala</p>
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
          </motion.div>
        </div>
      </div>
    </SidebarProvider>
  );
}
