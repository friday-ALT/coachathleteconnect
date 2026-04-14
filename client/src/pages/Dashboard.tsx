import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Trophy, Loader2, Search, Inbox, MapPin, DollarSign, Star, Home, Calendar, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { 
    activeRole, 
    setActiveRole,
    isLoading: roleLoading, 
    hasAthleteProfile, 
    hasCoachProfile,
    hasBothProfiles,
    needsRoleSelection,
    athleteProfile,
    coachProfile,
    athleteProfileComplete,
    coachProfileComplete,
    athleteNeedsOnboarding,
    coachNeedsOnboarding,
    isAthlete,
    isCoach
  } = useRole();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Redirect to onboarding if no profiles or if any profiles are incomplete
  const profilesChecked = !roleLoading;
  const hasNoProfiles = !hasAthleteProfile && !hasCoachProfile;
  
  // Check if any incomplete profiles exist that need finishing
  // Users must complete ALL their profiles before accessing dashboard
  const needsAthleteOnboarding = hasAthleteProfile && !athleteProfileComplete;
  const needsCoachOnboarding = hasCoachProfile && !coachProfileComplete;
  
  useEffect(() => {
    if (profilesChecked && hasNoProfiles) {
      setLocation("/onboarding");
      return;
    }
    // Redirect to complete any incomplete profile first
    // Priority: athlete > coach (athlete is typically the first choice)
    if (profilesChecked && needsAthleteOnboarding) {
      setLocation("/onboarding?addRole=athlete");
      return;
    }
    if (profilesChecked && needsCoachOnboarding) {
      setLocation("/onboarding?addRole=coach");
      return;
    }
  }, [profilesChecked, hasNoProfiles, setLocation, needsAthleteOnboarding, needsCoachOnboarding]);

  // Redirect to role-specific dashboards
  useEffect(() => {
    if (!roleLoading && isAthlete) {
      setLocation("/athlete/dashboard");
    }
    if (!roleLoading && isCoach) {
      setLocation("/coach/dashboard");
    }
  }, [roleLoading, isAthlete, isCoach, setLocation]);

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Athlete Dashboard (single role or active role) - legacy fallback
  if (isAthlete && athleteProfile) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="mb-6 md:mb-8">
          <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold">Athlete Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Find coaches and manage your training sessions
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/browse">
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

          <Link href="/requests">
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

          <Link href="/profile">
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

          {hasBothProfiles && (
            <Link href="/">
              <Card className="cursor-pointer hover-elevate active-elevate-2 transition-all h-full border-dashed" data-testid="card-switch-to-coach">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Switch to Coach Mode</CardTitle>
                  <CardDescription>
                    Go to home page to switch to your coach profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">Switch Role</Button>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Coach Dashboard (single role or active role)
  if (isCoach && coachProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Coach Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your profile and incoming training requests
          </p>
        </div>

        {/* Coach Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={coachProfile.avatarUrl || undefined} alt={coachProfile.name} />
                  <AvatarFallback className="text-xl">
                    {coachProfile.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl" data-testid="text-coach-name">
                    {coachProfile.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span data-testid="text-coach-location">
                      {coachProfile.locationCity}, {coachProfile.locationState}
                    </span>
                  </div>
                </div>
              </div>
              <Link href="/profile">
                <Button variant="outline" data-testid="button-edit-profile">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Experience</h3>
              <p className="text-sm text-muted-foreground" data-testid="text-coach-experience">
                {coachProfile.experience}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold" data-testid="text-coach-price">
                  ${(coachProfile.pricePerHour / 100).toFixed(0)}/hr
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold" data-testid="text-coach-rating">
                  {(coachProfile.ratingAvg ?? 0) > 0 
                    ? `${(coachProfile.ratingAvg ?? 0).toFixed(1)} (${coachProfile.ratingCount ?? 0} reviews)`
                    : "No reviews yet"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href={`/coach/${user?.id}`}>
            <Card className="cursor-pointer hover-elevate active-elevate-2 transition-all h-full" data-testid="card-manage-availability">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>My Availability</CardTitle>
                <CardDescription>
                  Set your weekly schedule and manage available time slots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">Manage Availability</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/requests">
            <Card className="cursor-pointer hover-elevate active-elevate-2 transition-all h-full" data-testid="card-training-requests">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Inbox className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Training Requests</CardTitle>
                <CardDescription>
                  Manage incoming requests from athletes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">View Requests</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/browse?tab=athletes">
            <Card className="cursor-pointer hover-elevate active-elevate-2 transition-all h-full" data-testid="card-find-athletes">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Find Athletes</CardTitle>
                <CardDescription>
                  Search for athletes looking for training in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">Browse Athletes</Button>
              </CardContent>
            </Card>
          </Link>

          {hasBothProfiles && (
            <Link href="/">
              <Card className="cursor-pointer hover-elevate active-elevate-2 transition-all h-full border-dashed" data-testid="card-switch-to-athlete">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Switch to Athlete Mode</CardTitle>
                  <CardDescription>
                    Go to home page to switch to your athlete profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">Switch Role</Button>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Both profiles but no active role selected - show role selection
  if (needsRoleSelection) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-center text-4xl font-bold">Choose Your Role</h1>
        <p className="mb-8 text-center text-muted-foreground">
          You have both athlete and coach profiles. Select which mode you'd like to use.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <Card
            className="min-h-48 cursor-pointer hover-elevate active-elevate-2 transition-all"
            data-testid="card-role-athlete"
            onClick={async () => {
              await setActiveRole("athlete");
              setLocation("/athlete/dashboard");
            }}
          >
            <CardHeader className="items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Athlete Mode</CardTitle>
              <CardDescription>Search for coaches and book training sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">Enter as Athlete</Button>
            </CardContent>
          </Card>

          <Card
            className="min-h-48 cursor-pointer hover-elevate active-elevate-2 transition-all"
            data-testid="card-role-coach"
            onClick={async () => {
              await setActiveRole("coach");
              setLocation("/coach/dashboard");
            }}
          >
            <CardHeader className="items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Coach Mode</CardTitle>
              <CardDescription>Manage your requests and connect with athletes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">Enter as Coach</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
