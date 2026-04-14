import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestApi } from '../lib/api';

type Role = 'athlete' | 'coach';

/**
 * Fetches session requests for the current user as the given role.
 * Returns helpers for accept/decline mutations with optimistic updates.
 */
export function useRequests(role: Role) {
  const queryClient = useQueryClient();
  const queryKey = ['requests', role];

  const query = useQuery({
    queryKey,
    queryFn: () => requestApi.getRequests(role),
    staleTime: 20_000,
  });

  // Accept a request (coach only)
  const acceptMutation = useMutation({
    mutationFn: (requestId: string) =>
      requestApi.updateRequest(requestId, 'ACCEPTED'),
    onMutate: async (requestId: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: any[]) =>
        old?.map(r => r.id === requestId ? { ...r, status: 'ACCEPTED' } : r),
      );
      return { previous };
    },
    onError: (_err, _id, context: any) => {
      queryClient.setQueryData(queryKey, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Decline a request (coach only)
  const declineMutation = useMutation({
    mutationFn: (requestId: string) =>
      requestApi.updateRequest(requestId, 'DECLINED'),
    onMutate: async (requestId: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: any[]) =>
        old?.map(r => r.id === requestId ? { ...r, status: 'DECLINED' } : r),
      );
      return { previous };
    },
    onError: (_err, _id, context: any) => {
      queryClient.setQueryData(queryKey, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const pendingRequests = (query.data ?? []).filter((r: any) => r.status === 'PENDING');
  const confirmedRequests = (query.data ?? []).filter((r: any) => r.status === 'ACCEPTED');
  const declinedRequests = (query.data ?? []).filter((r: any) => r.status === 'DECLINED');

  return {
    requests: query.data ?? [],
    pendingRequests,
    confirmedRequests,
    declinedRequests,
    isLoading: query.isLoading,
    refetch: query.refetch,
    accept: acceptMutation.mutateAsync,
    decline: declineMutation.mutateAsync,
    isAccepting: acceptMutation.isPending,
    isDeclining: declineMutation.isPending,
  };
}
