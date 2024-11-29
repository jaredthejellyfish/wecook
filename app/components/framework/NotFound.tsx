import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

import AnimatedUnderlineLink from '@/components/animated-underline-link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex flex-col">
      <main className="flex-grow flex items-center justify-center">
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
            <Link to="/">
              <Button className="flex items-center gap-2">
                Return to Home
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <AnimatedUnderlineLink href="#popular-recipes">
              Browse Popular Recipes
            </AnimatedUnderlineLink>
          </motion.div>
        </motion.section>
      </main>
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-neutral-800 py-6"
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            &copy; {new Date().getFullYear()} WeCook, Inc. All rights reserved.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
