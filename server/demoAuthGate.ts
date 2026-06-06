/** Demo login is disabled in production unless explicitly enabled. */
export function isDemoAuthEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.ENABLE_DEMO_AUTH === 'true';
}
