import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import RequestManagement from "@/components/RequestManagement";
import { Loader2 } from "lucide-react";
import { AppPageSkeleton } from "@/components/app/AppPageSkeleton";

export default function Requests() {
  const { isLoading: authLoading } = useAuth();
  const { isAthlete, isCoach, isLoading: roleLoading } = useRole();

  if (authLoading || roleLoading) {
    return <AppPageSkeleton variant="list" />;
  }

  // Use active role to determine view
  // isAthlete = true when user is in athlete mode (either single athlete profile or chose athlete role)
  // isCoach = true when user is in coach mode
  const isAthleteView = isAthlete && !isCoach;

  return <RequestManagement isAthleteView={isAthleteView} />;
}
