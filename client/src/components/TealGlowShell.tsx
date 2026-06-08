import type { ReactNode } from "react";

/** Site-wide Google Health / M3 light shell. */
export function TealGlowShell({ children }: { children: ReactNode }) {
  return <div className="helix-site health-site min-h-screen w-full">{children}</div>;
}
