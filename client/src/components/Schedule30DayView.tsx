import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2, Calendar, Clock, MapPin, Users, CheckCircle, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

interface ScheduleSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  location?: string;
  trainingType?: string;
  groupSize?: number;
  status: "Available" | "Unavailable" | "Booked";
  canRequest: boolean;
}

interface ScheduleDay {
  date: string;
  dayOfWeek: number;
  dayName: string;
  sessions: ScheduleSession[];
  isBlocked: boolean;
}

interface Schedule30DayResponse {
  days: ScheduleDay[];
  coachName: string;
  timezone: string;
  hasConnection: boolean;
  connectionStatus: string | null;
  message?: string;
}

interface Schedule30DayViewProps {
  coachId: string;
  coachName?: string;
  onClose?: () => void;
}

export default function Schedule30DayView({ coachId, coachName, onClose }: Schedule30DayViewProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [selectedSession, setSelectedSession] = useState<ScheduleSession | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [requestNote, setRequestNote] = useState("");

  const { data: schedule, isLoading, error } = useQuery<Schedule30DayResponse>({
    queryKey: ["/api/coaches", coachId, "schedule-30days"],
  });

  const requestMutation = useMutation({
    mutationFn: async (data: {
      coachId: string;
      requestedDate: string;
      requestedStartTime: string;
      requestedEndTime: string;
      sessionTitle?: string;
      note?: string;
    }) => {
      return await apiRequest("POST", "/api/training-requests", data);
    },
    onSuccess: () => {
      toast({
        title: "Request Sent",
        description: "Your training session request has been sent to the coach.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/coaches", coachId, "schedule-30days"] });
      setIsRequestDialogOpen(false);
      setSelectedSession(null);
      setRequestNote("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleRequestSession = (session: ScheduleSession) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to request a training session.",
        variant: "destructive",
      });
      return;
    }

    if (!session.canRequest) {
      if (!schedule?.hasConnection) {
        toast({
          title: "Connection Required",
          description: "Please connect with this coach before requesting sessions.",
          variant: "destructive",
        });
      } else if (schedule?.connectionStatus !== "ACCEPTED") {
        toast({
          title: "Connection Pending",
          description: "Wait for your connection request to be accepted before requesting sessions.",
          variant: "destructive",
        });
      }
      return;
    }

    setSelectedSession(session);
    setIsRequestDialogOpen(true);
  };

  const handleConfirmRequest = () => {
    if (!selectedSession) return;

    requestMutation.mutate({
      coachId,
      requestedDate: selectedSession.date,
      requestedStartTime: selectedSession.startTime,
      requestedEndTime: selectedSession.endTime,
      sessionTitle: selectedSession.title,
      note: requestNote.trim() || undefined,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Available
          </Badge>
        );
      case "Booked":
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Booked
          </Badge>
        );
      case "Unavailable":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Unavailable
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !schedule) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-muted-foreground">Failed to load schedule</p>
        </CardContent>
      </Card>
    );
  }

  if (schedule.message || schedule.days.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Next 30 Days
            {schedule.coachName && <span className="font-normal text-muted-foreground">- {schedule.coachName}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">{schedule.message || "No schedule available"}</p>
        </CardContent>
      </Card>
    );
  }

  const daysWithSessions = schedule.days.filter((day) => day.sessions.length > 0 && !day.isBlocked);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Next 30 Days
              </CardTitle>
              <CardDescription>
                {schedule.coachName && <span>{schedule.coachName}'s </span>}
                upcoming training schedule
                {schedule.timezone && <span className="ml-1">({schedule.timezone})</span>}
              </CardDescription>
            </div>
            {!schedule.hasConnection && isAuthenticated && (
              <Link href={`/coach/${coachId}`}>
                <Button variant="outline" size="sm" data-testid="button-connect-coach">
                  Connect First
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
            {schedule.hasConnection && schedule.connectionStatus === "PENDING" && (
              <Badge variant="secondary">Connection Pending</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {daysWithSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sessions available in the next 30 days</p>
            </div>
          ) : (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                {daysWithSessions.map((day) => (
                  <div key={day.date} className="border-b pb-4 last:border-b-0">
                    <h3 className="font-semibold mb-3 flex items-center gap-2" data-testid={`text-day-${day.date}`}>
                      <Calendar className="h-4 w-4 text-primary" />
                      {formatDate(day.date)}
                      <Badge variant="outline" className="ml-auto">
                        {day.sessions.length} session{day.sessions.length !== 1 ? "s" : ""}
                      </Badge>
                    </h3>
                    <div className="space-y-2">
                      {day.sessions.map((session, idx) => (
                        <Card
                          key={`${session.id}-${idx}`}
                          className="overflow-hidden"
                          data-testid={`card-session-${session.date}-${idx}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <span className="font-medium">{session.title}</span>
                                {getStatusBadge(session.status)}
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {session.startTime} - {session.endTime}
                                </span>
                                {session.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {session.location}
                                  </span>
                                )}
                                {session.groupSize && (
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    Up to {session.groupSize}
                                  </span>
                                )}
                                {session.trainingType && (
                                  <Badge variant="secondary" className="text-xs">
                                    {session.trainingType}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {session.status === "Available" && (
                              <Button
                                size="sm"
                                onClick={() => handleRequestSession(session)}
                                disabled={!session.canRequest && isAuthenticated}
                                data-testid={`button-request-${session.date}-${idx}`}
                              >
                                Request
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Training Session</DialogTitle>
            <DialogDescription>
              Send a request to train on {selectedSession && formatDate(selectedSession.date)} at{" "}
              {selectedSession?.startTime}
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="font-medium">{selectedSession.title}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedSession.startTime} - {selectedSession.endTime}
                    </span>
                    {selectedSession.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedSession.location}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div>
                <Label htmlFor="note">Message (optional)</Label>
                <Textarea
                  id="note"
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  placeholder="Add a message to the coach..."
                  data-testid="textarea-request-note"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRequest}
              disabled={requestMutation.isPending}
              data-testid="button-confirm-request"
            >
              {requestMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
