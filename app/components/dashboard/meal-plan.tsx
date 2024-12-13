import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MealPlanDay {
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

interface MealPlanProps {
  meals: MealPlanDay[];
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

export default function MealPlan({ meals }: MealPlanProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">
          Upcoming Meal Prep
        </CardTitle>
        <Link to={`/generate/plan`}>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Plan Week
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {meals.map((day) => (
            <Link to={`/recipes/$id`} params={{ id: day.recipeId.toString() }}>
              <motion.div
                key={day.id}
                variants={itemVariants}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{day.recipeTitle}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {day.recipeDescription}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
          {meals.length === 0 && (
            <div className="flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                You have no plans for this week
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
