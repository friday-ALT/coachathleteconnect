import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Star, ArrowRight } from "lucide-react";

export default function Welcome() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 shadow-inner">
          <Users className="h-10 w-10 text-primary" />
        </div>

        <h1 className="mb-2 text-4xl font-bold tracking-tight text-center">CoachConnect</h1>
        <p className="mb-10 text-center text-muted-foreground max-w-xs text-sm leading-relaxed">
          Find elite coaches, book personalised training, and take your game to the next level.
        </p>

        {/* Feature highlights */}
        <div className="w-full max-w-xs space-y-3 mb-10">
          {[
            { icon: Users, text: "Find expert coaches near you" },
            { icon: Trophy, text: "Book personalised training sessions" },
            { icon: Star, text: "Read reviews from real athletes" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-xs space-y-3">
          <Link href="/auth/signup">
            <Button className="w-full h-12 text-base" size="lg">Create Free Account</Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full h-12 text-base" size="lg">Log In</Button>
          </Link>
          <Link href="/browse">
            <Button variant="ghost" className="w-full h-10 text-sm text-muted-foreground">
              Browse coaches without signing up
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Legal */}
        <p className="mt-8 text-center text-xs text-muted-foreground max-w-xs">
          By creating an account, you agree to our{" "}
          <a href="/terms" className="underline underline-offset-2 hover:text-foreground">Terms of Service</a>{" "}
          and{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
