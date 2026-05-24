import { useRole } from "@/hooks/useRole";
import { CoachAvailabilityCalendar } from "@/components/CoachAvailabilityCalendar";
import { Loader2, Calendar } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CoachSchedule() {
  const { coachProfile, isLoading, isCoach } = useRole();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isCoach || !coachProfile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="font-semibold mb-2">Coach access required</p>
        <Link href="/coach/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">My Schedule</h1>
          <p className="text-muted-foreground text-sm">
            Set your availability and manage your weekly schedule.
          </p>
        </div>
        <Link href="/coach/dashboard">
          <Button variant="outline" size="sm">Back to Dashboard</Button>
        </Link>
      </div>

      <CoachAvailabilityCalendar
        coachId={coachProfile.userId}
        coachProfile={coachProfile}
        isEditable={true}
      />
    </div>
  );
}
