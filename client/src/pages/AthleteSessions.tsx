import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Loader2, Calendar, Clock, MapPin, X, Search, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";

function getStatusConfig(status: string) {
  switch (status) {
    case "PENDING":
      return { label: "Pending", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300", icon: Clock };
    case "ACCEPTED":
      return { label: "Confirmed", className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300", icon: CheckCircle2 };
    case "DECLINED":
      return { label: "Declined", className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300", icon: XCircle };
    default:
      return { label: status, className: "bg-muted text-muted-foreground", icon: AlertCircle };
  }
}

function SessionCard({ request, onCancel }: { request: any; onCancel?: (id: string) => void }) {
  const status = getStatusConfig(request.status);
  const StatusIcon = status.icon;

  const sessionDate = request.requestedDate
    ? new Date(request.requestedDate)
    : null;

  const isUpcoming = sessionDate && sessionDate > new Date();

  return (
    <Card className="hover:shadow-sm transition-all">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-11 w-11 flex-shrink-0">
            <AvatarImage src={request.coachProfile?.avatarUrl || undefined} />
            <AvatarFallback>
              {request.coachProfile?.name?.[0] || "C"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="font-semibold text-sm">
                  {request.coachProfile?.name || "Coach"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {request.coachProfile?.locationCity}, {request.coachProfile?.locationState}
                </p>
              </div>
              <Badge className={`${status.className} flex items-center gap-1 text-xs`}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sessionDate && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  {sessionDate.toLocaleDateString("en-GB", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              )}
              {request.requestedTime && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                  {request.requestedTime}
                  {request.duration ? ` · ${request.duration} min` : ""}
                </div>
              )}
              {(request.athleteProfile?.locationCity) && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  {request.athleteProfile.locationCity}
                </div>
              )}
            </div>

            {request.note && (
              <p className="mt-2 text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
                &ldquo;{request.note}&rdquo;
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t">
          <Link href={`/coach/${request.coachId}`}>
            <Button variant="outline" size="sm" className="text-xs">
              View Coach
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {request.status === "ACCEPTED" && isUpcoming && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                Session confirmed ✓
              </span>
            )}
            {request.status === "PENDING" && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onCancel(request.id)}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AthleteSessions() {
  const { toast } = useToast();
  const [tab, setTab] = useState("all");

  const { data: requests = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/requests", "athlete"],
    queryFn: async () => {
      const res = await fetch("/api/requests?role=athlete", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 60_000,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/requests/${id}`),
    onSuccess: () => {
      toast({ title: "Request cancelled" });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const tabs = [
    { id: "all", label: "All", filter: () => true },
    { id: "pending", label: "Pending", filter: (r: any) => r.status === "PENDING" },
    { id: "accepted", label: "Confirmed", filter: (r: any) => r.status === "ACCEPTED" },
    { id: "declined", label: "Declined", filter: (r: any) => r.status === "DECLINED" },
  ];

  const filtered = requests.filter(tabs.find((t) => t.id === tab)?.filter ?? (() => true));

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-4xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">My Sessions</h1>
          <p className="text-muted-foreground text-sm">
            Track all your session requests and their status.
          </p>
        </div>
        <Link href="/athlete/find-coaches">
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Find Coaches
          </Button>
        </Link>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 w-full sm:w-auto">
          {tabs.map((t) => {
            const count = requests.filter(t.filter).length;
            return (
              <TabsTrigger key={t.id} value={t.id} className="flex items-center gap-1.5">
                {t.label}
                {count > 0 && (
                  <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map((t) => (
          <TabsContent key={t.id} value={t.id}>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filtered.length > 0 ? (
              <div className="space-y-4">
                {filtered.map((req: any) => (
                  <SessionCard
                    key={req.id}
                    request={req}
                    onCancel={req.status === "PENDING" ? (id) => cancelMutation.mutate(id) : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
                <p className="font-medium mb-1">No {t.id === "all" ? "" : t.label.toLowerCase()} sessions</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {t.id === "all"
                    ? "Book your first session with a coach to get started."
                    : `No ${t.label.toLowerCase()} session requests yet.`}
                </p>
                {t.id === "all" && (
                  <Link href="/athlete/find-coaches">
                    <Button>Browse Coaches</Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
