import type { ReactNode } from "react";

/** Site-wide teal radial glow (white → #14b8a6). */
export function TealGlowShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-white relative">
      <div
        className="absolute inset-0 z-0 pointer-events-none teal-glow-layer"
        aria-hidden
      />
      <div className="relative z-10 min-h-screen flex flex-col">{children}</div>
    </div>
  );
}
