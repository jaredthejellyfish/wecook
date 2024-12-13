import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { SelectCookedRecipe } from '@/db/schema';

export function useMutateCookedRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeId: string) => {
      const response = await fetch('/api/cooked-recipes/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cook recipe');
      }

      const data = await response.json();
      return data as { hasBeenCooked: boolean } | SelectCookedRecipe;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cooked-recipes'] });

      if ('hasBeenCooked' in data) {
        toast.success('Recipe cooked successfully!');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
