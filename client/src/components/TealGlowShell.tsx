import type { ReactNode } from "react";

/** Site shell — clean white (Apple-style marketing base). */
export function TealGlowShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-white text-[#1d1d1f] antialiased apple-font">
      <div className="relative z-10 min-h-screen flex flex-col">{children}</div>
    </div>
  );
}
