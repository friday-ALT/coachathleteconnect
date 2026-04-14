import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Users, LogOut, User, Trophy, Home } from "lucide-react";

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const { effectiveRole, isAthlete, isCoach, needsRoleSelection, hasAthleteProfile, hasCoachProfile, clearRole, isExitingRole, hasBothProfiles } = useRole();
  const [location] = useLocation();

  const isLandingPage = location === "/";
  const hasAnyProfile = hasAthleteProfile || hasCoachProfile;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo - redirects to dashboard when in active role, otherwise to landing */}
        <Link 
          href={effectiveRole === "athlete" ? "/athlete/dashboard" : effectiveRole === "coach" ? "/coach/dashboard" : "/"} 
          className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1" 
          data-testid="link-home"
        >
          <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          <span className="text-base md:text-lg font-bold">CoachConnect</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated && user && effectiveRole ? (
            <>
              {/* Role Badge */}
              <Badge 
                variant="outline" 
                className={`px-3 py-1 ${isAthlete ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'}`}
                data-testid="badge-current-role"
              >
                {isAthlete ? <User className="h-3 w-3 mr-1" /> : <Trophy className="h-3 w-3 mr-1" />}
                {isAthlete ? 'Athlete Mode' : 'Coach Mode'}
              </Badge>
              
              {isAthlete && (
                <>
                  <Link href="/athlete/dashboard">
                    <Button variant="ghost" data-testid="link-athlete-dashboard">
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/athlete/find-coaches">
                    <Button variant="ghost" data-testid="link-browse-coaches">
                      Find Coaches
                    </Button>
                  </Link>
                  <Link href="/athlete/requests">
                    <Button variant="ghost" data-testid="link-requests">
                      My Requests
                    </Button>
                  </Link>
                </>
              )}
              {isCoach && (
                <>
                  <Link href="/coach/dashboard">
                    <Button variant="ghost" data-testid="link-coach-dashboard">
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/coach/requests">
                    <Button variant="ghost" data-testid="link-requests">
                      Requests
                    </Button>
                  </Link>
                  <Link href="/coach/availability">
                    <Button variant="ghost" data-testid="link-availability">
                      Availability
                    </Button>
                  </Link>
                </>
              )}
              <Link href={isAthlete ? "/athlete/profile" : "/coach/profile"} data-testid="link-profile">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                    <AvatarFallback>
                      {user.firstName?.[0] || user.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </Link>
              {/* Exit Role button - always show to return to landing */}
              <Button
                variant="outline"
                onClick={() => clearRole()}
                disabled={isExitingRole}
                data-testid="button-exit-role"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Exit {isAthlete ? 'Athlete' : 'Coach'} Mode
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  window.location.href = "/api/logout";
                }}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </>
          ) : isAuthenticated && user && hasAnyProfile && !effectiveRole ? (
            <>
              {/* User has profile(s) but no active role - show choose role */}
              <Link href="/">
                <Button variant="default" data-testid="link-choose-role">
                  Choose Your Role
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                  <AvatarFallback>
                    {user.firstName?.[0] || user.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  window.location.href = "/api/logout";
                }}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </>
          ) : isAuthenticated && user && !hasAnyProfile ? (
            <>
              {/* User is authenticated but has no profile yet - show create profile */}
              <Link href="/onboarding">
                <Button variant="default" data-testid="link-create-profile">
                  Create Profile
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                  <AvatarFallback>
                    {user.firstName?.[0] || user.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  window.location.href = "/api/logout";
                }}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/browse">
                <Button variant="ghost" data-testid="link-browse">
                  Browse Coaches
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" data-testid="button-login-header">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button data-testid="button-signup-header">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
