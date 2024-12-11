import { Suspense, lazy, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import authStateFn from '@/server-fns/auth-redirect';

// Lazy load components
const StatsCards = lazy(() => import('@/components/dashboard/stats-cards'));
const RecentActivity = lazy(() => import('@/components/dashboard/recent-activity'));
const RecommendedRecipes = lazy(() => import('@/components/dashboard/recommended-recipes'));
const MealPlan = lazy(() => import('@/components/dashboard/meal-plan'));
const Achievements = lazy(() => import('@/components/dashboard/achievements'));

export const Route = createFileRoute('/(app)/dashboard/')({
  component: DashboardPage,
  beforeLoad: () => authStateFn(),
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
  // Stats state
  const [stats] = useState({
    recipesCooked: 24,
    recipesLastWeek: 2,
    savedRecipes: 47,
    newSaves: 5,
    streakDays: 5,
    timeSaved: 3.5,
  });

  // Recent activity state
  const [activities, setActivities] = useState([
    {
      id: '1',
      type: 'cooked' as const,
      recipe: 'Spaghetti Carbonara',
      timestamp: '2 hours ago',
      liked: false,
      starred: false,
    },
    {
      id: '2',
      type: 'saved' as const,
      recipe: 'Chicken Tikka Masala',
      timestamp: '5 hours ago',
      liked: false,
      starred: false,
    },
    {
      id: '3',
      type: 'cooked' as const,
      recipe: 'Greek Salad',
      timestamp: 'Yesterday',
      liked: false,
      starred: false,
    },
  ]);

  // Recommended recipes state
  const [recipes, setRecipes] = useState([
    {
      id: '1',
      title: 'Thai Green Curry',
      time: '45 mins',
      difficulty: 'Medium' as const,
      rating: 4.8,
      saved: false,
    },
    {
      id: '2',
      title: 'Homemade Pizza',
      time: '60 mins',
      difficulty: 'Easy' as const,
      rating: 4.5,
      saved: false,
    },
  ]);

  // Meal plan state
  const [meals] = useState([
    { id: '1', day: 'Monday', meal: 'Grilled Chicken', time: '6:30 PM' },
    { id: '2', day: 'Tuesday', meal: 'Quinoa Bowl', time: '7:00 PM' },
    { id: '3', day: 'Wednesday', meal: 'Fish Tacos', time: '6:45 PM' },
  ]);

  // Achievements state
  const [achievements] = useState([
    {
      id: '1',
      title: 'Master Chef',
      description: 'Cook 50 different recipes',
      progress: 48,
      total: 50,
    },
    {
      id: '2',
      title: 'Health Enthusiast',
      description: 'Complete 20 healthy meals',
      progress: 15,
      total: 20,
    },
    {
      id: '3',
      title: 'Global Explorer',
      description: 'Try recipes from 10 cuisines',
      progress: 7,
      total: 10,
    },
  ]);

  // Activity handlers
  const handleLike = (id: string) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id
          ? { ...activity, liked: !activity.liked }
          : activity
      )
    );
  };

  const handleStar = (id: string) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id
          ? { ...activity, starred: !activity.starred }
          : activity
      )
    );
  };

  // Recipe handlers
  const handleSaveRecipe = (id: string) => {
    setRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === id ? { ...recipe, saved: !recipe.saved } : recipe
      )
    );
  };

  // Meal plan handlers
  const handlePlanWeek = () => {
    // TODO: Implement meal planning functionality
    console.log('Plan week clicked');
  };

  const handleAddMeal = (dayId: string) => {
    // TODO: Implement add meal functionality
    console.log('Add meal clicked for day:', dayId);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">
            Welcome back, Chef! 👋
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground dark:text-neutral-400">
            Your weekly cooking progress is looking great
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="w-full sm:w-auto" asChild>
            <Link to="/recipes" search={{ new: true }}>
              <Plus className="mr-2 h-4 w-4" />
              New Recipe
            </Link>
          </Button>
          <Button className="w-full sm:w-auto" variant="outline" asChild>
            <Link to="/recipes">View All Recipes</Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
        <StatsCards stats={stats} />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity & Recommendations */}
        <motion.div variants={itemVariants} className="min-w-0 md:col-span-4 space-y-4 sm:space-y-6">
          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <RecentActivity
              activities={activities}
              onLike={handleLike}
              onStar={handleStar}
            />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <RecommendedRecipes recipes={recipes} onSave={handleSaveRecipe} />
          </Suspense>
        </motion.div>

        {/* Meal Plan & Achievements */}
        <motion.div variants={itemVariants} className="min-w-0 md:col-span-3 space-y-4 sm:space-y-6">
          <Suspense fallback={<Skeleton className="h-[250px] w-full" />}>
            <MealPlan
              meals={meals}
              onPlanWeek={handlePlanWeek}
              onAddMeal={handleAddMeal}
            />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-[250px] w-full" />}>
            <Achievements achievements={achievements} />
          </Suspense>
        </motion.div>
      </div>
    </motion.div>
  );
}
