import { useRole } from "@/hooks/useRole";
import { CoachAvailabilityCalendar } from "@/components/CoachAvailabilityCalendar";
import { Loader2, Calendar } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AppPageHeader } from "@/components/app/AppPrimitives";
import { AppPageSkeleton } from "@/components/app/AppPageSkeleton";

export default function CoachSchedule() {
  const { coachProfile, isLoading, isCoach } = useRole();

  if (isLoading) {
    return <AppPageSkeleton />;
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
    <div className="container mx-auto max-w-7xl">
      <AppPageHeader
        label="Coach mode"
        title="My schedule"
        subtitle="Set your availability and manage your weekly schedule."
      />

      <CoachAvailabilityCalendar
        coachId={coachProfile.userId}
        coachProfile={coachProfile}
        isEditable={true}
      />
    </div>
  );
}
