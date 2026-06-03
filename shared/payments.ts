/** Platform fee deducted from the coach's listed session price (athlete pays listed price only). */
export const PLATFORM_FEE_PERCENT = 0.025; // 2.5%

export function sessionBaseCents(pricePerHour: number, durationMins: number): number {
  return Math.round(pricePerHour * durationMins / 60);
}

export function platformFeeCents(sessionCents: number): number {
  return Math.round(sessionCents * PLATFORM_FEE_PERCENT);
}

/** Amount the coach receives after the platform fee. */
export function coachPayoutCents(sessionCents: number): number {
  return sessionCents - platformFeeCents(sessionCents);
}

/** Total charged to the athlete (same as listed session price). */
export function athleteChargeCents(sessionCents: number): number {
  return sessionCents;
}
