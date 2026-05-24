import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Pound, Loader2, Search, User, Calendar, UserPlus } from "lucide-react";
import type { CoachProfile, AthleteProfile } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import RequestTimeSlotModal from "@/components/RequestTimeSlotModal";

interface CoachWithUser extends CoachProfile {
  user?: { firstName?: string; lastName?: string; profileImageUrl?: string };
}

interface AthleteWithUser extends AthleteProfile {
  user?: { id?: string; firstName?: string; lastName?: string; profileImageUrl?: string };
}

function BrowseCoaches() {
  const [searchTerm, setSearchTerm] = useState("");
  const [skillLevel, setSkillLevel] = useState<string>("all");
  const [selectedCoach, setSelectedCoach] = useState<CoachWithUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: coaches, isLoading } = useQuery<CoachWithUser[]>({
    queryKey: ["/api/coaches", { q: searchTerm, skillLevel }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      // Don't send "all" to the API — server treats absence as "all"
      if (skillLevel && skillLevel !== "all") params.append("skillLevel", skillLevel);
      const res = await fetch(`/api/coaches?${params}`);
      if (!res.ok) throw new Error("Failed to fetch coaches");
      return res.json();
    },
  });

  const handleRequest = (coach: CoachWithUser) => {
    if (!isAuthenticated) {
      setLocation("/auth/login");
      return;
    }
    setSelectedCoach(coach);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl sm:text-3xl font-bold">Find a Coach</h1>
        <p className="text-sm text-muted-foreground">Browse certified coaches and book a session</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={skillLevel} onValueChange={setSkillLevel}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Skill Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : coaches && coaches.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => (
            <Card key={coach.id} className="hover-elevate flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-14 w-14 flex-shrink-0">
                    <AvatarImage src={coach.avatarUrl || undefined} alt={coach.name} />
                    <AvatarFallback>{coach.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold leading-tight">{coach.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{coach.locationCity}, {coach.locationState}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`h-3 w-3 ${i <= Math.floor(coach.ratingAvg || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                      ))}
                      <span className="text-xs text-muted-foreground ml-0.5">({coach.ratingCount || 0})</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-primary">£{(coach.pricePerHour / 100).toFixed(0)}</span>
                    <p className="text-xs text-muted-foreground">/hr</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between gap-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{coach.experience}</p>

                {coach.specialties && coach.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {coach.specialties.slice(0, 3).map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                    {coach.specialties.length > 3 && <Badge variant="outline" className="text-xs">+{coach.specialties.length - 3}</Badge>}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Link href={`/coach/${coach.userId}`} className="flex-1">
                    <Button variant="outline" className="w-full min-h-[40px]">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      View Profile
                    </Button>
                  </Link>
                  <Button className="flex-1 min-h-[40px]" onClick={() => handleRequest(coach)}>
                    Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground opacity-40" />
          <h3 className="mb-1 text-lg font-medium">No coaches found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or check back soon</p>
        </div>
      )}

      {selectedCoach && (
        <RequestTimeSlotModal
          coach={selectedCoach}
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedCoach(null); }}
        />
      )}
    </div>
  );
}

function BrowseAthletes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [skillLevel, setSkillLevel] = useState<string>("all");
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: athletes, isLoading } = useQuery<AthleteWithUser[]>({
    queryKey: ["/api/athletes", { q: searchTerm, skillLevel }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (skillLevel && skillLevel !== "all") params.append("skillLevel", skillLevel);
      const res = await fetch(`/api/athletes?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch athletes");
      return res.json();
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (athleteId: string) => {
      const res = await apiRequest("POST", "/api/connections", { athleteId });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Connection request sent ✓" });
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleConnect = (athleteUserId: string) => {
    if (!isAuthenticated) { setLocation("/auth/login"); return; }
    connectMutation.mutate(athleteUserId);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl sm:text-3xl font-bold">Find Athletes</h1>
        <p className="text-sm text-muted-foreground">Connect with athletes looking for training in your area</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={skillLevel} onValueChange={setSkillLevel}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Skill Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : athletes && athletes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {athletes.map((athlete) => (
            <Card key={athlete.id} className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={athlete.user?.profileImageUrl || undefined} />
                    <AvatarFallback>{athlete.user?.firstName?.[0] || "A"}{athlete.user?.lastName?.[0] || ""}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {athlete.user?.firstName || "Athlete"} {athlete.user?.lastName?.[0] ? `${athlete.user.lastName[0]}.` : ""}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{athlete.locationCity}, {athlete.locationState}</span>
                    </div>
                    <div className="flex gap-1 mt-1.5">
                      <Badge variant="secondary" className="text-xs">Age {athlete.age}</Badge>
                      <Badge variant="outline" className="text-xs">{athlete.skillLevel}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(athlete as any).goals && (
                  <p className="text-xs text-muted-foreground italic mb-3 line-clamp-2">
                    &ldquo;{(athlete as any).goals}&rdquo;
                  </p>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => handleConnect(athlete.userId)}
                  disabled={connectMutation.isPending}
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                  Connect
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <User className="mb-4 h-12 w-12 text-muted-foreground opacity-40" />
          <h3 className="mb-1 text-lg font-medium">No athletes found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}

export default function Browse() {
  const { isCoach, isLoading } = useRole();
  const searchString = useSearch();

  const tabOverride = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return params.get("tab");
  }, [searchString]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tabOverride === "athletes") return <BrowseAthletes />;
  if (tabOverride === "coaches") return <BrowseCoaches />;

  return isCoach ? <BrowseAthletes /> : <BrowseCoaches />;
}
