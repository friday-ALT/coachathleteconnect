export type ActiveRole = 'athlete' | 'coach' | null;

export type AuthSessionSnapshot = {
  activeRole: ActiveRole;
  hasAthleteProfile: boolean;
  hasCoachProfile: boolean;
  athleteProfileComplete?: boolean;
  coachProfileComplete?: boolean;
};

type PreferredRole = 'athlete' | 'coach' | null | undefined;

/** Where to send the user immediately after login or signup. */
export function getPostAuthPath(
  session: AuthSessionSnapshot | null | undefined,
  preferredRole?: PreferredRole,
): string {
  if (!session) {
    if (preferredRole === 'athlete') return '/auth/onboarding/athlete/step1';
    if (preferredRole === 'coach') return '/auth/onboarding/coach/step1';
    return '/auth/role-selection';
  }

  const {
    activeRole,
    hasAthleteProfile,
    hasCoachProfile,
    athleteProfileComplete = true,
    coachProfileComplete = true,
  } = session;

  if (!hasAthleteProfile && !hasCoachProfile) {
    if (preferredRole === 'athlete') return '/auth/onboarding/athlete/step1';
    if (preferredRole === 'coach') return '/auth/onboarding/coach/step1';
    return '/auth/role-selection';
  }

  const effectiveRole = activeRole ?? preferredRole ?? null;

  if (effectiveRole === 'athlete') {
    if (!hasAthleteProfile) return '/auth/onboarding/athlete/step1';
    if (!athleteProfileComplete) return '/auth/onboarding/athlete/step1';
    return '/athlete/dashboard';
  }

  if (effectiveRole === 'coach') {
    if (!hasCoachProfile) return '/auth/onboarding/coach/step1';
    if (!coachProfileComplete) return '/auth/onboarding/coach/step1';
    return '/coach/dashboard';
  }

  if (hasAthleteProfile && hasCoachProfile) {
    return '/auth/role-selection';
  }

  if (hasAthleteProfile) {
    if (!athleteProfileComplete) return '/auth/onboarding/athlete/step1';
    return '/athlete/dashboard';
  }

  if (hasCoachProfile) {
    if (!coachProfileComplete) return '/auth/onboarding/coach/step1';
    return '/coach/dashboard';
  }

  return '/auth/role-selection';
}

export function getSignupSuccessPath(role: string | null): string {
  if (role === 'athlete') return '/auth/onboarding/athlete/step1';
  if (role === 'coach') return '/auth/onboarding/coach/step1';
  return '/auth/role-selection';
}

/** Map web post-auth paths to Expo Router paths. */
export function mapPostAuthPathToMobile(
  webPath: string,
  session?: AuthSessionSnapshot | null,
): string {
  if (webPath === '/athlete/dashboard') return '/(athlete)/home';
  if (webPath === '/coach/dashboard') return '/(coach)/home';
  if (webPath === '/auth/role-selection') {
    const hasAny = session?.hasAthleteProfile || session?.hasCoachProfile;
    return hasAny ? '/role-select' : '/auth/role-selection';
  }
  if (webPath.startsWith('/auth/onboarding/')) return webPath;
  if (webPath === '/auth/get-started') return '/welcome';
  return '/welcome';
}
