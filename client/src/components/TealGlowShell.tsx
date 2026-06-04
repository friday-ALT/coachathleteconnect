import type { ReactNode } from "react";

/** Site-wide shell — Oryzo-inspired cream editorial base. */
export function TealGlowShell({ children }: { children: ReactNode }) {
  return <div className="oryzo-site min-h-screen w-full">{children}</div>;
}
