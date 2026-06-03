import type { QueryClient } from '@tanstack/react-query';
import type { Router } from 'expo-router';
import { sessionApi } from './api';

/** Route user after login/signup/OAuth — same logic as app index splash. */
export async function navigateAfterAuth(
  queryClient: QueryClient,
  router: Router,
) {
  await Promise.all([
    queryClient.refetchQueries({ queryKey: ['user'] }),
    queryClient.refetchQueries({ queryKey: ['session'] }),
  ]);

  let session: Awaited<ReturnType<typeof sessionApi.getSession>> | null = null;
  try {
    session = await sessionApi.getSession();
  } catch {
    router.replace('/auth/role-selection');
    return;
  }

  if (!session?.hasAthleteProfile && !session?.hasCoachProfile) {
    router.replace('/auth/role-selection');
  } else if (!session.activeRole) {
    router.replace('/role-select');
  } else if (session.activeRole === 'athlete') {
    router.replace('/(athlete)/home');
  } else {
    router.replace('/(coach)/home');
  }
}
