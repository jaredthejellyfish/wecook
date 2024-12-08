import React from 'react';

import { Link } from '@tanstack/react-router';
import { format, isSameDay, isToday } from 'date-fns';
import { motion } from 'motion/react';

import type { CalendarEvent } from '@/lib/types';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';

interface TimelineProps {
  date: Date;
  events: CalendarEvent[];
}

export function Timeline({ date, events }: TimelineProps) {
  const filteredEvents = events.filter((event) => {
    return isSameDay(new Date(event.date), date);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-4"
    >
      <h3 className="text-lg font-semibold mb-4">
        Timeline for {isToday(date) ? 'Today' : format(date, 'MMMM d, yyyy')}
      </h3>
      {filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <HoverCard key={event.id}>
              <HoverCardTrigger asChild>
                <Link
                  to={`/recipes/$id`}
                  params={{ id: event.recipeId.toString() }}
                >
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-start mb-2 hover:bg-muted/50 rounded-md p-2 transition-colors duration-150"
                  >
                    <div className="flex-grow ml-4">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5 mr-2 float-left"></div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-semibold">
                          {event.mealType.charAt(0).toUpperCase() +
                            event.mealType.slice(1)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {event.recipeTitle}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={event.recipeImage}
                    alt={event.recipeTitle}
                    className="w-full h-32 rounded-md object-cover"
                  />
                  <div>
                    <h4 className="text-lg font-semibold mb-1.5">
                      {event.recipeTitle}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {event.recipeDescription}
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mb-4">
          No events scheduled for this day.
        </p>
      )}
    </motion.div>
  );
}
