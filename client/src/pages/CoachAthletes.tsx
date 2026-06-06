import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppAnimatedTabs } from "@/components/app/AppAnimatedTabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Loader2, Users, MapPin, Check, X, Calendar, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { AppPageHeader, EmptyState, StatusPill } from "@/components/app/AppPrimitives";
import { AppPageSkeleton } from "@/components/app/AppPageSkeleton";

function AthleteCard({
  connection,
  onAccept,
  onDecline,
  isPending: mutPending,
}: {
  connection: any;
  onAccept?: () => void;
  onDecline?: () => void;
  isPending?: boolean;
}) {
  const athlete = connection.athleteProfile;

  return (
    <Card className="gloss-card gloss-card--interactive transition-all">
      <span className="gloss-card__shine" aria-hidden />
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11 flex-shrink-0">
            <AvatarFallback>
              {athlete?.skillLevel?.[0] || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="font-semibold text-sm">
                  {connection.athleteUser?.firstName || "Athlete"}{" "}
                  {connection.athleteUser?.lastName || ""}
                </p>
                {athlete?.locationCity && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {athlete.locationCity}, {athlete.locationState}
                  </p>
                )}
              </div>
              <StatusPill
                label={
                  connection.status === "PENDING"
                    ? "Pending"
                    : connection.status === "ACCEPTED"
                    ? "Connected"
                    : "Declined"
                }
                variant={
                  connection.status === "PENDING"
                    ? "warning"
                    : connection.status === "ACCEPTED"
                    ? "success"
                    : "danger"
                }
              />
            </div>

            <div className="flex flex-wrap gap-x-3 mt-2">
              {athlete?.skillLevel && (
                <span className="text-xs text-muted-foreground">
                  Level: {athlete.skillLevel}
                </span>
              )}
              {athlete?.age && (
                <span className="text-xs text-muted-foreground">
                  Age: {athlete.age}
                </span>
              )}
            </div>

            {connection.message && (
              <p className="mt-2 text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
                &ldquo;{connection.message}&rdquo;
              </p>
            )}
          </div>
        </div>

        {connection.status === "PENDING" && onAccept && onDecline && (
          <div className="flex gap-2 mt-3 pt-3 border-t">
            <Button
              className="flex-1"
              size="sm"
              onClick={onAccept}
              disabled={mutPending}
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Accept
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              size="sm"
              onClick={onDecline}
              disabled={mutPending}
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CoachAthletes() {
  const { toast } = useToast();
  const [tab, setTab] = useState("connected");

  const { data: connections = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/connections", "coach"],
    queryFn: async () => {
      const res = await fetch("/api/connections?role=coach", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACCEPTED" | "DECLINED" }) =>
      apiRequest("PATCH", `/api/connections/${id}`, { status }),
    onSuccess: (_, vars) => {
      toast({
        title: vars.status === "ACCEPTED" ? "✅ Connection Accepted" : "Connection Declined",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const tabs = [
    { id: "connected", label: "Connected", filter: (c: any) => c.status === "ACCEPTED" },
    { id: "pending", label: "Pending", filter: (c: any) => c.status === "PENDING" },
    { id: "all", label: "All", filter: () => true },
  ];

  const renderTabContent = (t: (typeof tabs)[number]) => {
    const items = connections.filter(t.filter);
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--helix-green)]" />
        </div>
      );
    }
    if (items.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((conn: any) => (
            <AthleteCard
              key={conn.id}
              connection={conn}
              onAccept={
                conn.status === "PENDING"
                  ? () => updateMutation.mutate({ id: conn.id, status: "ACCEPTED" })
                  : undefined
              }
              onDecline={
                conn.status === "PENDING"
                  ? () => updateMutation.mutate({ id: conn.id, status: "DECLINED" })
                  : undefined
              }
              isPending={updateMutation.isPending}
            />
          ))}
        </div>
      );
    }
    return (
      <EmptyState
        icon={Users}
        title={`No ${t.id === "all" ? "" : t.label.toLowerCase()} athletes`}
        description={
          t.id === "all"
            ? "Athletes who connect with you will appear here."
            : `No ${t.label.toLowerCase()} connections.`
        }
      />
    );
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <AppPageHeader
        label="Coach mode"
        title="My athletes"
        subtitle="Manage athlete connections and requests."
        actions={
          <Link href="/coach/requests">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              All requests
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        }
      />

      <AppAnimatedTabs
        value={tab}
        onValueChange={setTab}
        tabs={tabs.map((t) => ({
          id: t.id,
          label: t.label,
          count: connections.filter(t.filter).length,
          content: renderTabContent(t),
        }))}
      />
    </div>
  );
}
