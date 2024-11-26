import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Bookmark, Search, SortAsc, Filter } from "lucide-react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { SidebarNav } from "@/components/sidebar-nav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/header";

import authStateFn from "@/reusable-fns/auth-redirect";
import { createServerFn } from "@tanstack/start";
import { getAuth } from "@clerk/tanstack-start/server";
import { getWebRequest } from "vinxi/http";
import { db } from "@/db/db";
import { recipesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { transformDbRecord } from "@/schemas/recipe";

const recipesByUserId = createServerFn({ method: "GET" }).handler(async () => {
  const { userId } = await getAuth(getWebRequest());

  if (!userId) {
    // This will error because you're redirecting to a path that doesn't exist yet
    // You can create a sign-in route to handle this
    throw redirect({
      to: "/",
    });
  }

  const data = await db
    .select()
    .from(recipesTable)
    .where(eq(recipesTable.userId, userId));

  for (const recipe of data) {
    const transformedRecipe = transformDbRecord(recipe);
    console.log(transformedRecipe);
  }

  return { recipes: data };
});

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
  loader: () => recipesByUserId(),
  beforeLoad: () => authStateFn(),
});

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const categories = [
    "All",
    "Breakfasts",
    "Lunches",
    "Desserts",
    "Dinner",
    "Sides",
    "Snacks",
    "Soups",
    "Vegan",
  ];

  const { recipes } = Route.useLoaderData();

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  Saved Recipes
                </h2>
                <p className="text-muted-foreground dark:text-neutral-400">
                  8 recipes
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
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
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

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
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
            </motion.div>

            <motion.div
              variants={containerVariants}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredRecipes.length === 0 && (
                <motion.div
                  variants={itemVariants}
                  className="col-span-full text-center text-muted-foreground dark:text-neutral-400"
                >
                  No recipes found
                </motion.div>
              )}
              {filteredRecipes.map((recipe) => (
                <Link to={`/recipe/${recipe.id}`} key={recipe.id}>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                    transition={{ delay: 0.5 }}
                    className="group relative overflow-hidden rounded-lg border bg-white dark:bg-neutral-800 shadow-md transition-all hover:shadow-lg"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="object-cover w-full h-full transition-transform border-transparent group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-sm text-muted-foreground dark:text-neutral-400">
                          <Clock className="mr-1 h-4 w-4" />
                          {recipe.totalTime} mins
                        </div>
                        <div className="text-sm text-muted-foreground dark:text-neutral-400">
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
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </SidebarProvider>
  );
}
