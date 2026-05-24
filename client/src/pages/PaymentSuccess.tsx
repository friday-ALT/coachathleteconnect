import { useEffect, useState } from "react";
import { useSearch, Link } from "wouter";
import { CheckCircle2, Loader2, XCircle, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentSuccess() {
  const searchString = useSearch();
  const sessionId = new URLSearchParams(searchString).get("session_id");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    let attempts = 0;
    const poll = async () => {
      try {
        const res = await fetch(`/api/payments/checkout-status/${sessionId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to check payment status");
        const data = await res.json();

        if (data.status === "paid") {
          setRequestId(data.requestId || null);
          setStatus("success");
        } else if (data.status === "unpaid" || data.status === "expired") {
          setStatus("error");
        } else if (attempts < 10) {
          // still processing — retry
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    poll();
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Confirming your payment…</h2>
        <p className="text-sm text-muted-foreground">This usually takes just a moment.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Payment issue</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            We couldn't confirm your payment. If you were charged, please contact support. Your session has not been booked.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/athlete/sessions">
            <Button variant="outline">View My Sessions</Button>
          </Link>
          <a href="mailto:support@coachconnect.app">
            <Button>Contact Support</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Payment confirmed!</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          Your session has been booked and is now pending confirmation from the coach. You'll be notified once they accept.
        </p>
      </div>

      <Card className="w-full max-w-sm text-left">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Payment processed successfully</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Session request sent to coach</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>Awaiting coach confirmation</span>
          </div>
        </CardContent>
      </Card>

      <Link href="/athlete/sessions">
        <Button>
          View My Sessions
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
