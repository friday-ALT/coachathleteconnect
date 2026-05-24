import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Loader2, Users, DollarSign, Star, Calendar, ChevronRight,
  Check, X, User, MapPin, ArrowRight, Trophy, Clock, Inbox,
} from "lucide-react";

export default function CoachDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const {
    isLoading: roleLoading,
    hasCoachProfile,
    coachProfile,
    coachProfileComplete,
    isCoach,
    hasBothProfiles,
    setActiveRole,
  } = useRole();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) setLocation("/auth/login");
  }, [isAuthenticated, authLoading, setLocation]);

  useEffect(() => {
    if (!roleLoading && !authLoading && isAuthenticated) {
      if (!hasCoachProfile) { setLocation("/auth/onboarding/coach/step1"); return; }
      if (!coachProfileComplete) { setLocation("/auth/onboarding/coach/step1"); return; }
      if (!isCoach) { setLocation("/"); return; }
    }
  }, [roleLoading, authLoading, isAuthenticated, hasCoachProfile, coachProfileComplete, isCoach, setLocation]);

  // Data
  const { data: requests = [], isLoading: requestsLoading } = useQuery<any[]>({
    queryKey: ["/api/requests", "coach"],
    queryFn: async () => {
      const res = await fetch("/api/requests?role=coach", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isCoach,
    refetchInterval: 30_000,
  });

  const { data: connections = [], isLoading: connectionsLoading } = useQuery<any[]>({
    queryKey: ["/api/connections", "coach"],
    queryFn: async () => {
      const res = await fetch("/api/connections?role=coach", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isCoach,
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "ACCEPTED" | "DECLINED" }) => {
      return apiRequest("PATCH", `/api/requests/${id}`, { status });
    },
    onSuccess: (_, vars) => {
      toast({
        title: vars.status === "ACCEPTED" ? "✅ Request Accepted" : "Request Declined",
        description: `The session request has been ${vars.status.toLowerCase()}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateConnectionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "ACCEPTED" | "DECLINED" }) => {
      return apiRequest("PATCH", `/api/connections/${id}`, { status });
    },
    onSuccess: (_, vars) => {
      toast({
        title: vars.status === "ACCEPTED" ? "✅ Connection Accepted" : "Connection Declined",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isCoach || !coachProfile) return null;

  const pendingRequests = requests.filter((r: any) => r.status === "PENDING");
  const acceptedRequests = requests.filter((r: any) => r.status === "ACCEPTED");
  const acceptedConnections = connections.filter((c: any) => c.status === "ACCEPTED");
  const pendingConnections = connections.filter((c: any) => c.status === "PENDING");
  const totalPending = pendingRequests.length + pendingConnections.length;

  const stats = [
    {
      label: "Total Athletes",
      value: acceptedConnections.length,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      href: "/coach/athletes",
    },
    {
      label: "Upcoming Sessions",
      value: acceptedRequests.length,
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      href: "/coach/requests",
    },
    {
      label: "Rating",
      value: coachProfile.ratingAvg && coachProfile.ratingAvg > 0
        ? `${(coachProfile.ratingAvg as number).toFixed(1)}`
        : "—",
      icon: Star,
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      href: "/coach/profile",
    },
    {
      label: "Rate",
      value: `$${(coachProfile.pricePerHour / 100).toFixed(0)}/hr`,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      href: "/coach/profile",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={coachProfile.avatarUrl || undefined} alt={coachProfile.name} />
            <AvatarFallback className="text-lg">
              {coachProfile.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="text-2xl md:text-3xl font-bold">{coachProfile.name}</h1>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
              <MapPin className="h-3.5 w-3.5" />
              {coachProfile.locationCity}, {coachProfile.locationState}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {hasBothProfiles && (
            <Button variant="outline" size="sm" onClick={() => setActiveRole("athlete")}>
              <User className="h-4 w-4 mr-2" />
              Switch to Athlete
            </Button>
          )}
          <Link href="/coach/profile">
            <Button variant="outline" size="sm">Edit Profile</Button>
          </Link>
          <Link href="/coach/schedule">
            <Button size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              My Schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending alert banner */}
      {totalPending > 0 && (
        <div className="mb-6 flex items-center justify-between gap-3 p-4 rounded-xl bg-primary/8 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Inbox className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                {totalPending} pending item{totalPending > 1 ? "s" : ""} need{totalPending === 1 ? "s" : ""} your attention
              </p>
              <p className="text-xs text-muted-foreground">
                {pendingConnections.length > 0 && `${pendingConnections.length} connection request${pendingConnections.length > 1 ? "s" : ""}`}
                {pendingConnections.length > 0 && pendingRequests.length > 0 && " · "}
                {pendingRequests.length > 0 && `${pendingRequests.length} session request${pendingRequests.length > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <Link href="/coach/requests">
            <Button size="sm">
              Review Now
            </Button>
          </Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 h-full">
              <CardContent className="p-4 md:p-5">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending requests inline */}
        <div className="lg:col-span-2 space-y-5">
          {/* Pending session requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">Session Requests</CardTitle>
                {pendingRequests.length > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 h-5 min-w-5 flex items-center justify-center rounded-full">
                    {pendingRequests.length}
                  </Badge>
                )}
              </div>
              <Link href="/coach/requests">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  All requests <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : pendingRequests.length > 0 ? (
                <div className="space-y-3">
                  {pendingRequests.slice(0, 4).map((req: any) => (
                    <div
                      key={req.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage src={req.athleteUser?.profileImageUrl || undefined} />
                        <AvatarFallback className="text-sm">
                          {req.athleteUser?.firstName?.[0] || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {req.athleteUser?.firstName || "Athlete"} {req.athleteUser?.lastName || ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {req.requestedDate
                            ? new Date(req.requestedDate).toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" })
                            : "Date TBD"}
                          {req.requestedTime ? ` · ${req.requestedTime}` : ""}
                        </p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <Button
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.preventDefault();
                            updateRequestMutation.mutate({ id: req.id, status: "ACCEPTED" });
                          }}
                          disabled={updateRequestMutation.isPending}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.preventDefault();
                            updateRequestMutation.mutate({ id: req.id, status: "DECLINED" });
                          }}
                          disabled={updateRequestMutation.isPending}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No pending session requests</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending connections */}
          {pendingConnections.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold">Connection Requests</CardTitle>
                  <Badge className="bg-amber-500 text-white text-xs px-1.5 py-0.5 h-5 min-w-5 flex items-center justify-center rounded-full">
                    {pendingConnections.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingConnections.slice(0, 3).map((conn: any) => (
                    <div
                      key={conn.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg border bg-card"
                    >
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarFallback>
                          {conn.athleteProfile?.skillLevel?.[0] || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">Athlete</p>
                        <p className="text-xs text-muted-foreground">
                          {conn.athleteProfile?.skillLevel} · {conn.athleteProfile?.locationCity}
                        </p>
                        {conn.message && (
                          <p className="text-xs text-muted-foreground italic truncate">
                            &ldquo;{conn.message}&rdquo;
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <Button
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => updateConnectionMutation.mutate({ id: conn.id, status: "ACCEPTED" })}
                          disabled={updateConnectionMutation.isPending}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => updateConnectionMutation.mutate({ id: conn.id, status: "DECLINED" })}
                          disabled={updateConnectionMutation.isPending}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Coach profile card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-sm">
                  {coachProfile.ratingAvg && coachProfile.ratingAvg > 0
                    ? `${(coachProfile.ratingAvg as number).toFixed(1)} (${coachProfile.ratingCount} reviews)`
                    : "No reviews yet"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3 mb-4">
                {coachProfile.experience || "Add your experience to attract more athletes."}
              </p>
              <div className="flex flex-wrap gap-1 mb-4">
                {(coachProfile.specialties || []).slice(0, 3).map((s: string) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
              <Link href="/coach/profile">
                <Button variant="outline" size="sm" className="w-full">Edit Profile</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {[
                { label: "All Requests", href: "/coach/requests", icon: Inbox, badge: pendingRequests.length },
                { label: "My Schedule", href: "/coach/schedule", icon: Calendar },
                { label: "My Athletes", href: "/coach/athletes", icon: Users, badge: acceptedConnections.length },
                { label: "Edit Profile", href: "/coach/profile", icon: User },
              ].map((a) => (
                <Link key={a.label} href={a.href}>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2.5 text-sm">
                      <a.icon className="h-4 w-4 text-muted-foreground" />
                      {a.label}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {a.badge && a.badge > 0 ? (
                        <Badge className="h-4 min-w-4 px-1 text-[10px] rounded-full flex items-center justify-center">
                          {a.badge}
                        </Badge>
                      ) : null}
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
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
