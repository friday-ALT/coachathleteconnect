import { useQuery } from "@tanstack/react-query";
import { useRole } from "./useRole";

interface PendingCounts {
  connectionRequests: number;  // coach: pending connection requests from athletes
  sessionRequests: number;     // coach: pending session requests from athletes
  pendingReviews: number;      // athlete: coaches that can be reviewed
  athleteSessions: number;     // athlete: their own pending session requests
  total: number;
}

export function usePendingCounts(): PendingCounts {
  const { isAthlete, isCoach } = useRole();

  const { data: requests = [] } = useQuery<any[]>({
    queryKey: ["/api/requests", isAthlete ? "athlete" : "coach"],
    queryFn: async () => {
      const role = isAthlete ? "athlete" : "coach";
      const res = await fetch(`/api/requests?role=${role}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAthlete || isCoach,
    staleTime: 1000 * 30,
  });

  const { data: connections = [] } = useQuery<any[]>({
    queryKey: ["/api/connections", isAthlete ? "athlete" : "coach"],
    queryFn: async () => {
      const role = isAthlete ? "athlete" : "coach";
      const res = await fetch(`/api/connections?role=${role}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAthlete || isCoach,
    staleTime: 1000 * 30,
  });

  const { data: pendingReviews = [] } = useQuery<any[]>({
    queryKey: ["/api/reviews/pending"],
    queryFn: async () => {
      const res = await fetch("/api/reviews/pending", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAthlete,
    staleTime: 1000 * 60,
  });

  const pendingRequestCount = (requests as any[]).filter((r: any) => r.status === "PENDING").length;
  const pendingConnectionCount = (connections as any[]).filter((c: any) => c.status === "PENDING").length;
  const pendingReviewCount = (pendingReviews as any[]).length;

  const sessionRequests = isCoach ? pendingRequestCount : 0;
  const connectionRequests = isCoach ? pendingConnectionCount : 0;
  const athleteSessions = isAthlete ? pendingRequestCount : 0;

  return {
    connectionRequests,
    sessionRequests,
    pendingReviews: pendingReviewCount,
    athleteSessions,
    total: connectionRequests + sessionRequests + pendingReviewCount,
  };
}
