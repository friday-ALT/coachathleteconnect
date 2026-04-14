import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../lib/api';

/**
 * Returns coaches that the athlete has had accepted sessions with but hasn't reviewed yet.
 * Use this to prompt the athlete to leave a review after sessions.
 */
export function usePendingReviews() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['reviews', 'pending'],
    queryFn: () => reviewApi.getPendingReviews(),
    staleTime: 60_000,
  });

  const submitReview = useMutation({
    mutationFn: ({ coachId, rating, comment }: { coachId: string; rating: number; comment?: string }) =>
      reviewApi.createReview(coachId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  return {
    pendingCoaches: query.data ?? [],
    hasPending: (query.data ?? []).length > 0,
    isLoading: query.isLoading,
    submitReview: submitReview.mutateAsync,
    isSubmitting: submitReview.isPending,
  };
}
