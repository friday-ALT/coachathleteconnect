import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, Trophy, ArrowRight } from "lucide-react";

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Logo & App Name */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-12 w-12 text-primary" />
        </div>
        
        <h1 className="mb-2 text-4xl font-bold tracking-tight">CoachConnect</h1>
        <p className="mb-12 text-center text-muted-foreground max-w-sm">
          Connect with elite soccer coaches. Book training sessions. Level up your game.
        </p>

        {/* Quick Features */}
        <div className="space-y-4 w-full max-w-sm mb-12">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <span>Find expert coaches near you</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <span>Book personalized training sessions</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
            <span>Track your progress over time</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-3">
          <Button
            onClick={() => setLocation("/auth/signup")}
            className="w-full h-12 text-base"
            size="lg"
          >
            Create Account
          </Button>
          
          <Button
            onClick={() => setLocation("/auth/login")}
            variant="outline"
            className="w-full h-12 text-base"
            size="lg"
          >
            Log In
          </Button>
        </div>

        {/* Terms & Privacy */}
        <p className="mt-8 text-center text-xs text-muted-foreground max-w-sm">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
