import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Menu, Users, Search, FileText, User, LogOut, Trophy, Home, Calendar, Inbox, Star, MessageSquare } from "lucide-react";

export function MobileMenu() {
  const { user, isAuthenticated } = useAuth();
  const { effectiveRole, isAthlete, isCoach, needsRoleSelection, hasBothProfiles, hasAthleteProfile, hasCoachProfile, clearRole, isExitingRole } = useRole();
  const hasAnyProfile = hasAthleteProfile || hasCoachProfile;
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  const closeMenu = () => setOpen(false);
  const isLandingPage = location === "/";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            CoachConnect
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-2">
          {isAuthenticated && user && effectiveRole ? (
            <>
              {/* Role Badge */}
              <Badge 
                variant="outline" 
                className={`mb-2 justify-center py-2 ${isAthlete ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'}`}
                data-testid="badge-current-role-mobile"
              >
                {isAthlete ? <User className="h-3 w-3 mr-1" /> : <Trophy className="h-3 w-3 mr-1" />}
                {isAthlete ? 'Athlete Mode' : 'Coach Mode'}
              </Badge>
              {isAthlete && (
                <>
                  <Link href="/athlete/dashboard" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Home className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/athlete/find-coaches" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Search className="h-4 w-4" />
                      Find Coaches
                    </Button>
                  </Link>
                  <Link href="/athlete/sessions" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Calendar className="h-4 w-4" />
                      My Sessions
                    </Button>
                  </Link>
                  <Link href="/athlete/connections" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Users className="h-4 w-4" />
                      My Coaches
                    </Button>
                  </Link>
                  <Link href="/athlete/reviews" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Star className="h-4 w-4" />
                      My Reviews
                    </Button>
                  </Link>
                  <Link href="/messages" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Messages
                    </Button>
                  </Link>
                </>
              )}
              {isCoach && (
                <>
                  <Link href="/coach/dashboard" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Home className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/coach/requests" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Inbox className="h-4 w-4" />
                      Requests
                    </Button>
                  </Link>
                  <Link href="/coach/schedule" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Calendar className="h-4 w-4" />
                      My Schedule
                    </Button>
                  </Link>
                  <Link href="/coach/athletes" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Users className="h-4 w-4" />
                      My Athletes
                    </Button>
                  </Link>
                  <Link href="/reviews" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Star className="h-4 w-4" />
                      My Reviews
                    </Button>
                  </Link>
                  <Link href="/messages" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Messages
                    </Button>
                  </Link>
                </>
              )}
              
              <div className="my-4 border-t" />
              
              <Link href={isAthlete ? "/athlete/profile" : "/coach/profile"} onClick={closeMenu}>
                <Button variant="ghost" className="w-full justify-start gap-3" data-testid="link-profile-mobile">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                    <AvatarFallback className="text-sm">
                      {user.firstName?.[0] || user.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span>Profile</span>
                </Button>
              </Link>
              
              {/* Exit Role button - always show to return to landing */}
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => {
                  clearRole();
                  closeMenu();
                }}
                disabled={isExitingRole}
                data-testid="button-exit-role-mobile"
              >
                <LogOut className="h-4 w-4" />
                Exit {isAthlete ? 'Athlete' : 'Coach'} Mode
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive"
                onClick={() => {
                  window.location.href = "/api/logout";
                }}
                data-testid="button-logout-mobile"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : isAuthenticated && user && hasAnyProfile && !effectiveRole ? (
            <>
              {/* User has profile(s) but no active role - show choose role */}
              <Link href="/" onClick={closeMenu}>
                <Button className="w-full justify-start gap-2" data-testid="link-choose-role-mobile">
                  <Home className="h-4 w-4" />
                  Choose Your Role
                </Button>
              </Link>
              
              <div className="my-4 border-t" />
              
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                  <AvatarFallback className="text-sm">
                    {user.firstName?.[0] || user.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <span>Profile</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive"
                onClick={() => {
                  window.location.href = "/api/logout";
                }}
                data-testid="button-logout-mobile"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : isAuthenticated && user && !hasAnyProfile ? (
            <>
              {/* User is authenticated but has no profile yet */}
              <Link href="/auth/role-selection" onClick={closeMenu}>
                <Button className="w-full justify-start gap-2" data-testid="link-create-profile-mobile">
                  <User className="h-4 w-4" />
                  Create Profile
                </Button>
              </Link>
              
              <div className="my-4 border-t" />
              
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                  <AvatarFallback className="text-sm">
                    {user.firstName?.[0] || user.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <span>{user.firstName || user.email}</span>
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive"
                onClick={() => {
                  window.location.href = "/api/logout";
                }}
                data-testid="button-logout-mobile"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/browse" onClick={closeMenu}>
                <Button variant="ghost" className="w-full justify-start gap-2" data-testid="link-browse-mobile-guest">
                  <Search className="h-4 w-4" />
                  Browse Coaches
                </Button>
              </Link>
              <div className="my-4 border-t" />
              <Link href="/auth/login" onClick={closeMenu}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <User className="h-4 w-4" />
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup" onClick={closeMenu}>
                <Button className="w-full justify-start gap-2">
                  <User className="h-4 w-4" />
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
