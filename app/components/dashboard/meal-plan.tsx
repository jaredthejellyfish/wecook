import { motion } from 'framer-motion';
import { Calendar, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MealPlanDay {
  id: string;
  day: string;
  meal: string;
  time: string;
}

interface MealPlanProps {
  meals: MealPlanDay[];
  onPlanWeek: () => void;
  onAddMeal: (dayId: string) => void;
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

export default function MealPlan({ meals, onPlanWeek, onAddMeal }: MealPlanProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Upcoming Meal Prep</CardTitle>
        <Button variant="outline" size="sm" onClick={onPlanWeek}>
          <Calendar className="mr-2 h-4 w-4" />
          Plan Week
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {meals.map((day) => (
            <motion.div
              key={day.id}
              variants={itemVariants}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{day.day}</p>
                <p className="text-sm text-muted-foreground">{day.meal}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{day.time}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAddMeal(day.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 