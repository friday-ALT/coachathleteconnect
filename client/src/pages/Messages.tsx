import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Send, MessageSquare, ArrowLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function ConversationList({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const { data: convs = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 10000,
  });

  const filtered = convs.filter((c: any) =>
    !search || c.otherUser?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <MessageSquare className="h-10 w-10 text-muted-foreground opacity-30 mb-3" />
            <p className="text-sm font-medium">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start a conversation from a coach's profile.
            </p>
          </div>
        ) : (
          filtered.map((conv: any) => {
            const hasUnread = conv.unreadCount > 0;
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/40",
                  selectedId === conv.id && "bg-muted"
                )}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conv.otherUser?.avatarUrl || undefined} />
                    <AvatarFallback className="text-sm">
                      {conv.otherUser?.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <p className={cn("text-sm truncate", hasUnread ? "font-semibold" : "font-medium")}>
                      {conv.otherUser?.name || "Unknown"}
                    </p>
                    {conv.latestMessage && (
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {timeAgo(conv.latestMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className={cn("text-xs truncate", hasUnread ? "text-foreground" : "text-muted-foreground")}>
                    {conv.latestMessage?.content || "Start the conversation"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function MessageThread({ conversationId }: { conversationId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: msgs = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/conversations", conversationId, "messages"],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: convs = [] } = useQuery<any[]>({
    queryKey: ["/api/conversations"],
    enabled: false, // use cached data
  });
  const conv = (convs as any[]).find((c) => c.id === conversationId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setText("");
    },
    onError: (e: Error) => toast({ title: "Failed to send", description: e.message, variant: "destructive" }),
  });

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {conv && (
        <div className="px-4 py-3 border-b flex items-center gap-3 bg-background">
          <Avatar className="h-8 w-8">
            <AvatarImage src={conv.otherUser?.avatarUrl || undefined} />
            <AvatarFallback className="text-xs">{conv.otherUser?.name?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <p className="font-semibold text-sm">{conv.otherUser?.name}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : msgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground opacity-30 mb-3" />
            <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
          </div>
        ) : (
          msgs.map((msg: any) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                    isMine
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  )}
                >
                  {msg.content}
                  <p className={cn("text-[10px] mt-1", isMine ? "text-primary-foreground/70 text-right" : "text-muted-foreground")}>
                    {timeAgo(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-background">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1"
            disabled={sendMutation.isPending}
          />
          <Button size="icon" onClick={handleSend} disabled={!text.trim() || sendMutation.isPending}>
            {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Messages() {
  const [, params] = useRoute("/messages/:id");
  const [, setLocation] = useLocation();
  const selectedId = params?.id || null;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const handleSelect = (id: string) => setLocation(`/messages/${id}`);

  return (
    <div className="container mx-auto px-0 md:px-4 py-0 md:py-6 max-w-5xl">
      <div className="hidden md:block mb-4 px-4 md:px-0">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground">Direct messages with your coaches and athletes</p>
      </div>

      <Card className="overflow-hidden rounded-none md:rounded-xl border-0 md:border" style={{ height: "calc(100vh - 140px)" }}>
        <div className="flex h-full">
          {/* Sidebar (always visible on desktop, hidden on mobile if conversation selected) */}
          <div
            className={cn(
              "w-full md:w-72 border-r flex-shrink-0",
              selectedId && "hidden md:flex md:flex-col"
            )}
          >
            <div className="p-3 border-b font-semibold text-sm md:hidden flex items-center gap-2">
              Messages
            </div>
            <div className="flex-1 overflow-hidden">
              <ConversationList selectedId={selectedId} onSelect={handleSelect} />
            </div>
          </div>

          {/* Thread panel */}
          <div className={cn("flex-1 flex flex-col min-w-0", !selectedId && "hidden md:flex")}>
            {selectedId ? (
              <>
                {/* Mobile back button */}
                <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLocation("/messages")}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
                <MessageThread conversationId={selectedId} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <MessageSquare className="h-14 w-14 text-muted-foreground opacity-20 mb-4" />
                <p className="font-medium">Select a conversation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a conversation from the left, or start one from a coach's profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
