import type { ReactNode } from "react";
import { useLocation } from "wouter";

export function AppPageTransition({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div key={location} className="app-page-enter">
      {children}
    </div>
  );
}
