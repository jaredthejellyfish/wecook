import React from 'react';

import { format, isToday } from 'date-fns';
import { motion } from "motion/react";

interface Event {
  id: number;
  time: string;
  title: string;
  description: string;
}

interface TimelineProps {
  date: Date;
  events: Event[];
}

export function Timeline({ date, events }: TimelineProps) {

const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.time);
    return (
      eventDate.getFullYear() === date.getFullYear() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getDate() === date.getDate()
    );
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
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-start"
            >
              <div className="flex-shrink-0 w-16 text-sm font-medium">
                {event.time}
              </div>
              <div className="flex-grow ml-4">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 mr-2 float-left"></div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-semibold">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          No events scheduled for this day.
        </p>
      )}
    </motion.div>
  );
}
