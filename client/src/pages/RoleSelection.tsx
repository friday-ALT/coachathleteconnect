import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { HelixAuthLayout, HelixRoleCard } from "@/components/app/HelixAuthLayout";
import { AppPageSkeleton } from "@/components/app/AppPageSkeleton";

export default function RoleSelection() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasAthleteProfile, hasCoachProfile, isLoading: roleLoading } = useRole();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/auth/login");
  }, [authLoading, isAuthenticated, setLocation]);

  if (authLoading || roleLoading) {
    return (
      <HelixAuthLayout title="Choose role" backHref="/auth/login">
        <AppPageSkeleton variant="form" />
      </HelixAuthLayout>
    );
  }

  if (!isAuthenticated) return null;

  const hasAny = hasAthleteProfile || hasCoachProfile;

  return (
    <HelixAuthLayout
      title={hasAny ? "Add another role" : "Choose your role"}
      lead={
        hasAny
          ? "Add a second role to your account. You can switch between them anytime."
          : "Are you an athlete looking for coaching, or a coach offering training?"
      }
      backHref="/auth/login"
    >
      <div className="space-y-3">
        <HelixRoleCard
          icon={Users}
          title="I'm an athlete"
          description="Find coaches and book training sessions"
          done={hasAthleteProfile}
          onClick={() => setLocation("/auth/onboarding/athlete/step1")}
        />
        <HelixRoleCard
          icon={Trophy}
          title="I'm a coach"
          description="Share your expertise and get discovered"
          done={hasCoachProfile}
          onClick={() => setLocation("/auth/onboarding/coach/step1")}
        />
      </div>

      {hasAthleteProfile && hasCoachProfile && (
        <Button className="w-full mt-6 h-12" onClick={() => setLocation("/athlete/dashboard")}>
          Continue to app
        </Button>
      )}

      <p className="mt-8 text-xs text-center text-[var(--helix-gray-500)]">
        You can add or switch roles later from the sidebar or command palette.
      </p>
    </HelixAuthLayout>
  );
}
