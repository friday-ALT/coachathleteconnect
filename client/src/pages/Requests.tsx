import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import RequestManagement from "@/components/RequestManagement";
import { Loader2 } from "lucide-react";

export default function Requests() {
  const { isLoading: authLoading } = useAuth();
  const { isAthlete, isCoach, isLoading: roleLoading } = useRole();

  if (authLoading || roleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use active role to determine view
  // isAthlete = true when user is in athlete mode (either single athlete profile or chose athlete role)
  // isCoach = true when user is in coach mode
  const isAthleteView = isAthlete && !isCoach;

  return <RequestManagement isAthleteView={isAthleteView} />;
}
