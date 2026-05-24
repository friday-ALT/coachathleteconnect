import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2, Search, Calendar, Star, Users, ChevronRight,
  ArrowRight, Trophy, AlertCircle, CheckCircle2, Clock,
} from "lucide-react";

export default function AthleteDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const {
    isLoading: roleLoading,
    hasAthleteProfile,
    athleteProfile,
    athleteProfileComplete,
    isAthlete,
    hasBothProfiles,
    setActiveRole,
  } = useRole();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Auth guards
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/auth/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  useEffect(() => {
    if (!roleLoading && !authLoading && isAuthenticated) {
      if (!hasAthleteProfile) { setLocation("/auth/onboarding/athlete/step1"); return; }
      if (!athleteProfileComplete) { setLocation("/auth/onboarding/athlete/step1"); return; }
      if (!isAthlete) { setLocation("/"); return; }
    }
  }, [roleLoading, authLoading, isAuthenticated, hasAthleteProfile, athleteProfileComplete, isAthlete, setLocation]);

  // Data fetching
  const { data: connections = [], isLoading: connectionsLoading } = useQuery<any[]>({
    queryKey: ["/api/connections", "athlete"],
    queryFn: async () => {
      const res = await fetch("/api/connections?role=athlete", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAthlete,
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery<any[]>({
    queryKey: ["/api/requests", "athlete"],
    queryFn: async () => {
      const res = await fetch("/api/requests?role=athlete", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAthlete,
  });

  const { data: pendingReviews = [] } = useQuery<any[]>({
    queryKey: ["/api/reviews/pending"],
    queryFn: async () => {
      const res = await fetch("/api/reviews/pending", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAthlete,
  });

  const { data: myReviews = [] } = useQuery<any[]>({
    queryKey: ["/api/reviews/my-reviews"],
    queryFn: async () => {
      const res = await fetch("/api/reviews/my-reviews", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAthlete,
  });

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAthlete || !athleteProfile) return null;

  const acceptedConnections = connections.filter((c: any) => c.status === "ACCEPTED");
  const pendingConnections = connections.filter((c: any) => c.status === "PENDING");
  const acceptedSessions = requests.filter((r: any) => r.status === "ACCEPTED");
  const pendingSessions = requests.filter((r: any) => r.status === "PENDING");
  const upcomingSession = acceptedSessions[0];

  const firstName = user?.firstName || athleteProfile.skillLevel || "Athlete";

  const stats = [
    {
      label: "Connected Coaches",
      value: acceptedConnections.length,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      href: "/athlete/connections",
    },
    {
      label: "Upcoming Sessions",
      value: acceptedSessions.length,
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      href: "/athlete/sessions",
    },
    {
      label: "Pending Requests",
      value: pendingSessions.length,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      href: "/athlete/sessions",
    },
    {
      label: "Reviews Left",
      value: myReviews.length,
      icon: Star,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      href: "/reviews",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Welcome back</p>
          <h1 className="text-3xl md:text-4xl font-bold">
            {firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {athleteProfile.skillLevel} · {athleteProfile.locationCity}, {athleteProfile.locationState}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {hasBothProfiles && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveRole("coach")}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Switch to Coach
            </Button>
          )}
          <Link href="/athlete/find-coaches">
            <Button size="sm">
              <Search className="h-4 w-4 mr-2" />
              Find Coaches
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending reviews alert */}
      {pendingReviews.length > 0 && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-amber-800 dark:text-amber-300 text-sm">
              You have {pendingReviews.length} coach{pendingReviews.length > 1 ? "es" : ""} to review
            </p>
            <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
              Leave feedback to help other athletes find great coaches.
            </p>
          </div>
          <Link href="/reviews">
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 flex-shrink-0">
              Review Now
            </Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 h-full">
              <CardContent className="p-4 md:p-5">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Coaches */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">My Coaches</CardTitle>
              <Link href="/athlete/connections">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {connectionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : acceptedConnections.length > 0 ? (
                <div className="space-y-3">
                  {acceptedConnections.slice(0, 5).map((conn: any) => (
                    <div
                      key={conn.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conn.coachProfile?.avatarUrl || undefined} />
                        <AvatarFallback>
                          {conn.coachProfile?.name?.[0] || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {conn.coachProfile?.name || "Coach"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {conn.coachProfile?.locationCity}, {conn.coachProfile?.locationState}
                          {conn.coachProfile?.pricePerHour
                            ? ` · $${(conn.coachProfile.pricePerHour / 100).toFixed(0)}/hr`
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {conn.coachProfile?.ratingAvg > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {conn.coachProfile.ratingAvg.toFixed(1)}
                          </span>
                        )}
                        <Link href={`/coach/${conn.coachId}`}>
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                            Book
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium text-sm mb-1">No connected coaches yet</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Browse coaches and send a connection request to get started.
                  </p>
                  <Link href="/athlete/find-coaches">
                    <Button size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Browse Coaches
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Upcoming session */}
          {upcomingSession && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Upcoming Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-sm mb-1">
                  {upcomingSession.coachProfile?.name || "Your coach"}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {upcomingSession.requestedDate
                    ? new Date(upcomingSession.requestedDate).toLocaleDateString("en-GB", {
                        weekday: "long", month: "short", day: "numeric",
                      })
                    : "Date TBD"}
                  {upcomingSession.requestedTime ? ` at ${upcomingSession.requestedTime}` : ""}
                </p>
                <Link href="/athlete/sessions">
                  <Button size="sm" className="w-full">
                    View session
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Pending connections */}
          {pendingConnections.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Pending Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  {pendingConnections.length} connection request{pendingConnections.length > 1 ? "s" : ""} awaiting response
                </p>
                <Link href="/athlete/connections">
                  <Button size="sm" variant="outline" className="w-full">
                    Check Status
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Find a Coach", href: "/athlete/find-coaches", icon: Search },
                { label: "My Sessions", href: "/athlete/sessions", icon: Calendar },
                { label: "My Connections", href: "/athlete/connections", icon: Users },
                { label: "My Reviews", href: "/reviews", icon: Star },
                { label: "Edit Profile", href: "/athlete/profile", icon: CheckCircle2 },
              ].map((action) => (
                <Link key={action.label} href={action.href}>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2.5 text-sm">
                      <action.icon className="h-4 w-4 text-muted-foreground" />
                      {action.label}
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
