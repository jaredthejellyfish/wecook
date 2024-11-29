import { useMutation, useQueryClient } from '@tanstack/react-query';

import bookmarkRecipeFn from '@/reusable-fns/bookmark-recipe';

import type { SelectBookmark } from '@/db/schema';

export function useBookmarkRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookmarkRecipeFn,
    onSuccess: () => {
      // Invalidate and refetch bookmarks
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}
