import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Trophy, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function RoleSelection() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/auth/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <h1 className="mb-2 text-3xl font-bold text-center">Welcome!</h1>
        <p className="mb-12 text-center text-muted-foreground max-w-sm">
          Let's get your profile set up. Are you an athlete or a coach?
        </p>

        {/* Role Cards */}
        <div className="w-full max-w-sm space-y-4">
          <Card 
            className="p-6 cursor-pointer hover:border-primary transition-colors"
            onClick={() => setLocation("/auth/onboarding/athlete/step1")}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">I'm an Athlete</h3>
                <p className="text-sm text-muted-foreground">
                  Find coaches and book sessions
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:border-primary transition-colors"
            onClick={() => setLocation("/auth/onboarding/coach/step1")}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">I'm a Coach</h3>
                <p className="text-sm text-muted-foreground">
                  Share your expertise and get discovered
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </div>

        <p className="mt-8 text-xs text-center text-muted-foreground max-w-sm">
          You can always add the other role later from your profile settings
        </p>
      </div>
    </div>
  );
}
