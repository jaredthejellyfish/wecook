'use client';

import { useState } from 'react';

import { Link, useRouter } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowRight, Bookmark, ChefHat } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useBookmarkRecipe } from '@/hooks/useBookmarkRecipe';
import { useBookmarks } from '@/hooks/useBookmarks';
import { type RecentActivity } from '@/lib/types';
import { cn } from '@/lib/utils';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';

interface RecentActivityProps {
  activities: RecentActivity[];
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

export default function RecentActivity({ activities }: RecentActivityProps) {
  const [filter, setFilter] = useState<'all' | 'cooked' | 'saved'>('all');
  const router = useRouter();
  const { data: bookmarks } = useBookmarks();
  const bookmark = useBookmarkRecipe();

  const bookmarkRecipe = async (recipe_id: string) => {
    await bookmark.mutateAsync({ data: { recipe_id } });

    router.invalidate();
  };

  console.log(bookmarks);

  const filteredActivities = activities
    .filter((activity) => {
      if (filter === 'all') return true;
      return activity.type === filter;
    })
    .slice(0, 5);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 pb-2 mb-3 sm:mb-auto">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as typeof filter)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="cooked">Cooked</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredActivities?.map((activity) => (
            <motion.div key={activity.id} variants={itemVariants}>
              <div className="flex items-center justify-between">
                <HoverCard>
                  <HoverCardTrigger>
                    <Link
                      to={`/recipes/$id`}
                      params={{ id: activity.id.toString() }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                        {activity.type === 'cooked' ? (
                          <ChefHat className="h-4 w-4 text-neutral-500" />
                        ) : (
                          <Bookmark className="h-4 w-4 text-neutral-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate max-w-[180px] xs:max-w-[250px] sm:max-w-full">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {activity.type === 'cooked' ? 'Cooked' : 'Saved'}
                        </p>
                      </div>
                    </Link>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={activity.image}
                        alt={activity.title}
                        className="w-full h-32 rounded-md object-cover"
                      />
                      <div>
                        <h4 className="text-lg font-semibold mb-1.5">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    bookmarkRecipe(activity.id.toString());
                  }}
                >
                  <Bookmark
                    className={cn(
                      'h-4 w-4',
                      bookmarks?.find(
                        (recipe) =>
                          recipe.id.toString() === activity.id.toString(),
                      )
                        ? 'fill-white'
                        : '',
                    )}
                  />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
        {filteredActivities?.length === 0 && (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        )}
      </CardContent>
      {filteredActivities?.length > 0 && (
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
