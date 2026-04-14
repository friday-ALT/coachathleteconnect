import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Inbox, MapPin, DollarSign, Star, Calendar, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CoachDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { 
    isLoading: roleLoading, 
    hasCoachProfile, 
    coachProfile,
    coachProfileComplete,
    isCoach,
    clearRole
  } = useRole();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to access the coach dashboard.",
        variant: "destructive",
      });
      setLocation("/login?role=coach");
      return;
    }
  }, [isAuthenticated, authLoading, toast, setLocation]);

  useEffect(() => {
    if (!roleLoading && !authLoading && isAuthenticated) {
      if (!hasCoachProfile) {
        setLocation("/onboarding?role=coach");
        return;
      }
      if (!coachProfileComplete) {
        setLocation("/onboarding?addRole=coach");
        return;
      }
      if (!isCoach) {
        setLocation("/");
        return;
      }
    }
  }, [roleLoading, authLoading, isAuthenticated, hasCoachProfile, coachProfileComplete, isCoach, setLocation]);

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

  if (!isCoach || !coachProfile) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold" data-testid="heading-coach-dashboard">
            Coach Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your profile and incoming training requests
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExitRole}
          data-testid="button-exit-role-dashboard"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Exit Coach Mode
        </Button>
      </div>

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
            <Link href="/coach/profile">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/coach/availability">
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

        <Link href="/coach/requests">
          <Card className="cursor-pointer hover-elevate active-elevate-2 transition-all h-full" data-testid="card-training-requests">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Inbox className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Incoming Requests</CardTitle>
              <CardDescription>
                Manage incoming requests from athletes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full">View Requests</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/coach/profile">
          <Card className="cursor-pointer hover-elevate active-elevate-2 transition-all h-full" data-testid="card-coach-profile">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>
                Update your coach profile and bio
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
