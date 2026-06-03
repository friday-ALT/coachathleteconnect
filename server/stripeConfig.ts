import Stripe from 'stripe';
import type { Response } from 'express';

export const STRIPE_NOT_CONFIGURED = 'STRIPE_NOT_CONFIGURED';

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
