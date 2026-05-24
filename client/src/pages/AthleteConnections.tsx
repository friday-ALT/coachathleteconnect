import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Star, MapPin, DollarSign, Clock, CheckCircle2, XCircle, Calendar, Users } from "lucide-react";

function getConnectionStatus(status: string) {
  switch (status) {
    case "PENDING":
      return { label: "Pending", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" };
    case "ACCEPTED":
      return { label: "Connected", className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" };
    case "DECLINED":
      return { label: "Declined", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" };
    default:
      return { label: status, className: "bg-muted text-muted-foreground" };
  }
}

function ConnectionCard({ connection }: { connection: any }) {
  const s = getConnectionStatus(connection.status);
  const coach = connection.coachProfile;

  return (
    <Card className="hover:shadow-sm transition-all">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={coach?.avatarUrl || undefined} />
            <AvatarFallback className="text-base">
              {coach?.name?.[0] || "C"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
              <div>
                <p className="font-semibold">{coach?.name || "Coach"}</p>
                {coach?.locationCity && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {coach.locationCity}, {coach.locationState}
                  </p>
                )}
              </div>
              <Badge className={s.className + " text-xs"}>{s.label}</Badge>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
              {coach?.pricePerHour && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  ${(coach.pricePerHour / 100).toFixed(0)}/hr
                </span>
              )}
              {coach?.ratingAvg && coach.ratingAvg > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {coach.ratingAvg.toFixed(1)} ({coach.ratingCount} reviews)
                </span>
              )}
            </div>

            {coach?.specialties && coach.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {coach.specialties.slice(0, 3).map((s: string) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
                {coach.specialties.length > 3 && (
                  <Badge variant="secondary" className="text-xs">+{coach.specialties.length - 3}</Badge>
                )}
              </div>
            )}

            {connection.message && (
              <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2 mb-3">
                &ldquo;{connection.message}&rdquo;
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t mt-1 flex-wrap">
          <Link href={`/coach/${connection.coachId}`}>
            <Button variant="outline" size="sm" className="text-xs">
              View Profile
            </Button>
          </Link>
          {connection.status === "ACCEPTED" && (
            <Link href={`/coach/${connection.coachId}`}>
              <Button size="sm" className="text-xs">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Book Session
              </Button>
            </Link>
          )}
          {connection.status === "PENDING" && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Awaiting response
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AthleteConnections() {
  const [tab, setTab] = useState("accepted");

  const { data: connections = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/connections", "athlete"],
    queryFn: async () => {
      const res = await fetch("/api/connections?role=athlete", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const tabs = [
    { id: "accepted", label: "Connected", filter: (c: any) => c.status === "ACCEPTED" },
    { id: "pending", label: "Pending", filter: (c: any) => c.status === "PENDING" },
    { id: "all", label: "All", filter: () => true },
  ];

  const filtered = connections.filter(tabs.find((t) => t.id === tab)?.filter ?? (() => true));

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-4xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">My Connections</h1>
          <p className="text-muted-foreground text-sm">
            Manage your coaching relationships.
          </p>
        </div>
        <Link href="/athlete/find-coaches">
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Find More Coaches
          </Button>
        </Link>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 w-full sm:w-auto">
          {tabs.map((t) => {
            const count = connections.filter(t.filter).length;
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
                {filtered.map((conn: any) => (
                  <ConnectionCard key={conn.id} connection={conn} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
                <p className="font-medium mb-1">
                  No {t.id === "all" ? "" : t.label.toLowerCase()} connections
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {t.id === "all"
                    ? "Browse coaches and send a connection request to get started."
                    : `No ${t.label.toLowerCase()} connections yet.`}
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
