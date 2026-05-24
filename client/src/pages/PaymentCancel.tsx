import { Link } from "wouter";
import { XCircle, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancel() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
        <XCircle className="h-10 w-10 text-amber-500" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Payment cancelled</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          Your payment was not completed and you have not been charged. The session has not been booked.
        </p>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/athlete/find-coaches">
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Find a Coach
          </Button>
        </Link>
        <Link href="/athlete/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
