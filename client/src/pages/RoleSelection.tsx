import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Trophy, ArrowRight, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Loader2 } from "lucide-react";

export default function RoleSelection() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasAthleteProfile, hasCoachProfile, isLoading: roleLoading } = useRole();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/auth/login");
  }, [authLoading, isAuthenticated, setLocation]);

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <h1 className="mb-1 text-2xl md:text-3xl font-bold text-center">
          {hasAthleteProfile || hasCoachProfile ? "Add Another Role" : "Choose Your Role"}
        </h1>
        <p className="mb-10 text-center text-muted-foreground text-sm max-w-xs">
          {hasAthleteProfile || hasCoachProfile
            ? "Add a second role to your account"
            : "Are you an athlete looking for coaching, or a coach offering training?"}
        </p>

        <div className="w-full max-w-sm space-y-4">
          {/* Athlete card */}
          <Card
            className={`p-5 cursor-pointer transition-all hover:border-primary ${
              hasAthleteProfile ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={() => !hasAthleteProfile && setLocation("/auth/onboarding/athlete/step1")}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">I'm an Athlete</h3>
                <p className="text-xs text-muted-foreground">Find coaches and book training sessions</p>
              </div>
              {hasAthleteProfile ? (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Done</span>
              ) : (
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </Card>

          {/* Coach card */}
          <Card
            className={`p-5 cursor-pointer transition-all hover:border-primary ${
              hasCoachProfile ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={() => !hasCoachProfile && setLocation("/auth/onboarding/coach/step1")}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">I'm a Coach</h3>
                <p className="text-xs text-muted-foreground">Share your expertise and get discovered</p>
              </div>
              {hasCoachProfile ? (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Done</span>
              ) : (
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </Card>

          {/* If both profiles already exist, go to dashboard */}
          {hasAthleteProfile && hasCoachProfile && (
            <Button className="w-full mt-2" onClick={() => setLocation("/")}>
              Go to Dashboard
            </Button>
          )}
        </div>

        <p className="mt-8 text-xs text-center text-muted-foreground max-w-xs">
          You can always add or switch roles later from your profile settings.
        </p>
      </div>
    </div>
  );
}
