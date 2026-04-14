import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { MapPin, DollarSign, Star, Users, TrendingUp, Calendar } from "lucide-react";
import { Link } from "wouter";
import type { CoachProfile } from "@shared/schema";
import RequestManagement from "./RequestManagement";
import CoachScheduleTemplate from "./CoachScheduleTemplate";

export default function CoachDashboard() {
  const { data: coachProfile, isLoading } = useQuery<CoachProfile>({
    queryKey: ["/api/profiles/coach"],
  });

  if (isLoading || !coachProfile) {
    return null;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Coach Profile Overview */}
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="mb-6 md:mb-8">
          <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold">Coach Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your profile and incoming training requests
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-3 mb-6 md:mb-8">
          {/* Profile Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                  <Avatar className="h-12 w-12 md:h-16 md:w-16">
                    <AvatarImage src={coachProfile.avatarUrl || undefined} alt={coachProfile.name} />
                    <AvatarFallback className="text-base md:text-xl">
                      {coachProfile.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-xl md:text-2xl" data-testid="text-coach-name">
                      {coachProfile.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                      <span data-testid="text-coach-location">
                        {coachProfile.locationCity}, {coachProfile.locationState}
                      </span>
                    </div>
                  </div>
                </div>
                <Link href="/profile" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto min-h-[44px]" data-testid="button-edit-profile">
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm md:text-base font-semibold" data-testid="text-coach-price">
                    ${(coachProfile.pricePerHour / 100).toFixed(0)}/hr
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm md:text-base font-semibold" data-testid="text-coach-rating">
                    {(coachProfile.ratingAvg ?? 0) > 0 
                      ? `${(coachProfile.ratingAvg ?? 0).toFixed(1)} (${coachProfile.ratingCount ?? 0} reviews)`
                      : "No reviews yet"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Rating</span>
                </div>
                <Badge variant={(coachProfile.ratingCount ?? 0) > 0 ? "default" : "secondary"}>
                  {(coachProfile.ratingCount ?? 0) > 0 ? `${(coachProfile.ratingAvg ?? 0).toFixed(1)} ⭐` : "New"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Reviews</span>
                </div>
                <Badge variant="secondary">{coachProfile.ratingCount ?? 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Status</span>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How to Get Discovered */}
        {(coachProfile.ratingCount ?? 0) === 0 && (
          <Card className="bg-primary/5 border-primary/20 mb-8">
            <CardHeader>
              <CardTitle className="text-lg">🎯 How to Get Discovered by Athletes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>✅ Your profile is now <strong>live and visible</strong> to all athletes on the browse page</p>
              <p>✅ Athletes can find you by searching for: <strong>{coachProfile.locationCity}</strong></p>
              <p>✅ When athletes request sessions, they'll appear in "Training Requests" below</p>
              <div className="pt-4">
                <Link href="/browse">
                  <Button variant="outline" className="w-full" data-testid="button-view-public-profile">
                    View Your Public Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Training Schedule Template */}
      <div className="container mx-auto px-4 max-w-7xl">
        <CoachScheduleTemplate />
      </div>

      {/* Request Management */}
      <RequestManagement isAthleteView={false} />
    </div>
  );
}
