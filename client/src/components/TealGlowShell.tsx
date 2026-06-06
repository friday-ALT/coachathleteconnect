import type { ReactNode } from "react";

/** Site-wide Helix-style dark shell. */
export function TealGlowShell({ children }: { children: ReactNode }) {
  return <div className="helix-site min-h-screen w-full">{children}</div>;
}
