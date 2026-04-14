import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, DollarSign, Loader2, Search, User, Calendar } from "lucide-react";
import type { CoachProfile, AthleteProfile } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import RequestTimeSlotModal from "@/components/RequestTimeSlotModal";

interface CoachWithUser extends CoachProfile {
  user?: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

interface AthleteWithUser extends AthleteProfile {
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

function BrowseCoaches() {
  const [searchTerm, setSearchTerm] = useState("");
  const [skillLevel, setSkillLevel] = useState<string>("");
  const [groupSize, setGroupSize] = useState<string>("");
  const [selectedCoach, setSelectedCoach] = useState<CoachWithUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleBookSession = (coach: CoachWithUser) => {
    if (isAuthenticated) {
      setSelectedCoach(coach);
      setIsModalOpen(true);
    } else {
      window.location.href = "/api/login";
    }
  };

  const { data: coaches, isLoading } = useQuery<CoachWithUser[]>({
    queryKey: ["/api/coaches", { q: searchTerm, skillLevel, groupSize }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (skillLevel) params.append("skillLevel", skillLevel);
      if (groupSize) params.append("groupSize", groupSize);

      const response = await fetch(`/api/coaches?${params}`);
      if (!response.ok) throw new Error("Failed to fetch coaches");
      return response.json();
    },
  });

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      <div className="mb-6 md:mb-8">
        <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold">Search for Coaches</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Find experienced coaches in your area. Sign up to book sessions!
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 md:mb-8 grid gap-3 md:gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>

        <Select value={skillLevel} onValueChange={setSkillLevel}>
          <SelectTrigger data-testid="select-skill-level">
            <SelectValue placeholder="Skill Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Select value={groupSize} onValueChange={setGroupSize}>
          <SelectTrigger data-testid="select-group-size">
            <SelectValue placeholder="Group Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Size</SelectItem>
            <SelectItem value="1">Individual (1)</SelectItem>
            <SelectItem value="2-5">Small Group (2-5)</SelectItem>
            <SelectItem value="6+">Large Group (6+)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Coach Results */}
      {isLoading ? (
        <div className="flex min-h-[30vh] md:min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : coaches && coaches.length > 0 ? (
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => (
            <Card key={coach.id} className="hover-elevate" data-testid={`card-coach-${coach.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={coach.avatarUrl || undefined} alt={coach.name} />
                    <AvatarFallback className="text-lg">
                      {coach.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg" data-testid={`text-coach-name-${coach.id}`}>
                      {coach.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{coach.locationCity}, {coach.locationState}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(coach.ratingAvg || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {coach.ratingAvg?.toFixed(1) || "0.0"} ({coach.ratingCount || 0} reviews)
                  </span>
                </div>

                <p className="text-sm line-clamp-2">{coach.experience}</p>

                {coach.specialties && coach.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {coach.specialties.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {coach.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{coach.specialties.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1 text-lg font-semibold text-primary">
                    <DollarSign className="h-5 w-5" />
                    <span>{(coach.pricePerHour / 100).toFixed(0)}/hr</span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Link href={`/coach/${coach.userId}`}>
                      <Button
                        variant="outline"
                        className="flex-1 sm:flex-none min-h-[44px]"
                        data-testid={`button-view-profile-${coach.id}`}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Button
                      className="flex-1 sm:flex-none min-h-[44px]"
                      onClick={() => handleBookSession(coach)}
                      data-testid={`button-book-${coach.id}`}
                    >
                      Request
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <Search className="mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">No coaches found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search filters
          </p>
        </div>
      )}

      {selectedCoach && (
        <RequestTimeSlotModal
          coach={selectedCoach}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCoach(null);
          }}
        />
      )}
    </div>
  );
}

function BrowseAthletes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [skillLevel, setSkillLevel] = useState<string>("");

  const { data: athletes, isLoading } = useQuery<AthleteWithUser[]>({
    queryKey: ["/api/athletes", { q: searchTerm, skillLevel }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (skillLevel) params.append("skillLevel", skillLevel);

      const response = await fetch(`/api/athletes?${params}`);
      if (!response.ok) throw new Error("Failed to fetch athletes");
      return response.json();
    },
  });

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      <div className="mb-6 md:mb-8">
        <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold">Search for Athletes</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Find athletes looking for training in your area
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 md:mb-8 grid gap-3 md:gap-4 sm:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-athletes"
          />
        </div>

        <Select value={skillLevel} onValueChange={setSkillLevel}>
          <SelectTrigger data-testid="select-skill-level-athletes">
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

      {/* Athlete Results */}
      {isLoading ? (
        <div className="flex min-h-[30vh] md:min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : athletes && athletes.length > 0 ? (
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {athletes.map((athlete) => (
            <Card key={athlete.id} className="hover-elevate" data-testid={`card-athlete-${athlete.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={athlete.user?.profileImageUrl || undefined} alt={athlete.user?.firstName || "Athlete"} />
                    <AvatarFallback className="text-lg">
                      {athlete.user?.firstName?.[0] || "A"}
                      {athlete.user?.lastName?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg" data-testid={`text-athlete-name-${athlete.id}`}>
                      {athlete.user?.firstName || "Anonymous"} {athlete.user?.lastName?.[0] || ""}.
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{athlete.locationCity}, {athlete.locationState}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    <User className="h-3 w-3 mr-1" />
                    Age: {athlete.age}
                  </Badge>
                  <Badge variant="outline">
                    {athlete.skillLevel}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Looking for soccer training sessions
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <User className="mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">No athletes found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search filters
          </p>
        </div>
      )}
    </div>
  );
}

export default function Browse() {
  const { isAthlete, isCoach, isLoading, needsRoleSelection } = useRole();
  const searchString = useSearch();

  const tabOverride = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return params.get('tab');
  }, [searchString]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Allow query parameter to override the default view
  if (tabOverride === 'athletes') {
    return <BrowseAthletes />;
  }
  if (tabOverride === 'coaches') {
    return <BrowseCoaches />;
  }

  if (needsRoleSelection) {
    return <BrowseCoaches />;
  }

  if (isCoach) {
    return <BrowseAthletes />;
  }

  return <BrowseCoaches />;
}
