import { useRouter } from '@tanstack/react-router';
import { useEffect, useState, useCallback } from 'react';

export function usePathname() {
  const router = useRouter();
  const [pathname, setPathname] = useState(router.state.location.pathname);

  const updatePathname = useCallback(() => {
    setPathname(router.state.location.pathname);
  }, [router.state.location.pathname]);

  useEffect(() => {
    router.subscribe('onBeforeLoad', updatePathname);
  }, [router, updatePathname]);

  return { pathname };
}
