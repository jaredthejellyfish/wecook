import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useDeleteRecipe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (recipeId: string) => {
            const response = await fetch(`/api/recipes/delete?recipeId=${recipeId}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete recipe');
            }

            else {
                return response.json() as Promise<{ success: boolean }>;
            }
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['delete-recipe'], data);
            toast.success('Recipe deleted successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
} 