import React, { useEffect, useState } from 'react';

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { SelectEvent } from '@/db/schema';
import { cn } from '@/lib/utils';

import { Timeline } from './timeline';



export default function Calendar({ events }: { events: SelectEvent[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    // Set the selected date to today when the component mounts
    setSelectedDate(new Date());
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfMonth(monthStart);
  const endDate = endOfMonth(monthEnd);

  const dateFormat = 'MMMM yyyy';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const renderDays = () => {
    const dateFormat = 'd';
    const dates = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    return dates.map((day, idx) => {
      const isSelected = isSameDay(day, selectedDate);
      const isCurrentDay = isToday(day);
      return (
        <motion.div
          className={'py-2 px-3 text-center cursor-pointer rounded-full '}
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
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'text-sm',
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
        </motion.div>
      );
    });
  };

  return (
    <div>
      <motion.div
        className="w-full shadow-lg rounded-lg overflow-hidden bg-black"
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
            {format(currentMonth, dateFormat)}
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
            key={selectedDate.toISOString()}
            date={selectedDate}
            events={events}
          />
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
