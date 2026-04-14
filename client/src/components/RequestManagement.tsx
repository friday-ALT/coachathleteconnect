import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Check, X, Loader2, Inbox } from "lucide-react";
import type { TimeSlotRequest, AthleteProfile, User } from "@shared/schema";

interface RequestWithDetails extends TimeSlotRequest {
  athleteProfile?: AthleteProfile;
  athleteUser?: User;
  coachProfile?: any;
  coachUser?: User;
}

interface RequestManagementProps {
  isAthleteView?: boolean;
}

export default function RequestManagement({ isAthleteView = false }: RequestManagementProps) {
  const { toast } = useToast();

  const { data: requests, isLoading} = useQuery<RequestWithDetails[]>({
    queryKey: ["/api/requests", isAthleteView ? "athlete" : "coach"],
    queryFn: async () => {
      const role = isAthleteView ? "athlete" : "coach";
      const response = await fetch(`/api/requests?role=${role}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "ACCEPTED" | "DECLINED" }) => {
      return await apiRequest("PATCH", `/api/requests/${id}`, { status });
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.status === "ACCEPTED" ? "Request Accepted" : "Request Declined",
        description: `The request has been ${variables.status.toLowerCase()}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string, forAthlete: boolean) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
      case "ACCEPTED":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {forAthlete ? "Successful" : "Accepted"}
          </Badge>
        );
      case "DECLINED":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            {forAthlete ? "Unavailable" : "Declined"}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      <div className="mb-6 md:mb-8">
        <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold">
          {isAthleteView ? "My Requests" : "Training Requests"}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {isAthleteView 
            ? "View your sent training requests and their status"
            : "Manage incoming requests from athletes"}
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[30vh] md:min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card>
              <CardHeader>
                <CardTitle>Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between gap-4 border-b pb-4 last:border-0"
                      data-testid={`request-${request.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={
                            isAthleteView 
                              ? (request.coachUser?.profileImageUrl || undefined)
                              : (request.athleteUser?.profileImageUrl || undefined)
                          } />
                          <AvatarFallback>
                            {isAthleteView 
                              ? (request.coachUser?.firstName?.[0] || "C")
                              : (request.athleteUser?.firstName?.[0] || "A")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold" data-testid={`text-name-${request.id}`}>
                            {isAthleteView 
                              ? (request.coachProfile?.name || "Coach")
                              : (request.athleteUser?.firstName || "Athlete")}
                          </p>
                          {!isAthleteView && (
                            <p className="text-sm text-muted-foreground">
                              Age: {request.athleteProfile?.age || "N/A"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-sm">
                        <p className="font-medium" data-testid={`text-position-${request.id}`}>
                          {request.desiredPosition}
                        </p>
                        <p className="text-muted-foreground">Group: {request.groupSize}</p>
                      </div>

                      <div className="text-sm">
                        <p data-testid={`text-location-${request.id}`}>
                          {request.athleteProfile?.locationCity}, {request.athleteProfile?.locationState}
                        </p>
                      </div>

                      <div>{getStatusBadge(request.status, isAthleteView)}</div>

                      {!isAthleteView && request.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateMutation.mutate({ id: request.id, status: "ACCEPTED" })}
                            disabled={updateMutation.isPending}
                            data-testid={`button-accept-${request.id}`}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateMutation.mutate({ id: request.id, status: "DECLINED" })}
                            disabled={updateMutation.isPending}
                            data-testid={`button-decline-${request.id}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {requests.map((request) => (
              <Card key={request.id} data-testid={`request-card-${request.id}`}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={
                        isAthleteView
                          ? (request.coachUser?.profileImageUrl || undefined)
                          : (request.athleteUser?.profileImageUrl || undefined)
                      } />
                      <AvatarFallback>
                        {isAthleteView
                          ? (request.coachUser?.firstName?.[0] || "C")
                          : (request.athleteUser?.firstName?.[0] || "A")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {isAthleteView
                          ? (request.coachProfile?.name || "Coach")
                          : (request.athleteUser?.firstName || "Athlete")}
                      </p>
                      {!isAthleteView && (
                        <>
                          <p className="text-sm text-muted-foreground">Age: {request.athleteProfile?.age || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.athleteProfile?.locationCity}, {request.athleteProfile?.locationState}
                          </p>
                        </>
                      )}
                    </div>
                    {getStatusBadge(request.status, isAthleteView)}
                  </div>

                  <div className="mb-4 space-y-1 text-sm">
                    <p><span className="font-medium">Position:</span> {request.desiredPosition}</p>
                    <p><span className="font-medium">Group Size:</span> {request.groupSize}</p>
                    {request.note && (
                      <p><span className="font-medium">Note:</span> {request.note}</p>
                    )}
                  </div>

                  {!isAthleteView && request.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => updateMutation.mutate({ id: request.id, status: "ACCEPTED" })}
                        disabled={updateMutation.isPending}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => updateMutation.mutate({ id: request.id, status: "DECLINED" })}
                        disabled={updateMutation.isPending}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <Inbox className="mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">No requests yet</h3>
          <p className="text-sm text-muted-foreground">
            {isAthleteView 
              ? "Your sent requests will appear here"
              : "Requests from athletes will appear here"}
          </p>
        </div>
      )}
    </div>
  );
}
