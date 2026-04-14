import { useQuery } from '@tanstack/react-query';
import { requestApi } from '../lib/api';

/** Returns pending counts for the current user in both roles */
export function useAthletePendingCount() {
  const { data } = useQuery({
    queryKey: ['requests', 'athlete'],
    queryFn: () => requestApi.getRequests('athlete'),
    staleTime: 30_000,
  });
  const pending = (data ?? []).filter((r: any) => r.status === 'PENDING');
  return pending.length as number;
}

export function useCoachPendingCount() {
  const { data } = useQuery({
    queryKey: ['requests', 'coach'],
    queryFn: () => requestApi.getRequests('coach'),
    staleTime: 30_000,
  });
  const pending = (data ?? []).filter((r: any) => r.status === 'PENDING');
  return pending.length as number;
}
