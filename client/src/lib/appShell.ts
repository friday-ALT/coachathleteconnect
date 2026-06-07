/** Authenticated coach app routes — must not be treated as public /coach/:id profiles. */
const COACH_APP_ROUTES = new Set([
  "/coach/dashboard",
  "/coach/requests",
  "/coach/schedule",
  "/coach/athletes",
  "/coach/availability",
  "/coach/profile",
  "/coach/reviews",
]);

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

  // Public coach profile pages (e.g. /coach/abc-uuid) — not /coach/dashboard etc.
  if (/^\/coach\/[^/]+$/.test(location) && !COACH_APP_ROUTES.has(location)) return false;
  if (/^\/coach\/[^/]+\/schedule$/.test(location)) return false;

  return true;
}
