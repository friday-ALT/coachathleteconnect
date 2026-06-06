/** Routes that use the authenticated sidebar shell (vs marketing header). */
export function shouldUseAppShell(
  location: string,
  isAuthenticated: boolean,
  effectiveRole: "athlete" | "coach" | null | undefined,
): boolean {
  if (!isAuthenticated || !effectiveRole) return false;

  const marketing =
    location === "/" ||
    location.startsWith("/welcome") ||
    location.startsWith("/auth/") ||
    location.startsWith("/payment/") ||
    ["/signup", "/login", "/forgot-password", "/reset-password", "/onboarding"].includes(location);

  if (marketing) return false;

  // Public coach profile pages (not app management routes)
  if (/^\/coach\/[^/]+$/.test(location)) return false;
  if (/^\/coach\/[^/]+\/schedule$/.test(location)) return false;

  return true;
}
