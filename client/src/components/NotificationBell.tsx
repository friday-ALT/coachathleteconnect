import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Bell, CheckCheck, MessageSquare, Calendar, Users, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
  session_request:      { icon: Calendar, color: "text-blue-500" },
  session_accepted:     { icon: Calendar, color: "text-green-500" },
  session_declined:     { icon: Calendar, color: "text-red-500" },
  connection_request:   { icon: Users,    color: "text-purple-500" },
  connection_accepted:  { icon: Users,    color: "text-green-500" },
  connection_declined:  { icon: Users,    color: "text-red-500" },
  new_message:          { icon: MessageSquare, color: "text-primary" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function linkForNotification(n: any): string {
  const d = n.data || {};
  switch (n.type) {
    case "session_request":
    case "session_accepted":
    case "session_declined":
      return "/athlete/sessions";
    case "connection_request":
      return "/coach/athletes";
    case "connection_accepted":
    case "connection_declined":
      return "/athlete/connections";
    case "new_message":
      return d.conversationId ? `/messages/${d.conversationId}` : "/messages";
    default:
      return "/";
  }
}

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  const { data: notifications = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated,
    refetchInterval: open ? 5000 : 30000,
  });

  const unreadCount = (notifications as any[]).filter((n) => !n.read).length;

  const markAllMutation = useMutation({
    mutationFn: async () => apiRequest("PATCH", "/api/notifications/read-all", {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const markOneMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("PATCH", `/api/notifications/${id}/read`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const handleClick = (n: any) => {
    if (!n.read) markOneMutation.mutate(n.id);
    setOpen(false);
    setLocation(linkForNotification(n));
  };

  if (!isAuthenticated) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[360px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Bell className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll be notified about sessions, connections, and messages here.
              </p>
            </div>
          ) : (
            <div>
              {(notifications as any[]).map((n) => {
                const cfg = TYPE_CONFIG[n.type] || { icon: Bell, color: "text-muted-foreground" };
                const Icon = cfg.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      "w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b border-border/40 last:border-0",
                      !n.read && "bg-primary/5"
                    )}
                  >
                    <div className={cn("flex-shrink-0 mt-0.5", cfg.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs leading-snug", !n.read ? "font-semibold" : "font-medium")}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
