import { useQuery } from '@tanstack/react-query';

interface Event {
    id: number;
    date: string;
    mealType: 'breakfast' | 'brunch' | 'lunch' | 'snack' | 'dinner';
    recipeId: number;
}

const firstDateOfTheMonth = (date: Date) => {
    const properDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const formattedDate = new Date(properDate).toLocaleDateString('en-US', {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    return formattedDate;
};

const lastDateOfTheMonth = (date: Date) => {
    const properDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const formattedDate = new Date(properDate).toLocaleDateString('en-US', {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    return formattedDate;
};

export function useEvents() {
    const url = `/api/events/list?from=${firstDateOfTheMonth(new Date())}&to=${lastDateOfTheMonth(new Date())}`;

    return useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const res = await fetch(url.toString());
            const data = (await res.json()) as { events: Event[] };
            return data.events ?? [];
        },
    });
}
