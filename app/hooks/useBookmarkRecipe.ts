import { useMutation, useQueryClient } from '@tanstack/react-query';

import bookmarkRecipeFn from '@/server-fns/bookmark-recipe';

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
