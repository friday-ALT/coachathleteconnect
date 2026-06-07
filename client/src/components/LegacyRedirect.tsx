import { useEffect } from "react";
import { useLocation } from "wouter";

/** Redirect legacy routes to canonical /auth/* paths, preserving query string. */
export function LegacyRedirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const qs = window.location.search || "";
    setLocation(`${to}${qs}`);
  }, [to, setLocation]);

  return null;
}
