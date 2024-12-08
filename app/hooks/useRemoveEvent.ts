import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useAddEvent } from './useAddEvent';
import type { CalendarEvent, MealType } from '@/lib/types';

export function useRemoveEvent() {
    const router = useRouter();
    const addEvent = useAddEvent();

    return useMutation({
        mutationFn: async (eventId: number) => {
            const response = await fetch(`/api/events/remove?id=${eventId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to remove event');
            }

            return response.json() as Promise<{ success: boolean, event: CalendarEvent }>;
        },
        onSuccess: (data) => {
            // Invalidate and refetch events list
            router.invalidate();
            toast('Event removed successfully!', {
                description: 'The event has been removed from your calendar.',
                action: {
                    label: "Undo",
                    onClick: () => {
                        const event = data.event;
                        const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        });
                        addEvent.mutate({
                            date: formattedDate,
                            mealType: event.mealType as MealType,
                            recipeId: event.recipeId,
                        });
                    },
                },
            });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}
