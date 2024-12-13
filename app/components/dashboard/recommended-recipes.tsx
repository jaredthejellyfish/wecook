import { motion } from 'framer-motion';
import { Heart, Timer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useBookmarks } from '@/hooks/useBookmarks';

interface Recipe {
  id: number;
  date: string;
  mealType: string;
  userId: string;
  recipeId: number;
  recipeTitle: string | null;
  recipeImage: string | null;
  recipeDescription: string | null;
  recipeTime: number | null;
  recipeDifficulty: string | null;
}

interface RecommendedRecipesProps {
  recipes: Recipe[];
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

export default function RecommendedRecipes({
  recipes,
}: RecommendedRecipesProps) {
  const { data: bookmarks } = useBookmarks();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Recommended Recipes
        </CardTitle>
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
                <h4 className="font-medium">{recipe.recipeTitle}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className={
                    bookmarks?.find(
                      (bookmark) => bookmark.id === recipe.recipeId,
                    )
                      ? 'text-red-500'
                      : ''
                  }
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Timer className="mr-1 h-4 w-4" />
                  {recipe.recipeTime}
                </div>
                <div>{recipe.recipeDifficulty}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
