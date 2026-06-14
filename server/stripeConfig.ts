import Stripe from 'stripe';
import type { Response } from 'express';

export const STRIPE_NOT_CONFIGURED = 'STRIPE_NOT_CONFIGURED';
export const STRIPE_CONNECT_NOT_ENABLED = 'STRIPE_CONNECT_NOT_ENABLED';

/** Stripe returns this when the platform account has not completed Connect signup. */
export function isStripeConnectNotEnabledError(error: unknown): boolean {
  const msg =
    typeof error === 'object' && error && 'message' in error
      ? String((error as { message?: string }).message)
      : String(error);
  return msg.includes('signed up for Connect');
}

export function stripeConnectNotEnabledBody() {
  return {
    message:
      'Stripe Connect is not enabled on the platform Stripe account. The account owner must open dashboard.stripe.com/connect, complete Connect setup (Express accounts), then try Connect again.',
    code: STRIPE_CONNECT_NOT_ENABLED,
    setupUrl: 'https://dashboard.stripe.com/connect',
  };
}

export function getStripeSecretKey(): string | undefined {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return key && key.length > 0 ? key : undefined;
}

export function isStripeConfigured(): boolean {
  const key = getStripeSecretKey();
  return !!key && (key.startsWith('sk_test_') || key.startsWith('sk_live_'));
}

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, { apiVersion: '2026-02-25.clover' });
  }
  return stripeClient;
}

export function resetStripeClientForTests(): void {
  stripeClient = null;
}

export function stripeNotConfigured(res: Response) {
  return res.status(503).json({
    message:
      'Payments are not configured on this server. Set STRIPE_SECRET_KEY in .env (local) or Railway Variables (production), then restart the API.',
    code: STRIPE_NOT_CONFIGURED,
    configured: false,
    setupUrl: 'https://dashboard.stripe.com/test/apikeys',
  });
}

export function logStripeStatusOnBoot(): void {
  if (isStripeConfigured()) {
    const mode = getStripeSecretKey()!.startsWith('sk_live_') ? 'LIVE' : 'TEST';
    console.log(`[Stripe] Configured (${mode} mode)`);
    if (!process.env.STRIPE_WEBHOOK_SECRET?.trim()) {
      console.warn('[Stripe] STRIPE_WEBHOOK_SECRET not set — webhooks disabled (checkout polling still works)');
    }
  } else {
    console.warn(
      '[Stripe] STRIPE_SECRET_KEY missing — paid bookings and Connect onboarding disabled. Add keys to .env or Railway.',
    );
  }
}
