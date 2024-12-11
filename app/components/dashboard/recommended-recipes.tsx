import { motion } from 'framer-motion';
import { Heart, Star, Timer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Recipe {
  id: string;
  title: string;
  time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  saved?: boolean;
}

interface RecommendedRecipesProps {
  recipes: Recipe[];
  onSave: (id: string) => void;
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

export default function RecommendedRecipes({ recipes, onSave }: RecommendedRecipesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recommended Recipes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {recipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              variants={itemVariants}
              className="flex flex-col gap-2 rounded-lg border p-4"
            >
              <div className="flex justify-between">
                <h4 className="font-medium">{recipe.title}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSave(recipe.id)}
                  className={recipe.saved ? 'text-red-500' : ''}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Timer className="mr-1 h-4 w-4" />
                  {recipe.time}
                </div>
                <div>{recipe.difficulty}</div>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 fill-current text-yellow-400" />
                  {recipe.rating}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 