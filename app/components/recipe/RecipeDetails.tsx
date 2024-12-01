import { memo } from 'react';

import { motion } from "motion/react";
import { ChefHat, Clock, Users } from 'lucide-react';

import type { Recipe } from '@/schemas/recipe';
import { cn } from '@/lib/utils';

interface RecipeDetailsProps {
  recipe: Recipe;
}

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

export const RecipeDetails = memo(function RecipeDetails({
  recipe,
}: RecipeDetailsProps) {
  const details = [
    {
      icon: Clock,
      title: 'Total Time',
      value: `${recipe.totalTime} mins`,
    },
    {
      icon: Users,
      title: 'Servings',
      value: recipe.servings,
    },
    {
      icon: ChefHat,
      title: 'Difficulty',
      value: recipe.difficulty,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="w-full mt-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {details.map((item, index) => (
          <motion.div
            key={item.title}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 * index }}
            className={cn(
              'bg-white dark:bg-neutral-800 shadow-md rounded-lg p-4',
              'transform transition-all hover:scale-105 hover:shadow-lg',
            )}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {item.title}
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {item.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});
