import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Bookmark, Sun, Moon } from 'lucide-react';
import { createFileRoute } from "@tanstack/react-router";
import { SidebarNav } from "@/components/sidebar-nav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/header";

import authStateFn from "@/reusable-fns/auth-redirect";

interface Recipe {
  id: string;
  title: string;
  category: string;
  time: string;
  image: string;
}

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
  beforeLoad: () => authStateFn(),
});

export default function DashboardPage() {

  const recipes: Recipe[] = [
    {
      id: "1",
      title: "Salad Caprese Pasta Spaghetti",
      category: "Fresh Salad",
      time: "30 mins",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: "2",
      title: "Tuscan Panzanella Cherry",
      category: "Fresh Salad",
      time: "30 mins",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: "3",
      title: "Ketogenic Diet Dinner with Eggs",
      category: "Sashimi Special",
      time: "20 mins",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: "4",
      title: "Potato Gnocchi Traditional Homemade",
      category: "Fresh Salad",
      time: "15 mins",
      image: "/placeholder.svg?height=400&width=600",
    },
  ];

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
      <div className="relative flex min-h-screen flex-col top-16 w-full bg-gradient-to-tr from-neutral-200/20 to-zinc-50/20 dark:from-gray-800/20 dark:to-gray-900/20 dark:text-white">
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
                  Saved Recipes
                </h2>
                <p className="text-muted-foreground dark:text-gray-400">8 recipes</p>
              </div>
              <div className="flex items-center gap-2">
                <Button>Filters</Button>
                <Button>Sort</Button>
                <Button variant="default">Share</Button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="flex w-full overflow-x-auto">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    All Recipes
                  </TabsTrigger>
                  <TabsTrigger value="breakfasts">Breakfasts</TabsTrigger>
                  <TabsTrigger value="lunches">Lunches</TabsTrigger>
                  <TabsTrigger value="desserts">Desserts</TabsTrigger>
                  <TabsTrigger value="dinner">Dinner</TabsTrigger>
                  <TabsTrigger value="sides">Sides</TabsTrigger>
                  <TabsTrigger value="snacks">Snacks</TabsTrigger>
                  <TabsTrigger value="soups">Soups</TabsTrigger>
                  <TabsTrigger value="vegan">Vegan</TabsTrigger>
                </TabsList>
              </Tabs>
            </motion.div>

            <motion.div
              variants={containerVariants}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {recipes.map((recipe) => (
                <motion.div
                  key={recipe.id}
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-lg border bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-sm text-muted-foreground dark:text-gray-400">
                        <Clock className="mr-1 h-4 w-4" />
                        {recipe.time}
                      </div>
                      <div className="text-sm text-muted-foreground dark:text-gray-400">
                        {recipe.category}
                      </div>
                    </div>
                    <h3 className="mt-2 font-semibold leading-none tracking-tight dark:text-white">
                      {recipe.title}
                    </h3>
                  </div>
                  <Button
                    className="absolute right-4 top-4 h-8 w-8 rounded-full"
                    size="icon"
                    variant="secondary"
                  >
                    <Bookmark className="h-4 w-4" />
                    <span className="sr-only">Bookmark recipe</span>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </SidebarProvider>
  );
}

