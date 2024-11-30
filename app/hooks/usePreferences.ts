import { useQuery } from '@tanstack/react-query';

import type { SelectPreference } from '@/db/schema';

export function usePreferences() {

  return useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      const res = await fetch('/api/preferences');
      const data = (await res.json()) as { preferences: SelectPreference };
      return data.preferences ?? {};
    },
  });
} 