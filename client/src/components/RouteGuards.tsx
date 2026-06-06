import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useLocation } from "wouter";
import { SquareGridLoader } from "@/components/SquareGridLoader";

interface RouteGuardProps {
  children: React.ReactNode;
}

export function AthleteRouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAthlete, isCoach, isLoading: roleLoading, hasAthleteProfile, athleteProfileComplete } = useRole();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!isAuthenticated) {
      setLocation(`/auth/login?redirect=${encodeURIComponent(location)}`);
      return;
    }
    if (!hasAthleteProfile) {
      setLocation("/auth/onboarding/athlete/step1");
      return;
    }
    if (!athleteProfileComplete) {
      setLocation("/auth/onboarding/athlete/step1");
      return;
    }
    if (!isAthlete) {
      if (isCoach) setLocation("/coach/dashboard");
      else setLocation("/auth/role-selection");
    }
  }, [authLoading, isAuthenticated, roleLoading, hasAthleteProfile, athleteProfileComplete, isAthlete, isCoach, location, setLocation]);

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <SquareGridLoader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !isAthlete) return null;

  return <>{children}</>;
}

export function CoachRouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isCoach, isAthlete, isLoading: roleLoading, hasCoachProfile, coachProfileComplete } = useRole();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!isAuthenticated) {
      setLocation(`/auth/login?redirect=${encodeURIComponent(location)}`);
      return;
    }
    if (!hasCoachProfile) {
      setLocation("/auth/onboarding/coach/step1");
      return;
    }
    if (!coachProfileComplete) {
      setLocation("/auth/onboarding/coach/step1");
      return;
    }
    if (!isCoach) {
      if (isAthlete) setLocation("/athlete/dashboard");
      else setLocation("/auth/role-selection");
    }
  }, [authLoading, isAuthenticated, roleLoading, hasCoachProfile, coachProfileComplete, isCoach, isAthlete, location, setLocation]);

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <SquareGridLoader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !isCoach) return null;

  return <>{children}</>;
}

/** Requires auth only — no role check. Used for shared pages like Reviews. */
export function AuthGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation(`/auth/login?redirect=${encodeURIComponent(location)}`);
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <SquareGridLoader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
