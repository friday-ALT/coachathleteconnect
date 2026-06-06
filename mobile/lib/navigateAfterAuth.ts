import type { QueryClient } from '@tanstack/react-query';
import type { Router } from 'expo-router';
import { sessionApi } from './api';
import { resolveMobileAuthRoute } from './resolveAuthRoute';

/** Route user after login/signup/OAuth — aligned with web post-auth logic. */
export async function navigateAfterAuth(
  queryClient: QueryClient,
  router: Router,
  preferredRole?: 'athlete' | 'coach' | null,
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

  const path = await resolveMobileAuthRoute(session, preferredRole);
  router.replace(path as any);
}
