import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useCachedApi(key, fetcher, options = {}) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: fetcher,
    staleTime: options.staleTime || 1000 * 60 * 5, // 5 minutes
    cacheTime: options.cacheTime || 1000 * 60 * 30, // 30 minutes
    ...options,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries(key);
  }, [queryClient, key]);

  const prefetch = useCallback(async () => {
    await queryClient.prefetchQuery(key, fetcher);
  }, [queryClient, key, fetcher]);

  return {
    ...query,
    invalidate,
    prefetch,
  };
} 