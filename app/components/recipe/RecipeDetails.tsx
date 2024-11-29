import { motion } from 'framer-motion';
import { ChefHat, Clock, Users } from 'lucide-react';
import { memo } from 'react';

import type { Recipe } from '@/schemas/recipe';

interface RecipeDetailsProps {
  recipe: Recipe;
}

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
      transition={{ delay: 0.9, duration: 0.5 }}
      className="flex flex-col justify-between mt-4"
    >
      <div className="flex flex-row gap-4">
        {details.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
            className="flex items-center gap-2 bg-black rounded-lg p-3 w-full max-w-xs"
          >
            <item.icon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-2xl font-bold">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});
