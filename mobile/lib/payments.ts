/** Keep in sync with ../shared/payments.ts */
export const PLATFORM_FEE_PERCENT = 0.025; // 2.5%

export function sessionBaseCents(pricePerHour: number, durationMins: number): number {
  return Math.round(pricePerHour * durationMins / 60);
}

export function platformFeeCents(sessionCents: number): number {
  return Math.round(sessionCents * PLATFORM_FEE_PERCENT);
}

export function coachPayoutCents(sessionCents: number): number {
  return sessionCents - platformFeeCents(sessionCents);
}

export function athleteChargeCents(sessionCents: number): number {
  return sessionCents;
}
