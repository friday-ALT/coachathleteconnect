import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Loader2, Search, Inbox, LogOut } from "lucide-react";

export default function AthleteDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { 
    isLoading: roleLoading, 
    hasAthleteProfile, 
    athleteProfile,
    athleteProfileComplete,
    isAthlete,
    clearRole,
    hasBothProfiles
  } = useRole();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to access the athlete dashboard.",
        variant: "destructive",
      });
      setLocation("/login?role=athlete");
      return;
    }
  }, [isAuthenticated, authLoading, toast, setLocation]);

  useEffect(() => {
    if (!roleLoading && !authLoading && isAuthenticated) {
      if (!hasAthleteProfile) {
        setLocation("/onboarding?role=athlete");
        return;
      }
      if (!athleteProfileComplete) {
        setLocation("/onboarding?addRole=athlete");
        return;
      }
      if (!isAthlete) {
        setLocation("/");
        return;
      }
    }
  }, [roleLoading, authLoading, isAuthenticated, hasAthleteProfile, athleteProfileComplete, isAthlete, setLocation]);

  const handleExitRole = async () => {
    await clearRole();
    setLocation("/");
  };

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAthlete || !athleteProfile) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      <div className="mb-6 md:mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold" data-testid="heading-athlete-dashboard">
            Athlete Dashboard
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Find coaches and manage your training sessions
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExitRole}
          data-testid="button-exit-role-dashboard"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Exit Athlete Mode
        </Button>
      </div>

      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/athlete/find-coaches">
          <Card className="cursor-pointer hover-elevate active-elevate-2 transition-all h-full" data-testid="card-browse-coaches">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Find Coaches</CardTitle>
              <CardDescription>
                Browse and filter coaches by location, skill level, and price
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">Browse Coaches</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/athlete/requests">
          <Card className="cursor-pointer hover-elevate active-elevate-2 transition-all h-full" data-testid="card-my-requests">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Inbox className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>My Requests</CardTitle>
              <CardDescription>
                View your sent training requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">View Requests</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/athlete/profile">
          <Card className="cursor-pointer hover-elevate active-elevate-2 transition-all h-full" data-testid="card-profile">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>
                Update your athlete profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">Edit Profile</Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
