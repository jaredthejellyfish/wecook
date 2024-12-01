import { SignedIn, SignedOut } from '@clerk/tanstack-start';
import { useNavigate } from '@tanstack/react-router';
import { motion } from "motion/react";
import { ChevronRight } from 'lucide-react';

import AnimatedUnderlineLink from '@/components/animated-underline-link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

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

  const navigate = useNavigate();

  return (
    <main className="flex-grow flex items-center justify-center max-h-96 text-neutral-900 dark:text-neutral-100 flex-col h-full">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 py-16 text-center"
      >
        <motion.h1
          variants={itemVariants}
          className="font-serif text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-6xl mb-6"
        >
          404 - Page Not Found
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-xl text-neutral-600 dark:text-neutral-300 mb-8"
        >
          Oops! It seems we can't find the recipe you're looking for.
        </motion.p>
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <SignedOut>
            <Button
              className="flex items-center gap-2"
              onClick={() => navigate({ to: '/' })}
            >
              Return to Home
              <ChevronRight className="h-4 w-4" />
            </Button>
          </SignedOut>
          <SignedIn>
            <Button
              className="flex items-center gap-2"
              onClick={() => navigate({ to: '/dashboard' })}
            >
              Return to Dashboard
              <ChevronRight className="h-4 w-4" />
            </Button>
          </SignedIn>

          <AnimatedUnderlineLink href="/recipes">
            Browse All Recipes
          </AnimatedUnderlineLink>
        </motion.div>
      </motion.section>
    </main>
  );
}
