import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';

interface PublicRecipePayload {
    recipeId: string;
    isPublic: boolean;
}

export function useRecipePublic() {
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async ({ recipeId, isPublic }: PublicRecipePayload) => {
            const response = await fetch('/api/recipes/public', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recipeId, isPublic }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update recipe visibility');
            }

            const data = await response.json();
            return data;
        },
        onSuccess: () => {
            toast.success('Recipe visibility updated!');
            router.invalidate();
        },
        onError: (error: Error) => {
            toast.error(error.message);
            router.invalidate();
        },
    });

    return {
        submit: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
    };
}
