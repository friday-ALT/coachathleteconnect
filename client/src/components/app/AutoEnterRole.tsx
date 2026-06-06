import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";

/** Auto-enters athlete/coach mode when the user has only one profile (enables sidebar shell). */
export function AutoEnterRole() {
  const { isAuthenticated } = useAuth();
  const {
    effectiveRole,
    hasAthleteProfile,
    hasCoachProfile,
    needsRoleSelection,
    isLoading,
    setActiveRole,
  } = useRole();

  useEffect(() => {
    if (!isAuthenticated || isLoading || effectiveRole || needsRoleSelection) return;
    if (hasAthleteProfile && !hasCoachProfile) void setActiveRole("athlete");
    else if (hasCoachProfile && !hasAthleteProfile) void setActiveRole("coach");
  }, [
    isAuthenticated,
    isLoading,
    effectiveRole,
    needsRoleSelection,
    hasAthleteProfile,
    hasCoachProfile,
    setActiveRole,
  ]);

  return null;
}
