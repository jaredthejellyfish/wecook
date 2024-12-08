import React, { useEffect, useState } from 'react';

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { CalendarEvent } from '@/lib/types';
import { cn } from '@/lib/utils';

import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Timeline } from './timeline';

// Helper function to format dates consistently
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function Calendar({ events }: { events: CalendarEvent[] }) {
  const [currentMonth, setCurrentMonth] = useState(formatDate(new Date()));
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDate(new Date()),
  );

  useEffect(() => {
    setSelectedDate(formatDate(new Date()));
  }, []);

  // Convert string date back to Date object for date-fns operations
  const currentMonthDate = new Date(currentMonth);
  const monthStart = startOfMonth(currentMonthDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfMonth(monthStart);
  const endDate = endOfMonth(monthEnd);

  const dateFormat = 'MMMM yyyy';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const onDateClick = (day: Date) => {
    setSelectedDate(formatDate(day));
  };

  const nextMonth = () => {
    setCurrentMonth(formatDate(addMonths(currentMonthDate, 1)));
  };

  const prevMonth = () => {
    setCurrentMonth(formatDate(subMonths(currentMonthDate, 1)));
  };

  const hasEventsOnDay = (
    day: Date,
  ): { doesIt: boolean; hasPassed: boolean } => {
    const today = new Date();
    const normalizedDay = formatDate(day);

    const doesIt = events.some((event) => {
      const normalizedEventDate = new Date(event.date).toLocaleDateString(
        'en-US',
        {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        },
      );
      return normalizedEventDate === normalizedDay;
    });

    const hasPassed = day.getTime() < today.setHours(0, 0, 0, 0);
    return { doesIt, hasPassed };
  };

  const renderDays = () => {
    const dateFormat = 'd';
    const dates = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    return dates.map((day, idx) => {
      const isSelected = formatDate(day) === selectedDate;
      const isCurrentDay = isToday(day);
      const hasEvents = hasEventsOnDay(day);

      return (
        <motion.div
          className={
            'py-2 px-3 text-center cursor-pointer rounded-full relative'
          }
          key={idx}
          onClick={() => onDateClick(day)}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                type: 'spring',
                stiffness: 100,
              },
            },
          }}
        >
          {hasEvents.doesIt ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'text-sm relative group/button',
                    !isSameMonth(day, monthStart)
                      ? 'text-gray-400'
                      : isSelected
                        ? 'bg-primary text-primary-foreground'
                        : isCurrentDay
                          ? 'bg-secondary text-secondary-foreground'
                          : '',
                  )}
                >
                  {format(day, dateFormat)}
                  {hasEvents.doesIt && isSameMonth(day, monthStart) && (
                    <div
                      className={cn(
                        'absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full transition-opacity duration-100',
                        !isSelected ? 'opacity-100' : 'opacity-0',
                        'group-hover/button:opacity-0',
                      )}
                    />
                  )}
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>There are events on this day</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'text-sm relative group/button',
                !isSameMonth(day, monthStart)
                  ? 'text-gray-400'
                  : isSelected
                    ? 'bg-primary text-primary-foreground'
                    : isCurrentDay
                      ? 'bg-secondary text-secondary-foreground'
                      : '',
              )}
            >
              {format(day, dateFormat)}
            </Button>
          )}
        </motion.div>
      );
    });
  };

  return (
    <div>
      <motion.div
        className="w-full shadow-lg rounded-lg overflow-hidden dark:bg-black"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.001,
            },
          },
        }}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-primary text-primary-foreground">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <span className="text-lg font-bold">
            {format(currentMonthDate, dateFormat)}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 p-4">
          {days.map((day, idx) => (
            <div key={idx} className="text-center font-bold text-sm">
              {day}
            </div>
          ))}
          {renderDays()}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ duration: 0.3 }}
        className="mt-4 rounded-lg shadow-xl border bg-gradient-to-b from-white to-neutral-100 dark:bg-gradient-to-b dark:from-neutral-900/50 dark:to-neutral-950/50 dark:text-white"
      >
        <AnimatePresence mode="wait">
          <Timeline
            key={selectedDate}
            date={new Date(selectedDate)}
            events={events}
          />
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
