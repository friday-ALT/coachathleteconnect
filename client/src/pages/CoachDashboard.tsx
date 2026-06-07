import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AppPageSkeleton } from "@/components/app/AppPageSkeleton";
import {
  AppPageHeader,
  MetricCard,
  ActionBannerLink,
  PageSection,
  DataRow,
  EmptyState,
  AppPanel,
  GlossButton,
} from "@/components/app/AppPrimitives";
import {
  Loader2, Users, DollarSign, Star, Calendar,
  Check, X, User, MapPin,
} from "lucide-react";
import { CoachStripeConnect } from "@/components/CoachStripeConnect";

export default function CoachDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const {
    isLoading: roleLoading,
    hasCoachProfile,
    coachProfile,
    coachProfileComplete,
    isCoach,
    hasBothProfiles,
    switchToRole,
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
      if (!isCoach) { setLocation("/auth/role-selection"); return; }
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
    return <AppPageSkeleton />;
  }

  if (!isCoach || !coachProfile) return null;

  const pendingRequests = requests.filter((r: any) => r.status === "PENDING");
  const acceptedRequests = requests.filter((r: any) => r.status === "ACCEPTED");
  const acceptedConnections = connections.filter((c: any) => c.status === "ACCEPTED");
  const pendingConnections = connections.filter((c: any) => c.status === "PENDING");
  const totalPending = pendingRequests.length + pendingConnections.length;

  const ratingValue =
    coachProfile.ratingAvg && coachProfile.ratingAvg > 0
      ? `${(coachProfile.ratingAvg as number).toFixed(1)}`
      : "—";

  const headerActions = (
    <>
      {hasBothProfiles && (
        <Button variant="outline" size="sm" onClick={() => switchToRole("athlete", "/athlete/dashboard")}>
          <User className="h-4 w-4 mr-2" />
          Switch to Athlete
        </Button>
      )}
      <Link href="/coach/profile">
        <Button variant="outline" size="sm">Edit profile</Button>
      </Link>
      <GlossButton asChild size="sm">
        <Link href="/coach/schedule">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule
        </Link>
      </GlossButton>
    </>
  );

  const pendingDetail = [
    pendingConnections.length > 0 && `${pendingConnections.length} connection${pendingConnections.length > 1 ? "s" : ""}`,
    pendingRequests.length > 0 && `${pendingRequests.length} session request${pendingRequests.length > 1 ? "s" : ""}`,
  ].filter(Boolean).join(" · ");

  return (
    <div className="container mx-auto max-w-7xl">
      <AppPageHeader
        label="Coach mode"
        title={coachProfile.name}
        subtitle={
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {coachProfile.locationCity}, {coachProfile.locationState}
          </span>
        }
        actions={headerActions}
      />

      {totalPending > 0 && (
        <ActionBannerLink
          title={`${totalPending} pending item${totalPending > 1 ? "s" : ""} need your attention`}
          description={pendingDetail}
          href="/coach/requests"
          actionLabel="Review now"
        />
      )}

      <div className="mb-5">
        <CoachStripeConnect />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total athletes" value={acceptedConnections.length} icon={Users} href="/coach/athletes" />
        <MetricCard label="Upcoming sessions" value={acceptedRequests.length} icon={Calendar} href="/coach/requests" />
        <MetricCard label="Rating" value={ratingValue} icon={Star} href="/coach/profile" />
        <MetricCard label="Rate" value={`$${(coachProfile.pricePerHour / 100).toFixed(0)}/hr`} icon={DollarSign} href="/coach/profile" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <PageSection title="Session requests" href="/coach/requests" badge={pendingRequests.length}>
            {requestsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--helix-green)]" />
              </div>
            ) : pendingRequests.length > 0 ? (
              pendingRequests.slice(0, 4).map((req: any) => (
                <DataRow
                  key={req.id}
                  avatar={
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={req.athleteUser?.profileImageUrl || undefined} />
                      <AvatarFallback>{req.athleteUser?.firstName?.[0] || "A"}</AvatarFallback>
                    </Avatar>
                  }
                  title={`${req.athleteUser?.firstName || "Athlete"} ${req.athleteUser?.lastName || ""}`.trim()}
                  subtitle={[
                    req.requestedDate
                      ? new Date(req.requestedDate).toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" })
                      : "Date TBD",
                    req.requestedTime,
                  ].filter(Boolean).join(" · ")}
                  actions={
                    <>
                      <Button
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => updateRequestMutation.mutate({ id: req.id, status: "ACCEPTED" })}
                        disabled={updateRequestMutation.isPending}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0"
                        onClick={() => updateRequestMutation.mutate({ id: req.id, status: "DECLINED" })}
                        disabled={updateRequestMutation.isPending}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  }
                />
              ))
            ) : (
              <EmptyState icon={Calendar} title="No pending session requests" />
            )}
          </PageSection>

          {pendingConnections.length > 0 && (
            <PageSection title="Connection requests" badge={pendingConnections.length}>
              {pendingConnections.slice(0, 3).map((conn: any) => (
                <DataRow
                  key={conn.id}
                  avatar={
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{conn.athleteProfile?.skillLevel?.[0] || "A"}</AvatarFallback>
                    </Avatar>
                  }
                  title="Athlete"
                  subtitle={[conn.athleteProfile?.skillLevel, conn.athleteProfile?.locationCity].filter(Boolean).join(" · ")}
                  actions={
                    <>
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
                    </>
                  }
                />
              ))}
            </PageSection>
          )}
        </div>

        <div className="space-y-5">
          <AppPanel>
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-[var(--helix-green)]" />
              <span className="font-semibold text-sm text-[var(--helix-gray-100)]">
                {coachProfile.ratingAvg && coachProfile.ratingAvg > 0
                  ? `${(coachProfile.ratingAvg as number).toFixed(1)} (${coachProfile.ratingCount} reviews)`
                  : "No reviews yet"}
              </span>
            </div>
            <p className="text-xs text-[var(--helix-gray-500)] line-clamp-3 mb-4">
              {coachProfile.experience || "Add your experience to attract more athletes."}
            </p>
            <Link href="/coach/profile">
              <Button variant="outline" size="sm" className="w-full">Edit profile</Button>
            </Link>
          </AppPanel>

          <AppPanel>
            <p className="text-sm font-semibold text-[var(--helix-gray-100)] mb-3">Quick actions</p>
            <div className="space-y-1">
              {[
                { label: "All requests", href: "/coach/requests" },
                { label: "Schedule", href: "/coach/schedule" },
                { label: "Athletes", href: "/coach/athletes" },
                { label: "Profile", href: "/coach/profile" },
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
