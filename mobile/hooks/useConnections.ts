import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionApi } from '../lib/api';

type Role = 'athlete' | 'coach';

/**
 * Fetches connections for the current user as the given role.
 * Returns helpers for accept/decline mutations with optimistic updates.
 */
export function useConnections(role: Role) {
  const queryClient = useQueryClient();
  const queryKey = ['connections', role];

  const query = useQuery({
    queryKey,
    queryFn: () => connectionApi.getConnections(role),
    staleTime: 20_000,
  });

  // Accept a connection (coach only)
  const acceptMutation = useMutation({
    mutationFn: (connectionId: string) =>
      connectionApi.updateConnection(connectionId, 'ACCEPTED'),
    onMutate: async (connectionId: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: any[]) =>
        old?.map(c => c.id === connectionId ? { ...c, status: 'ACCEPTED' } : c),
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

  // Decline a connection (coach only)
  const declineMutation = useMutation({
    mutationFn: (connectionId: string) =>
      connectionApi.updateConnection(connectionId, 'DECLINED'),
    onMutate: async (connectionId: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: any[]) =>
        old?.map(c => c.id === connectionId ? { ...c, status: 'DECLINED' } : c),
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

  // Send a connection request (athlete only)
  const sendMutation = useMutation({
    mutationFn: (coachId: string) => connectionApi.createConnection(coachId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    connections: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    accept: acceptMutation.mutateAsync,
    decline: declineMutation.mutateAsync,
    send: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    isAccepting: acceptMutation.isPending,
    isDeclining: declineMutation.isPending,
  };
}
