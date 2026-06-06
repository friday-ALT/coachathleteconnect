import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { usePendingCounts } from "@/hooks/usePendingCounts";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommandPalette } from "@/components/app/CommandPalette";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Home,
  Search,
  Calendar,
  Users,
  Star,
  MessageSquare,
  Inbox,
  User,
  Trophy,
  LogOut,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Home;
  badge?: number;
  match?: (path: string) => boolean;
};

function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { isAthlete, isCoach, hasBothProfiles, setActiveRole, clearRole } = useRole();
  const pending = usePendingCounts();

  const athleteNav: NavItem[] = [
    { label: "Home", href: "/athlete/dashboard", icon: Home, match: (p) => p === "/athlete/dashboard" },
    { label: "Find coaches", href: "/athlete/find-coaches", icon: Search, match: (p) => p.startsWith("/athlete/find") || p === "/browse" },
    { label: "Sessions", href: "/athlete/sessions", icon: Calendar, badge: pending.athleteSessions, match: (p) => p === "/athlete/sessions" },
    { label: "Connections", href: "/athlete/connections", icon: Users, match: (p) => p === "/athlete/connections" },
    { label: "Reviews", href: "/athlete/reviews", icon: Star, badge: pending.pendingReviews, match: (p) => p === "/athlete/reviews" || p === "/reviews" },
    { label: "Messages", href: "/messages", icon: MessageSquare, match: (p) => p.startsWith("/messages") },
    { label: "Profile", href: "/athlete/profile", icon: User, match: (p) => p === "/athlete/profile" },
  ];

  const coachNav: NavItem[] = [
    { label: "Home", href: "/coach/dashboard", icon: Home, match: (p) => p === "/coach/dashboard" },
    { label: "Requests", href: "/coach/requests", icon: Inbox, badge: pending.sessionRequests + pending.connectionRequests, match: (p) => p === "/coach/requests" },
    { label: "Schedule", href: "/coach/schedule", icon: Calendar, match: (p) => p === "/coach/schedule" || p === "/coach/availability" },
    { label: "Athletes", href: "/coach/athletes", icon: Users, match: (p) => p === "/coach/athletes" },
    { label: "Reviews", href: "/reviews", icon: Star, match: (p) => p === "/reviews" },
    { label: "Messages", href: "/messages", icon: MessageSquare, match: (p) => p.startsWith("/messages") },
    { label: "Profile", href: "/coach/profile", icon: User, match: (p) => p === "/coach/profile" },
  ];

  const nav = isCoach && !isAthlete ? coachNav : athleteNav;

  return (
    <Sidebar collapsible="icon" className="app-sidebar border-r border-[var(--helix-border)]">
      <SidebarHeader className="app-sidebar__header">
        <Link href={isCoach && !isAthlete ? "/coach/dashboard" : "/athlete/dashboard"} className="app-sidebar__brand">
          <span className="app-sidebar__brand-mark">CC</span>
          <span className="app-sidebar__brand-text">CoachConnect</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="helix-mono text-[var(--helix-gray-500)]">
            {isCoach && !isAthlete ? "Coach" : "Athlete"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.match ? item.match(location) : location === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge != null && item.badge > 0 && (
                    <SidebarMenuBadge className="bg-[var(--helix-green)] text-[var(--helix-black)]">
                      {item.badge > 9 ? "9+" : item.badge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="app-sidebar__footer">
        {hasBothProfiles && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-[var(--helix-gray-400)] hover:text-[var(--helix-green)] hover:bg-[rgba(34,197,94,0.08)]"
            onClick={() => {
              if (isAthlete) {
                setActiveRole("coach");
                setLocation("/coach/dashboard");
              } else {
                setActiveRole("athlete");
                setLocation("/athlete/dashboard");
              }
            }}
          >
            {isAthlete ? <Trophy className="h-4 w-4 mr-2" /> : <User className="h-4 w-4 mr-2" />}
            Switch to {isAthlete ? "Coach" : "Athlete"}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-[var(--helix-gray-500)] hover:text-[var(--helix-gray-100)]"
          onClick={() => clearRole()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Exit mode
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function AppTopBar() {
  const { user } = useAuth();
  const { isAthlete, isCoach } = useRole();
  const profileHref = isCoach && !isAthlete ? "/coach/profile" : "/athlete/profile";

  return (
    <header className="app-topbar">
      <div className="app-topbar__left">
        <SidebarTrigger className="text-[var(--helix-gray-400)] hover:text-[var(--helix-green)]" />
        <button
          type="button"
          className="app-topbar__search"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
          }}
        >
          <Command className="h-3.5 w-3.5" />
          <span>Search…</span>
          <kbd className="app-topbar__kbd">⌘K</kbd>
        </button>
      </div>
      <div className="app-topbar__right">
        <ThemeToggle />
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="app-topbar__avatar">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-xs bg-[var(--helix-surface-2)]">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[var(--helix-surface)] border-[var(--helix-border)]">
            <DropdownMenuItem disabled className="text-[var(--helix-gray-500)]">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--helix-border)]" />
            <DropdownMenuItem asChild>
              <Link href={profileHref}>Profile</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <div className="helix-app-shell flex min-h-svh w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-svh bg-[var(--helix-black)]">
          <AppTopBar />
          <main className={cn("app-shell-main flex-1")}>{children}</main>
        </SidebarInset>
        <CommandPalette />
      </div>
    </SidebarProvider>
  );
}
