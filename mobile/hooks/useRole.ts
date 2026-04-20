import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionApi } from '../lib/api';
import type { Role } from '../types';
import { SCREENSHOT_MODE, SCREENSHOT_ROLE } from '../constants/config';

export function useRole() {
  const queryClient = useQueryClient();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['session'],
    queryFn: sessionApi.getSession,
    retry: false,
    retryOnMount: false,
    staleTime: 5 * 60 * 1000,
    enabled: !SCREENSHOT_MODE,
  });

  const enterRoleMutation = useMutation({
    mutationFn: sessionApi.enterRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });

  const exitRoleMutation = useMutation({
    mutationFn: sessionApi.exitRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });

  if (SCREENSHOT_MODE) {
    return {
      activeRole: SCREENSHOT_ROLE as Role,
      hasAthleteProfile: true,
      hasCoachProfile: false,
      athleteProfileComplete: true,
      coachProfileComplete: false,
      isLoading: false,
      enterRole: async (_role: Role) => {},
      exitRole: async () => {},
    };
  }

  return {
    activeRole: session?.activeRole as Role | null,
    hasAthleteProfile: session?.hasAthleteProfile || false,
    hasCoachProfile: session?.hasCoachProfile || false,
    athleteProfileComplete: session?.athleteProfileComplete || false,
    coachProfileComplete: session?.coachProfileComplete || false,
    isLoading: isLoading && !error,
    enterRole: (role: Role) => enterRoleMutation.mutateAsync(role),
    exitRole: () => exitRoleMutation.mutateAsync(),
  };
}
