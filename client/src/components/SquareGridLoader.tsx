import { cn } from "@/lib/utils";

type SquareGridLoaderProps = {
  className?: string;
  /** sm ≈ 32px, md ≈ 50px (default), lg ≈ 64px */
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "square-loader--sm",
  md: "square-loader--md",
  lg: "square-loader--lg",
};

/** 3×3 pulsing square grid loader */
export function SquareGridLoader({ className, size = "md" }: SquareGridLoaderProps) {
  return (
    <div
      className={cn("square-loader", sizeClass[size], className)}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className={`square-loader__sq square-loader__sq-${i + 1}`} />
      ))}
    </div>
  );
}

/** Centered full-area loading state */
export function PageLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-[50vh] w-full flex-1 items-center justify-center",
        className,
      )}
    >
      <SquareGridLoader size="lg" />
    </div>
  );
}
