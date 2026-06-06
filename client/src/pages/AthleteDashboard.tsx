import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppPageSkeleton } from "@/components/app/AppPageSkeleton";
import {
  AppPageHeader,
  MetricCard,
  ActionBannerLink,
  PageSection,
  DataRow,
  EmptyState,
  AppPanel,
} from "@/components/app/AppPrimitives";
import {
  Loader2, Search, Calendar, Star, Users,
  Trophy, Clock,
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

  const { data: requests = [] } = useQuery<any[]>({
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
    return <AppPageSkeleton />;
  }

  if (!isAthlete || !athleteProfile) return null;

  const acceptedConnections = connections.filter((c: any) => c.status === "ACCEPTED");
  const pendingConnections = connections.filter((c: any) => c.status === "PENDING");
  const acceptedSessions = requests.filter((r: any) => r.status === "ACCEPTED");
  const pendingSessions = requests.filter((r: any) => r.status === "PENDING");
  const upcomingSession = acceptedSessions[0];

  const firstName = user?.firstName || athleteProfile.skillLevel || "Athlete";

  const headerActions = (
    <>
      {hasBothProfiles && (
        <Button variant="outline" size="sm" onClick={() => setActiveRole("coach")}>
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
    </>
  );

  return (
    <div className="container mx-auto max-w-7xl">
      <AppPageHeader
        label="Athlete mode"
        title={`Welcome back, ${firstName}`}
        subtitle={`${athleteProfile.skillLevel} · ${athleteProfile.locationCity}, ${athleteProfile.locationState}`}
        actions={headerActions}
      />

      {pendingReviews.length > 0 && (
        <ActionBannerLink
          title={`${pendingReviews.length} coach${pendingReviews.length > 1 ? "es" : ""} to review`}
          description="Leave feedback to help other athletes find great coaches."
          href="/athlete/reviews"
          actionLabel="Review now"
        />
      )}

      {upcomingSession && (
        <AppPanel highlight className="mb-6">
          <p className="helix-mono text-[var(--helix-green)] mb-2">Next session</p>
          <p className="font-semibold text-[var(--helix-gray-100)]">
            {upcomingSession.coachProfile?.name || "Your coach"}
          </p>
          <p className="text-sm text-[var(--helix-gray-500)] mt-1">
            {upcomingSession.requestedDate
              ? new Date(upcomingSession.requestedDate).toLocaleDateString("en-GB", {
                  weekday: "long", month: "short", day: "numeric",
                })
              : "Date TBD"}
            {upcomingSession.requestedTime ? ` at ${upcomingSession.requestedTime}` : ""}
          </p>
          <Link href="/athlete/sessions" className="inline-block mt-3">
            <Button size="sm">View session</Button>
          </Link>
        </AppPanel>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Connected coaches" value={acceptedConnections.length} icon={Users} href="/athlete/connections" />
        <MetricCard label="Upcoming sessions" value={acceptedSessions.length} icon={Calendar} href="/athlete/sessions" />
        <MetricCard label="Pending requests" value={pendingSessions.length} icon={Clock} href="/athlete/sessions" />
        <MetricCard label="Reviews left" value={myReviews.length} icon={Star} href="/athlete/reviews" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PageSection title="My coaches" href="/athlete/connections">
            {connectionsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--helix-green)]" />
              </div>
            ) : acceptedConnections.length > 0 ? (
              acceptedConnections.slice(0, 5).map((conn: any) => (
                <DataRow
                  key={conn.id}
                  avatar={
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conn.coachProfile?.avatarUrl || undefined} />
                      <AvatarFallback>{conn.coachProfile?.name?.[0] || "C"}</AvatarFallback>
                    </Avatar>
                  }
                  title={conn.coachProfile?.name || "Coach"}
                  subtitle={[
                    conn.coachProfile?.locationCity,
                    conn.coachProfile?.locationState,
                    conn.coachProfile?.pricePerHour
                      ? `$${(conn.coachProfile.pricePerHour / 100).toFixed(0)}/hr`
                      : null,
                  ].filter(Boolean).join(" · ")}
                  meta={
                    conn.coachProfile?.ratingAvg > 0 ? (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-[var(--helix-green)]" />
                        {conn.coachProfile.ratingAvg.toFixed(1)}
                      </span>
                    ) : null
                  }
                  actions={
                    <Link href={`/coach/${conn.coachId}`}>
                      <Button size="sm" variant="outline" className="text-xs h-7 px-2">Book</Button>
                    </Link>
                  }
                />
              ))
            ) : (
              <EmptyState
                icon={Users}
                title="No connected coaches yet"
                description="Browse coaches and send a connection request to get started."
                action={
                  <Link href="/athlete/find-coaches">
                    <Button size="sm"><Search className="h-4 w-4 mr-2" />Browse coaches</Button>
                  </Link>
                }
              />
            )}
          </PageSection>
        </div>

        <div className="space-y-5">
          {pendingConnections.length > 0 && (
            <ActionBannerLink
              title={`${pendingConnections.length} pending connection${pendingConnections.length > 1 ? "s" : ""}`}
              description="Awaiting coach response."
              href="/athlete/connections"
              actionLabel="Check status"
            />
          )}
          <AppPanel>
            <p className="text-sm font-semibold text-[var(--helix-gray-100)] mb-3">Quick actions</p>
            <div className="space-y-1">
              {[
                { label: "Find a coach", href: "/athlete/find-coaches" },
                { label: "My sessions", href: "/athlete/sessions" },
                { label: "My connections", href: "/athlete/connections" },
                { label: "My reviews", href: "/athlete/reviews" },
                { label: "Edit profile", href: "/athlete/profile" },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="block py-2 text-sm text-[var(--helix-gray-500)] hover:text-[var(--helix-green)] transition-colors">
                  {a.label}
                </Link>
              ))}
            </div>
          </AppPanel>
        </div>
      </div>
    </div>
  );
}
