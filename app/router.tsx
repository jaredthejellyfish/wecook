// app/router.tsx
import { createRouter as createTanStackRouter } from '@tanstack/react-router';

import { DefaultCatchBoundary } from '@/components/framework/DefaultCatchBoundary';
import NotFound from '@/components/framework/NotFound';

import { routeTree } from '@/routeTree.gen';

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
  });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
