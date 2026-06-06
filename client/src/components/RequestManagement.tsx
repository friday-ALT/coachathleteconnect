import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Check, X, Inbox } from "lucide-react";
import type { TimeSlotRequest, AthleteProfile, User } from "@shared/schema";
import { SquareGridLoader } from "@/components/SquareGridLoader";
import { AppPageHeader, EmptyState, StatusPill } from "@/components/app/AppPrimitives";

interface RequestWithDetails extends TimeSlotRequest {
  athleteProfile?: AthleteProfile;
  athleteUser?: User;
  coachProfile?: any;
  coachUser?: User;
}

interface RequestManagementProps {
  isAthleteView?: boolean;
}

function statusVariant(status: string): "default" | "success" | "warning" | "danger" {
  if (status === "ACCEPTED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "DECLINED") return "danger";
  return "default";
}

function statusLabel(status: string, forAthlete: boolean) {
  if (status === "ACCEPTED") return forAthlete ? "Confirmed" : "Accepted";
  if (status === "PENDING") return "Pending";
  if (status === "DECLINED") return forAthlete ? "Declined" : "Declined";
  return status;
}

function RequestCard({
  request,
  isAthleteView,
  onAccept,
  onDecline,
  pending,
}: {
  request: RequestWithDetails;
  isAthleteView: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  pending?: boolean;
}) {
  const name = isAthleteView
    ? request.coachProfile?.name || "Coach"
    : `${request.athleteUser?.firstName || "Athlete"} ${request.athleteUser?.lastName || ""}`.trim();

  return (
    <div className="app-kanban__card gloss-card gloss-card--interactive" data-testid={`request-${request.id}`}>
      <span className="gloss-card__shine" aria-hidden />
      <div className="flex items-start gap-2.5 mb-2">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage
            src={
              isAthleteView
                ? request.coachUser?.profileImageUrl || undefined
                : request.athleteUser?.profileImageUrl || undefined
            }
          />
          <AvatarFallback className="text-xs">
            {isAthleteView
              ? request.coachUser?.firstName?.[0] || "C"
              : request.athleteUser?.firstName?.[0] || "A"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="app-kanban__card-title truncate" data-testid={`text-name-${request.id}`}>
            {name}
          </p>
          {!isAthleteView && (
            <p className="app-kanban__card-meta">
              {request.athleteProfile?.locationCity}, {request.athleteProfile?.locationState}
            </p>
          )}
        </div>
        <StatusPill label={statusLabel(request.status, isAthleteView)} variant={statusVariant(request.status)} />
      </div>
      <p className="app-kanban__card-meta" data-testid={`text-position-${request.id}`}>
        {request.desiredPosition} · Group {request.groupSize}
      </p>
      {request.requestedDate && (
        <p className="app-kanban__card-meta mt-1">
          {new Date(request.requestedDate).toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" })}
          {request.requestedTime ? ` · ${request.requestedTime}` : ""}
        </p>
      )}
      {request.note && (
        <p className="app-kanban__card-meta mt-1 italic line-clamp-2">&ldquo;{request.note}&rdquo;</p>
      )}
      {!isAthleteView && request.status === "PENDING" && onAccept && onDecline && (
        <div className="flex gap-2 mt-3">
          <Button size="sm" className="flex-1 h-8" onClick={onAccept} disabled={pending} data-testid={`button-accept-${request.id}`}>
            <Check className="h-3.5 w-3.5 mr-1" />
            Accept
          </Button>
          <Button size="sm" variant="outline" className="flex-1 h-8" onClick={onDecline} disabled={pending} data-testid={`button-decline-${request.id}`}>
            <X className="h-3.5 w-3.5 mr-1" />
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}

export default function RequestManagement({ isAthleteView = false }: RequestManagementProps) {
  const { toast } = useToast();

  const { data: requests, isLoading } = useQuery<RequestWithDetails[]>({
    queryKey: ["/api/requests", isAthleteView ? "athlete" : "coach"],
    queryFn: async () => {
      const role = isAthleteView ? "athlete" : "coach";
      const response = await fetch(`/api/requests?role=${role}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch requests");
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "ACCEPTED" | "DECLINED" }) => {
      return await apiRequest("PATCH", `/api/requests/${id}`, { status });
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.status === "ACCEPTED" ? "Request accepted" : "Request declined",
        description: `The request has been ${variables.status.toLowerCase()}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const pending = (requests || []).filter((r) => r.status === "PENDING");
  const accepted = (requests || []).filter((r) => r.status === "ACCEPTED");
  const declined = (requests || []).filter((r) => r.status === "DECLINED");

  const columns = [
    { id: "PENDING", label: "Pending", items: pending },
    { id: "ACCEPTED", label: isAthleteView ? "Confirmed" : "Accepted", items: accepted },
    { id: "DECLINED", label: "Declined", items: declined },
  ];

  return (
    <div className="container mx-auto max-w-7xl">
      <AppPageHeader
        label={isAthleteView ? "Athlete" : "Coach"}
        title={isAthleteView ? "My requests" : "Training requests"}
        subtitle={
          isAthleteView
            ? "View your sent training requests and their status."
            : "Manage incoming requests from athletes."
        }
      />

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <SquareGridLoader size="lg" />
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="app-kanban">
          {columns.map((col) => (
            <div key={col.id} className="app-kanban__col gloss-card">
              <span className="gloss-card__shine" aria-hidden />
              <div className="app-kanban__col-head">
                <span>{col.label}</span>
                <span className="text-[var(--helix-gray-500)]">{col.items.length}</span>
              </div>
              <div className="app-kanban__col-body">
                {col.items.length > 0 ? (
                  col.items.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      isAthleteView={isAthleteView}
                      pending={updateMutation.isPending}
                      onAccept={
                        !isAthleteView && request.status === "PENDING"
                          ? () => updateMutation.mutate({ id: request.id, status: "ACCEPTED" })
                          : undefined
                      }
                      onDecline={
                        !isAthleteView && request.status === "PENDING"
                          ? () => updateMutation.mutate({ id: request.id, status: "DECLINED" })
                          : undefined
                      }
                    />
                  ))
                ) : (
                  <p className="text-xs text-[var(--helix-gray-500)] text-center py-6">None</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title="No requests yet"
          description={
            isAthleteView
              ? "Your sent requests will appear here."
              : "Requests from athletes will appear here."
          }
        />
      )}
    </div>
  );
}
