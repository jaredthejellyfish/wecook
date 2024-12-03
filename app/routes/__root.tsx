// app/routes/__root.tsx
import { type ReactNode, Suspense, lazy, useEffect, useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  Outlet,
  ScrollRestoration,
  createRootRoute,
  useRouter,
} from '@tanstack/react-router';
import { Meta, Scripts } from '@tanstack/start';

import Devtools from '@/components/Devtools';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';

import ClerkProviderThemed from '@/providers/clerk-provider-themed';
import { ThemeProvider } from '@/providers/theme-provider';
import { themeScript } from '@/scripts/theme-script';
import appCss from '@/styles/app.css?url';

const LazyHeader = lazy(() => import('@/components/header'));
const LazySidebarNav = lazy(() => import('@/components/sidebar-nav'));

export const Route = createRootRoute({
  head: () => ({
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: 'https://images.wecook.dev/favicon.svg',
      },
    ],
    scripts: [
      {
        defer: true,
        'data-site-id': 'wecook.dev',
        src: 'https://assets.onedollarstats.com/tracker.js',
      },
      {
        tag: 'script',
        children: themeScript,
      },
    ],
    meta: [
      {
        name: 'description',
        content:
          'WeCook - Share and discover delicious recipes with a community of home chefs',
      },
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'WeCook',
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
      <Devtools />
    </RootDocument>
  );
}

const queryClient = new QueryClient();

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const [isLandingPage, setIsLandingPage] = useState(false);

  useEffect(() => {
    const updateIsLandingPage = () => {
      setIsLandingPage(router.state.location.pathname === '/');
    };

    // Set initial value
    updateIsLandingPage();

    // Subscribe to router changes
    return router.subscribe('onBeforeLoad', () => {
      updateIsLandingPage();
    });
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ClerkProviderThemed>
          <html suppressHydrationWarning>
            <head>
              <Meta />
            </head>
            <body>
              {!isLandingPage ? (
                <SidebarProvider>
                  <Suspense fallback={<Skeleton className="w-full h-16" />}>
                    <LazyHeader />
                  </Suspense>
                  <div className="relative flex min-h-screen flex-col top-16 w-full bg-gradient-to-b from-white to-neutral-100 dark:bg-gradient-to-b dark:from-neutral-800/50 dark:to-neutral-900/50 dark:text-white">
                    <div className="flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
                      <Suspense fallback={<Skeleton className="w-full h-16" />}>
                        <LazySidebarNav />
                      </Suspense>
                      <main className="flex-1 space-y-6 md:p-8 p-3 pt-6">
                        {children}
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              ) : (
                <div>{children}</div>
              )}
              <ScrollRestoration />
              <Scripts />
              <Toaster />
              <ReactQueryDevtools initialIsOpen={false} />
            </body>
          </html>
        </ClerkProviderThemed>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
