import { useQuery } from '@tanstack/react-query';

interface Event {
  id: number;
  date: string;
  mealType: 'breakfast' | 'brunch' | 'lunch' | 'snack' | 'dinner';
  recipeId: number;
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch('/api/events/list');
      const data = (await res.json()) as { events: Event[] };
      return data.events ?? [];
    },
  });
}
