import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Loader2 } from "lucide-react";

/**
 * Legacy /dashboard route - thin redirect hub.
 * Real dashboards live at /athlete/dashboard and /coach/dashboard.
 */
export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    isLoading: roleLoading,
    isAthlete,
    isCoach,
    hasAthleteProfile,
    hasCoachProfile,
    needsRoleSelection,
  } = useRole();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!isAuthenticated) {
      setLocation("/welcome");
      return;
    }

    if (isAthlete) {
      setLocation("/athlete/dashboard");
      return;
    }

    if (isCoach) {
      setLocation("/coach/dashboard");
      return;
    }

    // Has both profiles but no active role chosen yet
    if (needsRoleSelection) {
      setLocation("/auth/role-selection");
      return;
    }

    // Has no profile at all
    if (!hasAthleteProfile && !hasCoachProfile) {
      setLocation("/auth/role-selection");
      return;
    }
  }, [authLoading, roleLoading, isAuthenticated, isAthlete, isCoach, needsRoleSelection, hasAthleteProfile, hasCoachProfile, setLocation]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
