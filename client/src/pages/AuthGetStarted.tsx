import { useLocation } from "wouter";
import { Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelixAuthLayout, HelixRoleCard } from "@/components/app/HelixAuthLayout";
import { Link } from "wouter";

type Role = "athlete" | "coach";

export default function AuthGetStarted() {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const role = params.get("role") as Role | null;

  if (role === "athlete" || role === "coach") {
    const isAthlete = role === "athlete";
    return (
      <HelixAuthLayout
        title={isAthlete ? "Join as an athlete" : "Join as a coach"}
        lead={
          isAthlete
            ? "Create an account or sign in to find coaches and book sessions."
            : "Create an account or sign in to offer coaching and manage your schedule."
        }
        backHref="/auth/get-started"
      >
        <div className="space-y-3">
          <Link href={`/auth/signup?role=${role}`}>
            <Button className="w-full h-12 gloss-btn rounded-full bg-[var(--helix-green)] text-[var(--helix-black)] hover:bg-[var(--helix-green-dim)]">
              Create account
            </Button>
          </Link>
          <Link href={`/auth/login?role=${role}`}>
            <Button
              variant="outline"
              className="w-full h-12 rounded-full border-[var(--helix-border)] text-[var(--helix-gray-100)] hover:border-[var(--helix-green)] hover:text-[var(--helix-green)]"
            >
              I already have an account
            </Button>
          </Link>
        </div>
      </HelixAuthLayout>
    );
  }

  return (
    <HelixAuthLayout
      title="How will you use CoachConnect?"
      lead="Choose athlete or coach — you can add the other role later from your profile."
      backHref="/"
    >
      <div className="space-y-3">
        <HelixRoleCard
          icon={Users}
          title="I'm an athlete"
          description="Find coaches and book training sessions"
          onClick={() => setLocation("/auth/get-started?role=athlete")}
        />
        <HelixRoleCard
          icon={Trophy}
          title="I'm a coach"
          description="Share your expertise and get discovered"
          onClick={() => setLocation("/auth/get-started?role=coach")}
        />
      </div>
      <p className="mt-8 text-center text-sm text-[var(--helix-gray-500)]">
        Already registered?{" "}
        <Link href="/auth/login" className="text-[var(--helix-green)] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </HelixAuthLayout>
  );
}
