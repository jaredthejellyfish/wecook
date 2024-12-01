import { useMutation } from '@tanstack/react-query';
import { useRealtimeRun } from '@trigger.dev/react-hooks';
import { toast } from 'sonner';

interface EditRecipePayload {
    recipeId: string;
    note: string;
}

export function useEditRecipe() {
    const mutation = useMutation({
        mutationFn: async ({ recipeId, note }: EditRecipePayload) => {
            const response = await fetch('/api/recipes/edit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recipeId, note }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update recipe');
            }

            const data = await response.json();
            return data;
        },
        onSuccess: (data) => {
            toast.success('Recipe update queued!');
            return data;
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Track the realtime status of the edit task
    const { run, error: realtimeError } = useRealtimeRun(
        mutation.data?.data?.id ?? '',
        {
            accessToken: mutation.data?.data?.publicAccessToken ?? '',
            enabled: !!mutation.data?.data?.id && !!mutation.data?.data?.publicAccessToken,
        }
    );

    // Return combined state
    return {
        submit: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error || realtimeError,
        run,
        isSuccess: mutation.isSuccess,
    };
} 