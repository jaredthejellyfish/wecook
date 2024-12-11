import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChefHat, Heart, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Activity {
  id: string;
  type: 'cooked' | 'saved';
  recipe: string;
  timestamp: string;
  liked?: boolean;
  starred?: boolean;
}

interface RecentActivityProps {
  activities: Activity[];
  onLike: (id: string) => void;
  onStar: (id: string) => void;
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

export default function RecentActivity({ activities, onLike, onStar }: RecentActivityProps) {
  const [filter, setFilter] = useState<'all' | 'cooked' | 'saved'>('all');

  const filteredActivities = activities.filter((activity) => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)} className="w-[300px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="cooked">Cooked</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <motion.div
              key={activity.id}
              variants={itemVariants}
              className="flex items-center"
            >
              <div className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                {activity.type === 'cooked' ? (
                  <ChefHat className="h-5 w-5 text-neutral-500" />
                ) : (
                  <BookOpen className="h-5 w-5 text-neutral-500" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">
                  {activity.type === 'cooked' ? 'Cooked' : 'Saved'} {activity.recipe}
                </p>
                <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onLike(activity.id)}
                  className={activity.liked ? 'text-red-500' : ''}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onStar(activity.id)}
                  className={activity.starred ? 'text-yellow-400' : ''}
                >
                  <Star className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 