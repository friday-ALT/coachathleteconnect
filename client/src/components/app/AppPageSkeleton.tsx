import { Skeleton } from "@/components/ui/skeleton";

export function AppPageSkeleton({ variant = "dashboard" }: { variant?: "dashboard" | "list" | "form" }) {
  if (variant === "list") {
    return (
      <div className="container mx-auto max-w-4xl space-y-4 app-page-enter">
        <Skeleton className="h-8 w-48 bg-[var(--helix-surface)]" />
        <Skeleton className="h-4 w-72 bg-[var(--helix-surface)]" />
        <div className="space-y-3 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-[var(--helix-surface)]" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className="helix-auth__body space-y-4 app-page-enter">
        <Skeleton className="h-4 w-24 bg-[var(--helix-surface)]" />
        <Skeleton className="h-8 w-56 bg-[var(--helix-surface)]" />
        <Skeleton className="h-4 w-full bg-[var(--helix-surface)]" />
        <Skeleton className="h-12 w-full bg-[var(--helix-surface)]" />
        <Skeleton className="h-12 w-full bg-[var(--helix-surface)]" />
        <Skeleton className="h-12 w-full bg-[var(--helix-surface)]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 app-page-enter">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28 bg-[var(--helix-surface)]" />
        <Skeleton className="h-10 w-64 bg-[var(--helix-surface)]" />
        <Skeleton className="h-4 w-80 bg-[var(--helix-surface)]" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl bg-[var(--helix-surface)]" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl bg-[var(--helix-surface)]" />
      <Skeleton className="h-64 w-full rounded-xl bg-[var(--helix-surface)]" />
    </div>
  );
}
