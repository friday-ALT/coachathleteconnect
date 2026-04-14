import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface RouteGuardProps {
  children: React.ReactNode;
}

export function AthleteRouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAthlete, isLoading: roleLoading, hasAthleteProfile, athleteProfileComplete, activeRole } = useRole();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login?role=athlete");
      return;
    }
    if (!roleLoading && !authLoading && isAuthenticated) {
      if (!hasAthleteProfile) {
        setLocation("/onboarding?role=athlete");
        return;
      }
      if (!athleteProfileComplete) {
        setLocation("/onboarding?addRole=athlete");
        return;
      }
      // If user has profile but hasn't entered athlete role, redirect to landing page
      if (!isAthlete) {
        // If they're in coach role or have no active role, redirect to landing
        setLocation("/");
        return;
      }
    }
  }, [authLoading, isAuthenticated, roleLoading, hasAthleteProfile, athleteProfileComplete, isAthlete, activeRole, setLocation]);

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAthlete) {
    return null;
  }

  return <>{children}</>;
}

export function CoachRouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isCoach, isLoading: roleLoading, hasCoachProfile, coachProfileComplete, activeRole } = useRole();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login?role=coach");
      return;
    }
    if (!roleLoading && !authLoading && isAuthenticated) {
      if (!hasCoachProfile) {
        setLocation("/onboarding?role=coach");
        return;
      }
      if (!coachProfileComplete) {
        setLocation("/onboarding?addRole=coach");
        return;
      }
      // If user has profile but hasn't entered coach role, redirect to landing page
      if (!isCoach) {
        // If they're in athlete role or have no active role, redirect to landing
        setLocation("/");
        return;
      }
    }
  }, [authLoading, isAuthenticated, roleLoading, hasCoachProfile, coachProfileComplete, isCoach, activeRole, setLocation]);

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isCoach) {
    return null;
  }

  return <>{children}</>;
}
