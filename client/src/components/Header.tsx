import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { usePendingCounts } from "@/hooks/usePendingCounts";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { MobileMenu } from "./MobileMenu";
import { NotificationBell } from "./NotificationBell";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Users, LogOut, User, Trophy, Home, Search, Calendar, Inbox, Star, MessageSquare } from "lucide-react";

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold leading-none">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const {
    effectiveRole,
    isAthlete,
    isCoach,
    hasAthleteProfile,
    hasCoachProfile,
    hasBothProfiles,
    clearRole,
    isExitingRole,
    setActiveRole,
  } = useRole();
  const pending = usePendingCounts();
  const [location] = useLocation();

  const hasAnyProfile = hasAthleteProfile || hasCoachProfile;

  return (
    <header className="helix-app-header">
      <div className="helix-app-header__inner">
        <Link
          href={
            effectiveRole === "athlete"
              ? "/athlete/dashboard"
              : effectiveRole === "coach"
              ? "/coach/dashboard"
              : isAuthenticated
              ? "/auth/role-selection"
              : "/"
          }
          className="helix-app-header__logo hover:opacity-80 transition-opacity"
          data-testid="link-home"
        >
          CoachConnect
        </Link>

        <div className="hidden md:flex items-center gap-0.5">
          {isAuthenticated && user && effectiveRole ? (
            <>
              {/* Role badge */}
              <Badge
                variant="outline"
                className={`mr-2 px-2.5 py-1 text-xs ${
                  isAthlete
                    ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
                    : "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
                }`}
                data-testid="badge-current-role"
              >
                {isAthlete ? <User className="h-3 w-3 mr-1" /> : <Trophy className="h-3 w-3 mr-1" />}
                {isAthlete ? "Athlete" : "Coach"}
              </Badge>

              {/* Athlete nav */}
              {isAthlete && (
                <>
                  <Link href="/athlete/dashboard">
                    <Button
                      variant={location === "/athlete/dashboard" ? "secondary" : "ghost"}
                      size="sm"
                      className="helix-app-nav-link"
                      data-testid="link-athlete-dashboard"
                    >
                      <Home className="h-4 w-4 mr-1.5" />
                      Home
                    </Button>
                  </Link>
                  <Link href="/athlete/find-coaches">
                    <Button
                      variant={location.startsWith("/athlete/find") || location === "/browse" ? "secondary" : "ghost"}
                      size="sm"
                    >
                      <Search className="h-4 w-4 mr-1.5" />
                      Find Coaches
                    </Button>
                  </Link>
                  <Link href="/athlete/sessions">
                    <Button
                      variant={location === "/athlete/sessions" ? "secondary" : "ghost"}
                      size="sm"
                      className="relative"
                    >
                      <Calendar className="h-4 w-4 mr-1.5" />
                      Sessions
                      <NavBadge count={pending.athleteSessions} />
                    </Button>
                  </Link>
                  <Link href="/athlete/connections">
                    <Button
                      variant={location === "/athlete/connections" ? "secondary" : "ghost"}
                      size="sm"
                    >
                      <Users className="h-4 w-4 mr-1.5" />
                      Connections
                    </Button>
                  </Link>
                  <Link href="/athlete/reviews">
                    <Button
                      variant={location === "/athlete/reviews" ? "secondary" : "ghost"}
                      size="sm"
                      className="relative"
                    >
                      <Star className="h-4 w-4 mr-1.5" />
                      Reviews
                      <NavBadge count={pending.pendingReviews} />
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button
                      variant={location.startsWith("/messages") ? "secondary" : "ghost"}
                      size="sm"
                    >
                      <MessageSquare className="h-4 w-4 mr-1.5" />
                      Messages
                    </Button>
                  </Link>
                </>
              )}

              {/* Coach nav */}
              {isCoach && (
                <>
                  <Link href="/coach/dashboard">
                    <Button
                      variant={location === "/coach/dashboard" ? "secondary" : "ghost"}
                      size="sm"
                    >
                      <Home className="h-4 w-4 mr-1.5" />
                      Home
                    </Button>
                  </Link>
                  <Link href="/coach/requests">
                    <Button
                      variant={location === "/coach/requests" ? "secondary" : "ghost"}
                      size="sm"
                      className="relative"
                    >
                      <Inbox className="h-4 w-4 mr-1.5" />
                      Requests
                      <NavBadge count={pending.sessionRequests + pending.connectionRequests} />
                    </Button>
                  </Link>
                  <Link href="/coach/schedule">
                    <Button
                      variant={location === "/coach/schedule" ? "secondary" : "ghost"}
                      size="sm"
                    >
                      <Calendar className="h-4 w-4 mr-1.5" />
                      Schedule
                    </Button>
                  </Link>
                  <Link href="/coach/athletes">
                    <Button
                      variant={location === "/coach/athletes" ? "secondary" : "ghost"}
                      size="sm"
                    >
                      <Users className="h-4 w-4 mr-1.5" />
                      Athletes
                    </Button>
                  </Link>
                  <Link href="/reviews">
                    <Button
                      variant={location === "/reviews" ? "secondary" : "ghost"}
                      size="sm"
                    >
                      <Star className="h-4 w-4 mr-1.5" />
                      Reviews
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button
                      variant={location.startsWith("/messages") ? "secondary" : "ghost"}
                      size="sm"
                    >
                      <MessageSquare className="h-4 w-4 mr-1.5" />
                      Messages
                    </Button>
                  </Link>
                </>
              )}

              {/* Notification bell */}
              <NotificationBell />

              {/* Avatar / profile link */}
              <Link
                href={isAthlete ? "/athlete/profile" : "/coach/profile"}
                data-testid="link-profile"
                className="ml-1"
              >
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={user.profileImageUrl || undefined}
                      alt={user.firstName || "User"}
                    />
                    <AvatarFallback className="text-xs">
                      {user.firstName?.[0] || user.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </Link>

              {/* Role switch — only if both profiles */}
              {hasBothProfiles && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveRole(isAthlete ? "coach" : "athlete")}
                  disabled={isExitingRole}
                  className="text-xs ml-1"
                >
                  {isAthlete ? (
                    <><Trophy className="h-3.5 w-3.5 mr-1.5" />Coach mode</>
                  ) : (
                    <><User className="h-3.5 w-3.5 mr-1.5" />Athlete mode</>
                  )}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => { window.location.href = "/api/logout"; }}
                data-testid="button-logout"
                className="text-muted-foreground hover:text-foreground ml-1"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : isAuthenticated && user && hasAnyProfile && !effectiveRole ? (
            <>
              <Link href="/">
                <Button variant="default" size="sm">Choose Your Role</Button>
              </Link>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 ml-1">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {user.firstName?.[0] || user.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { window.location.href = "/api/logout"; }}
                className="text-muted-foreground ml-1"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : isAuthenticated && user && !hasAnyProfile ? (
            <>
              <Link href="/auth/role-selection">
                <Button size="sm">Create Profile</Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { window.location.href = "/api/logout"; }}
                className="text-muted-foreground ml-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/browse">
                <Button variant="ghost" size="sm" className="helix-app-nav-link">
                  Browse
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="helix-app-nav-link">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup" data-testid="link-get-started">
                <button type="button" className="helix-btn helix-btn--accent text-xs py-1.5 px-3 h-8">
                  Get started
                </button>
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-1">
          {isAuthenticated && <NotificationBell />}
          <ThemeToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
