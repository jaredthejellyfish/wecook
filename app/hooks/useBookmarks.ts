import { useQuery } from '@tanstack/react-query';

import type { SelectBookmark } from '@/db/schema';

export function useBookmarks() {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const res = await fetch('/api/bookmarks');
      const data = (await res.json()) as { bookmarks: SelectBookmark[] };
      return data.bookmarks ?? [];
    },
  });
}
