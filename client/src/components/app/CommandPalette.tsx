import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useRole } from "@/hooks/useRole";
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
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { isAthlete, isCoach, hasBothProfiles, setActiveRole } = useRole();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setLocation(href);
  };

  const athleteItems = [
    { label: "Home", href: "/athlete/dashboard", icon: Home },
    { label: "Find coaches", href: "/athlete/find-coaches", icon: Search },
    { label: "Sessions", href: "/athlete/sessions", icon: Calendar },
    { label: "Connections", href: "/athlete/connections", icon: Users },
    { label: "Reviews", href: "/athlete/reviews", icon: Star },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Profile", href: "/athlete/profile", icon: User },
  ];

  const coachItems = [
    { label: "Home", href: "/coach/dashboard", icon: Home },
    { label: "Requests", href: "/coach/requests", icon: Inbox },
    { label: "Schedule", href: "/coach/schedule", icon: Calendar },
    { label: "Athletes", href: "/coach/athletes", icon: Users },
    { label: "Reviews", href: "/reviews", icon: Star },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Profile", href: "/coach/profile", icon: User },
  ];

  const items = isCoach && !isAthlete ? coachItems : isAthlete ? athleteItems : [...athleteItems, ...coachItems];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search actions…" className="bg-[var(--helix-surface)] border-[var(--helix-border)]" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {items.map((item) => (
            <CommandItem key={item.href} onSelect={() => go(item.href)} className="cursor-pointer">
              <item.icon className="mr-2 h-4 w-4 text-[var(--helix-green)]" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        {hasBothProfiles && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Switch mode">
              {isAthlete && (
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setActiveRole("coach");
                    setLocation("/coach/dashboard");
                  }}
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Coach mode
                </CommandItem>
              )}
              {isCoach && (
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setActiveRole("athlete");
                    setLocation("/athlete/dashboard");
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Athlete mode
                </CommandItem>
              )}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
