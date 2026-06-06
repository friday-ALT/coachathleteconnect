import {
  getPostAuthPath,
  mapPostAuthPathToMobile,
  type AuthSessionSnapshot,
} from '@shared/postAuthNavigation';
import { sessionApi } from './api';

/** Auto-enter role when user has exactly one complete profile (matches web AutoEnterRole). */
export async function maybeEnterSingleRole(
  session: AuthSessionSnapshot,
): Promise<AuthSessionSnapshot> {
  if (session.activeRole) return session;

  if (
    session.hasAthleteProfile &&
    !session.hasCoachProfile &&
    session.athleteProfileComplete !== false
  ) {
    await sessionApi.enterRole('athlete');
    return { ...session, activeRole: 'athlete' };
  }

  if (
    session.hasCoachProfile &&
    !session.hasAthleteProfile &&
    session.coachProfileComplete !== false
  ) {
    await sessionApi.enterRole('coach');
    return { ...session, activeRole: 'coach' };
  }

  return session;
}

export async function resolveMobileAuthRoute(
  session: AuthSessionSnapshot | null,
  preferredRole?: 'athlete' | 'coach' | null,
): Promise<string> {
  let effective = session;
  if (effective) {
    effective = await maybeEnterSingleRole(effective);
  }
  const webPath = getPostAuthPath(effective, preferredRole);
  return mapPostAuthPathToMobile(webPath, effective);
}
