import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { SelectPreference } from '@/db/schema';

export function useMutatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<SelectPreference>) => {
      const response = await fetch('/api/set-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update preferences');
      }

      const data = await response.json();
      return data.preferences as SelectPreference;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['preferences'], data);
      toast.success('Preferences saved successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
} 