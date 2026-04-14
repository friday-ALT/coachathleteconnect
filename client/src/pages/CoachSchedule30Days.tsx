import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Schedule30DayView from "@/components/Schedule30DayView";
import type { CoachProfile } from "@shared/schema";

export default function CoachSchedule30Days() {
  const { coachId } = useParams<{ coachId: string }>();

  const { data: coach, isLoading } = useQuery<CoachProfile>({
    queryKey: ["/api/coaches", coachId],
    enabled: !!coachId,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!coach || !coachId) {
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
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
      <Link href={`/coach/${coachId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to {coach.name}'s profile
      </Link>

      <Schedule30DayView coachId={coachId} coachName={coach.name} />
    </div>
  );
}
