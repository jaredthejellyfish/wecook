import { useEffect, useState } from 'react';

import { Link, createFileRoute } from '@tanstack/react-router';
import { useRealtimeRun } from '@trigger.dev/react-hooks';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

import Header from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import { Button } from '@/components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';

import authStateFn from '@/server-fns/auth-redirect';

export const Route = createFileRoute('/(app)/generating/')({
  component: GeneratingPage,
  beforeLoad: () => authStateFn(),
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'text-green-500 bg-green-50 dark:bg-green-900/20';
    case 'FAILED':
    case 'CRASHED':
    case 'INTERRUPTED':
    case 'SYSTEM_FAILURE':
      return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    case 'WAITING_FOR_DEPLOY':
    case 'QUEUED':
    case 'EXECUTING':
    case 'REATTEMPTING':
      return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    default:
      return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
  }
};

const getStatusIcon = (status: string) => {
  const iconClass = 'w-5 h-5';
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle className={iconClass} />;
    case 'FAILED':
    case 'CRASHED':
    case 'INTERRUPTED':
    case 'SYSTEM_FAILURE':
      return <XCircle className={iconClass} />;
    case 'WAITING_FOR_DEPLOY':
    case 'QUEUED':
    case 'EXECUTING':
    case 'REATTEMPTING':
      return <Clock className={iconClass} />;
    default:
      return <AlertTriangle className={iconClass} />;
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function GeneratingPage() {
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [publicAccessToken, setPublicAccessToken] = useState<string | null>(
    null,
  );
  const [completed, setCompleted] = useState(false);

  const { run, error } = useRealtimeRun(recipeId ?? '', {
    accessToken: publicAccessToken ?? '',
    enabled: !!recipeId && !!publicAccessToken && !completed,
  });

  useEffect(() => {
    const searchParams = window.location.search;
    const urlParams = new URLSearchParams(searchParams);
    setRecipeId(urlParams.get('recipeId') ?? null);
    setPublicAccessToken(urlParams.get('publicAccessToken') ?? null);
  }, []);

  useEffect(() => {
    if (run?.status === 'COMPLETED') {
      setCompleted(true);
    }
  }, [run?.status]);

  return (
    <SidebarProvider>
      <Header />
      <div className="relative flex min-h-screen flex-col top-16 w-full bg-gradient-to-b from-white to-neutral-100 dark:bg-gradient-to-b dark:from-neutral-800/50 dark:to-neutral-900/50 dark:text-white">
        <div className="flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <SidebarNav />
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex-1 space-y-6 md:p-8 p-3 pt-6"
          >
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold tracking-tight">
                Generating Content
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400">
                Track the progress of your content generation
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <div className="flex gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-200">
                      Error Occurred
                    </h3>
                    <p className="text-red-700 dark:text-red-300 mt-1">
                      {error.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {run && (
              <div className="bg-white dark:bg-neutral-800/50 rounded-xl shadow-lg shadow-neutral-200/50 dark:shadow-neutral-900/50 backdrop-blur-sm">
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Run Status</h2>
                    <span
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(run.status)}`}
                    >
                      {getStatusIcon(run.status)}
                      <span>{run.status}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        Task Identifier
                      </p>
                      <p className="mt-1 font-mono text-sm truncate">
                        {run.id}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        Run Number
                      </p>
                      <p className="mt-1 font-mono text-sm">{run.number}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Created', time: run.createdAt },
                        { label: 'Queued', time: run.queuedAt },
                        { label: 'Started', time: run.startedAt },
                        { label: 'Finished', time: run.finishedAt },
                      ].map(
                        (item, index) =>
                          item.time && (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                            >
                              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                {item.label}
                              </span>
                              <span className="text-sm font-mono">
                                {new Date(item.time).toLocaleString()}
                              </span>
                            </div>
                          ),
                      )}
                    </div>
                  </div>

                  {run.error && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                      <h4 className="text-red-900 dark:text-red-200 font-semibold mb-2">
                        Error Details
                      </h4>
                      <p className="text-red-700 dark:text-red-300">
                        {run.error.message}
                      </p>
                      {run.error.stackTrace && (
                        <pre className="mt-3 p-3 rounded bg-red-100 dark:bg-red-900/40 text-xs overflow-x-auto">
                          {run.error.stackTrace}
                        </pre>
                      )}
                    </div>
                  )}

                  {run?.output?.recipeId && run?.output.recipeId.toString() && (
                    <div className="flex justify-end">
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6">
                        <Link
                          to={`/recipes/$id`}
                          params={{ id: run?.output.recipeId.toString() }}
                          className="flex items-center gap-2"
                        >
                          View Recipe
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default GeneratingPage;
