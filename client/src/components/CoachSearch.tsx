import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Search, Filter, Loader2, Users } from "lucide-react";
import CoachCard from "./CoachCard";
import type { CoachProfile } from "@shared/schema";

export default function CoachSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [skillLevel, setSkillLevel] = useState<string>("");
  const [groupSize, setGroupSize] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: coaches, isLoading } = useQuery<CoachProfile[]>({
    queryKey: ["/api/coaches", { q: searchQuery, skillLevel, groupSize }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (skillLevel && skillLevel.trim()) params.append("skillLevel", skillLevel);
      if (groupSize && groupSize.trim()) params.append("groupSize", groupSize);
      
      const url = `/api/coaches${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      
      return res.json();
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Find Your Coach</h1>
        <p className="text-muted-foreground">Search for experienced soccer coaches in your area</p>
      </div>

      {/* Search Bar */}
      <div className="sticky top-16 z-40 mb-6 space-y-4 bg-background pb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-filters"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Skill Level</label>
                  <Select value={skillLevel} onValueChange={setSkillLevel}>
                    <SelectTrigger data-testid="select-filter-skill">
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">All levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Group Size</label>
                  <Select value={groupSize} onValueChange={setGroupSize}>
                    <SelectTrigger data-testid="select-filter-group">
                      <SelectValue placeholder="Any size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">Any size</SelectItem>
                      <SelectItem value="1">1-on-1</SelectItem>
                      <SelectItem value="2">Small group (2-5)</SelectItem>
                      <SelectItem value="6">Large group (6+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                variant="ghost"
                className="mt-4 w-full"
                onClick={() => {
                  setSkillLevel("");
                  setGroupSize("");
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : coaches && coaches.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <Users className="mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">No coaches found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
