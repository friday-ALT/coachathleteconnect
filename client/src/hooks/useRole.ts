import { useQuery, useMutation } from "@tanstack/react-query";
import type { AthleteProfile, CoachProfile } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export type ActiveRole = "athlete" | "coach" | null;

type SessionState = {
  activeRole: ActiveRole;
  hasAthleteProfile: boolean;
  hasCoachProfile: boolean;
  athleteProfileComplete: boolean;
  coachProfileComplete: boolean;
};

export function useRole() {
  // Fetch session state from server (source of truth for active role)
  const { data: session, isLoading: sessionLoading, error: sessionError } = useQuery<SessionState>({
    queryKey: ["/api/auth/session"],
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Also fetch profile data for detailed info
  const { data: athleteProfile, isLoading: athleteLoading } = useQuery<AthleteProfile>({
    queryKey: ["/api/profiles/athlete"],
    retry: false,
    enabled: session?.hasAthleteProfile || false,
  });

  const { data: coachProfile, isLoading: coachLoading } = useQuery<CoachProfile>({
    queryKey: ["/api/profiles/coach"],
    retry: false,
    enabled: session?.hasCoachProfile || false,
  });

  // Mutation to enter a role
  const enterRoleMutation = useMutation({
    mutationFn: async (role: 'athlete' | 'coach') => {
      const res = await apiRequest("POST", "/api/auth/enter-role", { role });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
    },
  });

  // Mutation to exit role
  const exitRoleMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/exit-role");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
      // Navigate to landing page after exit - user can choose their role from there
      window.location.href = "/";
    },
  });

  // Determine if user is not logged in (401 error from session)
  const isNotAuthenticated = sessionError !== null;

  // Get role info from session
  const activeRole = session?.activeRole || null;
  const hasAthleteProfile = session?.hasAthleteProfile || false;
  const hasCoachProfile = session?.hasCoachProfile || false;
  const athleteProfileComplete = session?.athleteProfileComplete || false;
  const coachProfileComplete = session?.coachProfileComplete || false;
  const hasBothProfiles = hasAthleteProfile && hasCoachProfile;
  const needsRoleSelection = hasBothProfiles && !activeRole;
  
  // Determine if onboarding is needed for a specific role
  const athleteNeedsOnboarding = hasAthleteProfile && !athleteProfileComplete;
  const coachNeedsOnboarding = hasCoachProfile && !coachProfileComplete;

  const isLoading = sessionLoading || (hasAthleteProfile && athleteLoading) || (hasCoachProfile && coachLoading);

  // Set role function that calls the API
  const setActiveRole = async (role: ActiveRole) => {
    if (role) {
      await enterRoleMutation.mutateAsync(role);
    } else {
      await exitRoleMutation.mutateAsync();
    }
  };

  // Clear role function
  const clearRole = async () => {
    await exitRoleMutation.mutateAsync();
  };

  // Effective role is the active role from server
  const effectiveRole = activeRole;

  return {
    activeRole,
    effectiveRole,
    setActiveRole,
    clearRole,
    isLoading,
    hasAthleteProfile,
    hasCoachProfile,
    hasBothProfiles,
    needsRoleSelection,
    athleteProfile,
    coachProfile,
    athleteProfileComplete,
    coachProfileComplete,
    athleteNeedsOnboarding,
    coachNeedsOnboarding,
    isAthlete: effectiveRole === "athlete",
    isCoach: effectiveRole === "coach",
    isEnteringRole: enterRoleMutation.isPending,
    isExitingRole: exitRoleMutation.isPending,
  };
}
