import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSearch } from "wouter";

type StripeStatus = {
  configured?: boolean;
  connected?: boolean;
  onboardingComplete?: boolean;
};

export function CoachStripeConnect() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const search = useSearch();

  const { data: payConfig } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/payments/config"],
    queryFn: async () => {
      const res = await fetch("/api/payments/config");
      return res.json();
    },
    staleTime: 60_000,
  });

  const { data: status, isLoading } = useQuery<StripeStatus>({
    queryKey: ["/api/payments/coach/status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/payments/coach/status");
      return res.json();
    },
    enabled: payConfig?.configured === true,
    retry: false,
  });

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get("stripe") === "return" || params.get("stripe") === "refresh") {
      queryClient.invalidateQueries({ queryKey: ["/api/payments/coach/status"] });
      toast({ title: "Stripe setup", description: "Checking your connection status…" });
    }
  }, [search, queryClient, toast]);

  const onboardMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/payments/coach/onboard", { source: "web" });
      return res.json();
    },
    onSuccess: (data: { url?: string }) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (e: Error) => {
      const isConnect = e.message.includes("signed up for Connect") || e.message.includes("Stripe Connect is not enabled");
      toast({
        title: isConnect ? "Enable Stripe Connect first" : "Stripe setup failed",
        description: isConnect
          ? "Sign in at dashboard.stripe.com → Connect → complete setup (Express accounts), then try again."
          : e.message,
        variant: "destructive",
      });
    },
  });

  if (payConfig && !payConfig.configured) {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="pt-6 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-900 dark:text-amber-100">Payments not enabled on server</p>
            <p className="text-muted-foreground mt-1">
              Add <code className="text-xs">STRIPE_SECRET_KEY</code> to Railway Variables or your local{" "}
              <code className="text-xs">.env</code>, then restart the API. Same keys power web and mobile.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (status?.onboardingComplete) {
    return (
      <Card className="border-violet-200 bg-violet-50/30 dark:bg-violet-950/20">
        <CardContent className="pt-6 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-violet-600" />
          <div>
            <p className="font-semibold">Stripe connected</p>
            <p className="text-sm text-muted-foreground">You can receive payouts for paid bookings (web & app).</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-violet-300 bg-gradient-to-r from-violet-600 to-violet-700 text-white">
      <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <CreditCard className="h-8 w-8 opacity-90" />
          <div>
            <p className="font-semibold">Connect Stripe to get paid</p>
            <p className="text-sm text-white/80">Required for athletes to pay when booking (website & app).</p>
          </div>
        </div>
        <Button
          variant="secondary"
          className="shrink-0 bg-white text-violet-700 hover:bg-white/90"
          onClick={() => onboardMutation.mutate()}
          disabled={onboardMutation.isPending}
        >
          {onboardMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Connect Stripe"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
