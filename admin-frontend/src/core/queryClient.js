import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      retry: 1, // Only retry failed requests once by default
      refetchOnWindowFocus: false, // Don't refetch on window focus for admin panel
    },
  },
});
