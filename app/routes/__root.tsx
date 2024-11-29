// app/routes/__root.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  Outlet,
  ScrollRestoration,
  createRootRoute,
} from '@tanstack/react-router';
import { Meta, Scripts } from '@tanstack/start';
import type { ReactNode } from 'react';

import Devtools from '@/components/Devtools';
import { Toaster } from '@/components/ui/sonner';

import ClerkProviderThemed from '@/providers/clerk-provider-themed';
import { ThemeProvider } from '@/providers/theme-provider';
import { themeScript } from '@/scripts/theme-script';
import appCss from '@/styles/app.css?url';

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: 'stylesheet', href: appCss }],
    scripts: [
      // Add the theme script before your app's hydration
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
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ClerkProviderThemed>
          <html suppressHydrationWarning>
            <head>
              <Meta />
            </head>
            <body>
              {children}
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
