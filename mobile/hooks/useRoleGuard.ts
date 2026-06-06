import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from './useAuth';
import { useRole } from './useRole';

export function useAthleteRoleGuard() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    activeRole,
    hasAthleteProfile,
    athleteProfileComplete,
    isLoading: roleLoading,
  } = useRole();

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!isAuthenticated) {
      router.replace('/welcome');
      return;
    }
    if (!hasAthleteProfile || !athleteProfileComplete) {
      router.replace('/auth/onboarding/athlete/step1');
      return;
    }
    if (activeRole !== 'athlete') {
      router.replace('/role-select');
    }
  }, [
    authLoading,
    roleLoading,
    isAuthenticated,
    hasAthleteProfile,
    athleteProfileComplete,
    activeRole,
    router,
  ]);
}

export function useCoachRoleGuard() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    activeRole,
    hasCoachProfile,
    coachProfileComplete,
    isLoading: roleLoading,
  } = useRole();

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!isAuthenticated) {
      router.replace('/welcome');
      return;
    }
    if (!hasCoachProfile || !coachProfileComplete) {
      router.replace('/auth/onboarding/coach/step1');
      return;
    }
    if (activeRole !== 'coach') {
      router.replace('/role-select');
    }
  }, [
    authLoading,
    roleLoading,
    isAuthenticated,
    hasCoachProfile,
    coachProfileComplete,
    activeRole,
    router,
  ]);
}
