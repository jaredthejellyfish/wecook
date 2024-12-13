import { useQuery } from '@tanstack/react-query';

import type { SelectCookedRecipe} from '@/db/schema';

export function useCookedRecipes(recipeId: number) {
  return useQuery({
    queryKey: ['cooked-recipes', recipeId],
    queryFn: async () => {
      const res = await fetch(`/api/cooked-recipes/get?recipeId=${recipeId}`);
      const data = (await res.json()) as { cookedRecipes: SelectCookedRecipe[] };
      return data ?? [];
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
