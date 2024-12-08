import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';

interface AddEventData {
    date: string;
    mealType: 'breakfast' | 'brunch' | 'lunch' | 'snack' | 'dinner';
    recipeId: number;
}

export function useAddEvent() {
    const queryClient = useQueryClient();
    const router = useRouter();
    
    return useMutation({
        mutationFn: async (data: AddEventData) => {
            const response = await fetch('/api/events/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add event');
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate and refetch events list
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast.success('Event added successfully!');
            router.invalidate();
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}
