import { motion } from 'framer-motion';
import { BookOpen, Clock, Flame, Utensils } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardsProps {
  stats: {
    recipesCooked: number;
    recipesLastWeek: number;
    savedRecipes: number;
    newSaves: number;
    streakDays: number;
    timeSaved: number;
  };
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

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Recipes Cooked',
      value: stats.recipesCooked,
      change: `+${stats.recipesLastWeek} from last week`,
      icon: Utensils,
    },
    {
      title: 'Saved Recipes',
      value: stats.savedRecipes,
      change: `+${stats.newSaves} new saves`,
      icon: BookOpen,
      progress: 60,
    },
    {
      title: 'Cooking Streak',
      value: `${stats.streakDays} ${stats.streakDays === 1 ? 'day' : 'days'}`,
      change: 'Keep it up!',
      icon: Flame,
    },
    {
      title: 'Time Saved',
      value: `${Math.round(stats.timeSaved * 100) / 100} hrs`,
      change: 'This week',
      icon: Clock,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <motion.div key={card.title} variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground hidden xs:block" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-xs text-muted-foreground">{card.change}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
} 