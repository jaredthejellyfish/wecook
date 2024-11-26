import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";
import { Clock, Users, ChefHat, Bookmark, Printer, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/header";
import { SidebarNav } from "@/components/sidebar-nav";
import { SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/recipe/$id/")({
  component: RecipePage,
  loader: async ({ context, params }) => {
    console.log(params);
  },
});


// This would typically come from your API or database
const recipeData = {
  title: "Savory Chickpea Flour Pancakes with Spinach and Feta",
  description:
    "These high-protein savory pancakes made with chickpea flour are packed with nutrients and flavor, featuring fresh spinach and crumbled feta cheese. Perfect for a nutritious breakfast that will keep you energized all morning!",
  category: "Breakfast",
  cuisine: "Mediterranean",
  difficulty: "Easy",
  servings: 4,
  prepTime: 15,
  cookTime: 15,
  totalTime: 30,
  ingredients: [
    {
      name: "chickpea flour",
      amount: 1,
      unit: "cup",
      notes:
        "Also known as besan or gram flour, it's high in protein and fiber.",
      isOptional: false,
      category: "dry",
    },
    // ... other ingredients
  ],
  instructions: [
    {
      stepNumber: 1,
      instruction:
        "In a mixing bowl, combine chickpea flour, baking powder, salt, black pepper, cumin, and red pepper flakes (if using).",
      timingInMinutes: 5,
    },
    // ... other instructions
  ],
  equipment: [
    {
      name: "Mixing bowl",
      isRequired: true,
      notes: "For combining ingredients.",
    },
    // ... other equipment
  ],
  tags: [
    "vegetarian",
    "high-protein",
    "healthy",
    "breakfast",
    "savory",
    "easy",
  ],
  notes: [
    {
      note: "These pancakes are great for meal prep and can be stored in the refrigerator for up to 3 days.",
      category: "storage",
    },
    // ... other notes
  ],
  image:
    "https://oaidalleapiprodscus.blob.core.windows.net/private/org-K8Rl9zLM91CTxZweuFPBCCoj/user-XHreexzkxt83p5HhmxOoU7TD/img-npEtJwnsnCI926fkeqWxq0x9.png?st=2024-11-25T14%3A09%3A20Z&se=2024-11-25T16%3A09%3A20Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-11-25T00%3A22%3A05Z&ske=2024-11-26T00%3A22%3A05Z&sks=b&skv=2024-08-04&sig=3vad8fet8me0Zs9mb1a1iEv0VaHfAVkrOpnvbafOSmc%3D",
};

export default function RecipePage() {
  const [activeTab, setActiveTab] = useState("ingredients");

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
                <h1 className="text-3xl font-bold tracking-tight dark:text-white">
                  {recipeData.title}
                </h1>
                <p className="text-muted-foreground dark:text-neutral-400">
                  {recipeData.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid gap-6 md:grid-cols-2"
            >
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={recipeData.image}
                  alt={recipeData.title}
                  width={800}
                  height={450}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Total Time</p>
                      <p className="text-2xl font-bold">
                        {recipeData.totalTime} mins
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Servings</p>
                      <p className="text-2xl font-bold">
                        {recipeData.servings}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Difficulty</p>
                      <p className="text-2xl font-bold">
                        {recipeData.difficulty}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {recipeData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>

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
                          {ingredient.amount} {ingredient.unit}{" "}
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
                  {recipeData.notes.map((note, index) => (
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
