import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Loader2, Users, MapPin, Check, X, Calendar, ChevronRight,
} from "lucide-react";
import { useState } from "react";

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
    <Card className="hover:shadow-sm transition-all">
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
              <Badge
                className={
                  connection.status === "PENDING"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-xs"
                    : connection.status === "ACCEPTED"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-xs"
                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 text-xs"
                }
              >
                {connection.status === "PENDING"
                  ? "Pending"
                  : connection.status === "ACCEPTED"
                  ? "Connected"
                  : "Declined"}
              </Badge>
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

  const filtered = connections.filter(tabs.find((t) => t.id === tab)?.filter ?? (() => true));

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-4xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">My Athletes</h1>
          <p className="text-muted-foreground text-sm">
            Manage athlete connections and requests.
          </p>
        </div>
        <Link href="/coach/requests">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            All Requests
            <ChevronRight className="h-3.5 w-3.5" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((conn: any) => (
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
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
                <p className="font-medium mb-1">
                  No {t.id === "all" ? "" : t.label.toLowerCase()} athletes
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.id === "all"
                    ? "Athletes who connect with you will appear here."
                    : `No ${t.label.toLowerCase()} connections.`}
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
