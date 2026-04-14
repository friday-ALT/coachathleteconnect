import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, DollarSign, Star, ArrowLeft, Calendar, Clock, Users, UserPlus, CheckCircle, XCircle, Clock3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CoachAvailabilityCalendar } from "@/components/CoachAvailabilityCalendar";
import SessionRequestForm from "@/components/SessionRequestForm";
import type { CoachProfile, Review, Connection } from "@shared/schema";
import type { TimeSlot } from "@/lib/availability";
import { formatTime } from "@/lib/availability";

export default function CoachProfileView() {
  const { coachId } = useParams<{ coachId: string }>();
  const searchString = useSearch();
  const { isAuthenticated, user } = useAuth();
  const { isAthlete, hasCoachProfile, hasAthleteProfile } = useRole();
  const { toast } = useToast();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [connectMessage, setConnectMessage] = useState("");

  const defaultTab = useMemo(() => {
    const params = new URLSearchParams(searchString);
    const tab = params.get('tab');
    return tab === 'availability' || tab === 'reviews' ? tab : 'about';
  }, [searchString]);

  const { data: coach, isLoading: coachLoading } = useQuery<CoachProfile>({
    queryKey: ['/api/coaches', coachId],
    enabled: !!coachId,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<any[]>({
    queryKey: ['/api/reviews/coach', coachId],
    enabled: !!coachId,
  });

  // Check connection status with this coach
  const { data: connectionData, isLoading: connectionLoading } = useQuery<{ connection: Connection | null }>({
    queryKey: ['/api/connections/check', coachId],
    enabled: !!coachId && isAuthenticated && hasAthleteProfile,
  });

  const connection = connectionData?.connection;
  const isConnected = connection?.status === "ACCEPTED";
  const isPendingConnection = connection?.status === "PENDING";

  const isOwnProfile = hasCoachProfile && user?.id === coach?.userId;

  const connectMutation = useMutation({
    mutationFn: async (data: { coachId: string; message?: string }) => {
      return await apiRequest("POST", "/api/connections", data);
    },
    onSuccess: () => {
      toast({
        title: "Connection Request Sent",
        description: "The coach will review your connection request.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/connections/check', coachId] });
      setIsConnectDialogOpen(false);
      setConnectMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to connect with a coach.",
        variant: "destructive",
      });
      return;
    }
    if (!hasAthleteProfile) {
      toast({
        title: "Athlete Profile Required",
        description: "Please create an athlete profile to connect with coaches.",
        variant: "destructive",
      });
      return;
    }
    setIsConnectDialogOpen(true);
  };

  const handleConfirmConnect = () => {
    if (!coachId) return;
    connectMutation.mutate({ 
      coachId, 
      message: connectMessage.trim() || undefined 
    });
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to request a training session.",
        variant: "destructive",
      });
      return;
    }
    
    // TEMPORARY: Connection check bypassed for testing
    // if (!isConnected) {
    //   toast({
    //     title: "Connection Required",
    //     description: "You must connect with this coach before requesting a session.",
    //     variant: "destructive",
    //   });
    //   return;
    // }
    
    setSelectedSlot(slot);
    setIsRequestDialogOpen(true);
  };


  if (coachLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Coach Not Found</h1>
        <p className="text-muted-foreground mb-4">The coach profile you're looking for doesn't exist.</p>
        <Link href="/browse">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
      <Link 
        href={isOwnProfile ? "/dashboard" : "/browse"} 
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        data-testid="link-back"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {isOwnProfile ? "Back to dashboard" : "Back to coaches"}
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={coach.avatarUrl || undefined} alt={coach.name} />
                  <AvatarFallback className="text-2xl">
                    {coach.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-2xl font-bold mb-2" data-testid="text-coach-name">{coach.name}</h1>
                
                <div className="flex items-center gap-1 text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  <span data-testid="text-coach-location">{coach.locationCity}, {coach.locationState}</span>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold" data-testid="text-coach-rating">
                      {(coach.ratingAvg ?? 0) > 0 
                        ? `${(coach.ratingAvg ?? 0).toFixed(1)} (${coach.ratingCount ?? 0})`
                        : "New"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold" data-testid="text-coach-price">
                      ${(coach.pricePerHour / 100).toFixed(0)}/hr
                    </span>
                  </div>
                </div>

                {coach.specialties && coach.specialties.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mb-4">
                    {coach.specialties.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="secondary">{specialty}</Badge>
                    ))}
                  </div>
                )}

                {coach.maxGroupSize && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <Users className="h-4 w-4" />
                    <span>Up to {coach.maxGroupSize} athletes per session</span>
                  </div>
                )}

                {/* Connection Status and Action Button */}
                {!isOwnProfile && hasAthleteProfile && (
                  <div className="w-full mt-4 pt-4 border-t">
                    {connectionLoading ? (
                      <div className="flex justify-center">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : isConnected ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Connected</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          You can now request training sessions
                        </p>
                      </div>
                    ) : isPendingConnection ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-yellow-600">
                          <Clock3 className="h-4 w-4" />
                          <span className="text-sm font-medium">Connection Pending</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          Waiting for coach to accept your request
                        </p>
                      </div>
                    ) : connection?.status === "DECLINED" ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Connection Declined</span>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={handleConnect}
                        data-testid="button-connect-coach"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect with Coach
                      </Button>
                    )}
                  </div>
                )}
                
                {!isOwnProfile && !hasAthleteProfile && isAuthenticated && (
                  <div className="w-full mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground text-center mb-2">
                      Create an athlete profile to connect with coaches
                    </p>
                    <Link href="/onboarding">
                      <Button variant="outline" className="w-full" data-testid="button-create-profile">
                        Create Profile
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue={defaultTab} key={defaultTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about" data-testid="tab-about">About</TabsTrigger>
              <TabsTrigger value="availability" data-testid="tab-availability">
                <Calendar className="h-4 w-4 mr-1" />
                Availability
              </TabsTrigger>
              <TabsTrigger value="reviews" data-testid="tab-reviews">
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground" data-testid="text-coach-experience">
                    {coach.experience}
                  </p>
                  {coach.bio && (
                    <p className="mt-4" data-testid="text-coach-bio">
                      {coach.bio}
                    </p>
                  )}
                </CardContent>
              </Card>

              {(coach.yearsCoaching || coach.certifications) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Credentials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {coach.yearsCoaching && (
                      <p><strong>Years Coaching:</strong> {coach.yearsCoaching}</p>
                    )}
                    {coach.certifications && (
                      <p><strong>Certifications:</strong> {coach.certifications}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {coach.sessionTypes && coach.sessionTypes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Session Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {coach.sessionTypes.map((type) => (
                        <Badge key={type} variant="outline">{type}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {coach.ageGroupsTaught && coach.ageGroupsTaught.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Age Groups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {coach.ageGroupsTaught.map((group) => (
                        <Badge key={group} variant="outline">{group}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="availability">
              <div className="space-y-4">
                {!isOwnProfile && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="py-4">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold">View Training Schedule</h3>
                          <p className="text-sm text-muted-foreground">
                            See the coach's complete training schedule for the next 30 days
                          </p>
                        </div>
                        <Link href={`/coach/${coachId}/schedule`}>
                          <Button data-testid="button-view-30-days">
                            <Calendar className="h-4 w-4 mr-2" />
                            View 30-Day Schedule
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Available Times
                    </CardTitle>
                    <CardDescription>
                      {isOwnProfile 
                        ? "Manage your availability schedule" 
                        : "Select a time slot to request a training session"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CoachAvailabilityCalendar
                      coachId={coach.userId}
                      coachProfile={coach}
                      isEditable={isOwnProfile}
                      onSlotSelect={isOwnProfile ? undefined : handleSlotSelect}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviewsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : reviews.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No reviews yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.athleteUser?.profileImageUrl} />
                              <AvatarFallback>
                                {review.athleteUser?.firstName?.[0] || "A"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {review.athleteUser?.firstName || "Athlete"}
                              </p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Connect Dialog */}
      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect with {coach.name}</DialogTitle>
            <DialogDescription>
              Send a connection request to this coach. Once accepted, you can request training sessions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="connect-message">Message (optional)</Label>
              <Textarea
                id="connect-message"
                placeholder="Introduce yourself and share your training goals..."
                value={connectMessage}
                onChange={(e) => setConnectMessage(e.target.value)}
                rows={3}
                data-testid="input-connect-message"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmConnect} 
              disabled={connectMutation.isPending}
              data-testid="button-confirm-connect"
            >
              {connectMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Session Dialog - Uses detailed form */}
      {selectedSlot && (
        <SessionRequestForm
          coach={coach}
          selectedSlot={selectedSlot}
          isOpen={isRequestDialogOpen}
          onClose={() => {
            setIsRequestDialogOpen(false);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
}
