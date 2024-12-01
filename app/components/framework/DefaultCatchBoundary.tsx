import { Link, rootRouteId, useMatch, useRouter } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { type Variants, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Home, RefreshCcw } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import ErrorHighlighter from './ErrorHighlighter';

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  console.error('DefaultCatchBoundary Error:', error);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
      },
    },
  };

  const itemVariants: Variants = {
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
    <div className="relative flex min-h-screen flex-col w-full bg-gradient-to-b from-white to-neutral-100 dark:bg-gradient-to-b dark:from-neutral-800/50 dark:to-neutral-900/50 dark:text-white">

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4"
      >
        <motion.div
          variants={itemVariants}
          className="w-full max-w-2xl rounded-lg border border-border bg-card p-8 shadow-sm"
        >
          <motion.div variants={itemVariants}>
            <span className="text-2xl font-bold flex items-center gap-2 mb-1.5">
              <span>Error in:</span>
              <span className="text-red-600">{pathname}</span>
            </span>
            <span className="text-sm text-neutral-400 mb-3">
              An error was encountered while loading this page. The following
              stack trace may help you debug the issue.
            </span>
          </motion.div>
          <motion.div variants={itemVariants} className="mb-8 mt-3">
            <Alert>
              <AlertCircle className="h-4 w-4 " />
              <AlertTitle className="text-lg">{error.message}</AlertTitle>
              <AlertDescription className="overflow-y-scroll max-h-56 text-gray-500">
                <ErrorHighlighter
                  errorMessage={error.stack ?? 'No stack trace available'}
                />
              </AlertDescription>
            </Alert>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex justify-center gap-4"
          >
            <Button
              onClick={() => {
                router.invalidate();
              }}
              variant="default"
              className="inline-flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>

            {isRoot ? (
              <Button
                asChild
                variant="secondary"
                className="inline-flex items-center gap-2"
              >
                <Link to="/">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="secondary"
                className="inline-flex items-center gap-2"
              >
                <Link
                  to="/"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.back();
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Link>
              </Button>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
