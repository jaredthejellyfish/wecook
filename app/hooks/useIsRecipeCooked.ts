import { useQuery } from '@tanstack/react-query';

import type { SelectCookedRecipe} from '@/db/schema';

export function useIsRecipeCooked(recipeId: number) {
  return useQuery({
    queryKey: ['cooked-recipes', recipeId],
    queryFn: async () => {
      const res = await fetch(`/api/cooked-recipes/get?recipeId=${recipeId}`);
      const data = (await res.json()) as SelectCookedRecipe[];
      const isRecipeCooked = data.length > 0;
      return isRecipeCooked;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
