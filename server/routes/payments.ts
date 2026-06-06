import { Router, Request, Response } from 'express';
import type Stripe from 'stripe';
import { db } from '../db';
import { users, coachProfiles, transactions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated, requireRole } from '../replitAuth';
import { storage } from '../storage';
import {
  getStripe,
  isStripeConfigured,
  stripeNotConfigured,
} from '../stripeConfig';
import { fulfillPaidCheckout } from '../stripeFulfillment';
import {
  PLATFORM_FEE_PERCENT,
  athleteChargeCents,
  coachPayoutCents,
  platformFeeCents,
  sessionBaseCents,
} from '@shared/payments';

const router = Router();
const APP_SCHEME = 'coachconnect';

function webBaseUrl(): string {
  return process.env.WEB_APP_URL || 'http://localhost:3000';
}

// ─── GET /api/payments/config — public (app + web check before pay) ───────────
router.get('/config', (_req, res) => {
  res.json({
    configured: isStripeConfigured(),
    currency: 'gbp',
    platformFeePercent: PLATFORM_FEE_PERCENT,
  });
});

// ─── POST /api/payments/create-checkout ──────────────────────────────────────
router.post('/create-checkout', isAuthenticated, requireRole('athlete'), async (req: any, res: Response) => {
  if (!isStripeConfigured()) return stripeNotConfigured(res);

  try {
    const stripe = getStripe();
    const athleteId = req.user.claims.sub;
    const { coachId, requestedDate, requestedStartTime, requestedEndTime, durationMins, message, source } = req.body;
    const isWeb = source === 'web';

    if (!coachId || !requestedDate || !requestedStartTime || !durationMins) {
      return res.status(400).json({ message: 'Missing required booking details' });
    }

    const connection = await storage.getConnection(athleteId, coachId);
    if (!connection || connection.status !== 'ACCEPTED') {
      return res.status(403).json({ message: 'You must have an accepted connection with this coach before booking' });
    }

    const [coach] = await db.select().from(coachProfiles)
      .where(eq(coachProfiles.userId, coachId)).limit(1);
    if (!coach) return res.status(404).json({ message: 'Coach not found' });
    if (!coach.pricePerHour) return res.status(400).json({ message: 'Coach has not set a price' });

    const sessionBase = sessionBaseCents(coach.pricePerHour, durationMins);
    const platformFee = platformFeeCents(sessionBase);
    const coachPayout = coachPayoutCents(sessionBase);
    const totalCharge = athleteChargeCents(sessionBase);

    const [athlete] = await db.select().from(users)
      .where(eq(users.id, athleteId)).limit(1);
    if (!athlete) return res.status(404).json({ message: 'Athlete not found' });

    let stripeCustomerId = athlete.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: athlete.email || undefined,
        name: `${athlete.firstName ?? ''} ${athlete.lastName ?? ''}`.trim() || undefined,
        metadata: { userId: athleteId },
      });
      stripeCustomerId = customer.id;
      await db.update(users).set({ stripeCustomerId }).where(eq(users.id, athleteId));
    }

    const metadata: Record<string, string> = {
      athleteId,
      coachId,
      requestedDate,
      requestedStartTime,
      requestedEndTime: requestedEndTime || '',
      durationMins: String(durationMins),
      message: message || '',
      sessionBase: String(sessionBase),
      platformFee: String(platformFee),
      coachPayout: String(coachPayout),
      totalCharge: String(totalCharge),
      coachStripeAccountId: coach.stripeAccountId || '',
    };

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `Coaching Session with ${coach.name}`,
            description: `${durationMins / 60}hr session on ${requestedDate} at ${requestedStartTime}`,
          },
          unit_amount: totalCharge,
        },
        quantity: 1,
      }],
      success_url: isWeb
        ? `${webBaseUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`
        : `${APP_SCHEME}://payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: isWeb
        ? `${webBaseUrl()}/payment/cancel`
        : `${APP_SCHEME}://payment-cancel`,
      metadata,
    };

    if (coach.stripeAccountId && coach.stripeOnboardingComplete === 1) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFee,
        transfer_data: { destination: coach.stripeAccountId },
      };
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams);

    await db.insert(transactions).values({
      athleteId,
      coachId,
      amount: totalCharge,
      platformFee,
      coachPayout,
      currency: 'gbp',
      status: 'PENDING',
      stripeCheckoutSessionId: checkoutSession.id,
      sessionDate: requestedDate,
      sessionStartTime: requestedStartTime,
      sessionDurationMins: durationMins,
    });

    res.json({ url: checkoutSession.url, checkoutSessionId: checkoutSession.id });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    res.status(500).json({ message: error.message || 'Failed to create checkout session' });
  }
});

// ─── GET /api/payments/checkout-status/:sessionId ────────────────────────────
router.get('/checkout-status/:sessionId', isAuthenticated, async (req: any, res: Response) => {
  if (!isStripeConfigured()) return stripeNotConfigured(res);

  try {
    const stripe = getStripe();
    const athleteId = req.user.claims.sub;
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.athleteId && session.metadata.athleteId !== athleteId) {
      return res.status(403).json({ message: 'Not authorized to view this checkout session' });
    }

    if (session.payment_status === 'paid') {
      const { requestId } = await fulfillPaidCheckout(session);
      return res.json({ status: 'paid', requestId: requestId ?? undefined });
    }

    res.json({ status: session.payment_status });
  } catch (error: any) {
    console.error('Checkout status error:', error);
    res.status(500).json({ message: 'Failed to check payment status' });
  }
});

/** Stripe webhook — must be mounted with express.raw() before express.json(). */
export async function handleStripeWebhook(req: Request, res: Response) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret || !isStripeConfigured()) {
    return res.json({ received: true, skipped: true });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'] as string,
      webhookSecret,
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === 'paid') {
      try {
        await fulfillPaidCheckout(session);
      } catch (e) {
        console.error('Webhook fulfill error:', e);
      }
    }
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge;
    const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null;
    if (piId) {
      await db.update(transactions).set({ status: 'REFUNDED', updatedAt: new Date() })
        .where(eq(transactions.stripePaymentIntentId, piId));
    }
  }

  res.json({ received: true });
}

// ─── POST /api/payments/coach/onboard ────────────────────────────────────────
router.post('/coach/onboard', isAuthenticated, async (req: any, res: Response) => {
  if (!isStripeConfigured()) return stripeNotConfigured(res);

  try {
    const stripe = getStripe();
    const coachUserId = req.user.claims.sub;
    const isWeb = req.body?.source === 'web';

    const [coach] = await db.select().from(coachProfiles)
      .where(eq(coachProfiles.userId, coachUserId)).limit(1);
    if (!coach) return res.status(404).json({ message: 'Coach profile not found' });

    const [user] = await db.select().from(users)
      .where(eq(users.id, coachUserId)).limit(1);

    let stripeAccountId = coach.stripeAccountId;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'GB',
        email: user?.email || undefined,
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        business_type: 'individual',
        metadata: { coachUserId },
      });
      stripeAccountId = account.id;
      await db.update(coachProfiles).set({ stripeAccountId }).where(eq(coachProfiles.userId, coachUserId));
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: isWeb
        ? `${webBaseUrl()}/coach/profile?stripe=refresh`
        : `${APP_SCHEME}://stripe-refresh`,
      return_url: isWeb
        ? `${webBaseUrl()}/coach/profile?stripe=return`
        : `${APP_SCHEME}://stripe-return`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error: any) {
    console.error('Coach onboard error:', error);
    res.status(500).json({ message: error.message || 'Failed to create onboarding link' });
  }
});

// ─── GET /api/payments/coach/status ──────────────────────────────────────────
router.get('/coach/status', isAuthenticated, async (req: any, res: Response) => {
  if (!isStripeConfigured()) {
    return res.json({ configured: false, connected: false, onboardingComplete: false });
  }

  try {
    const stripe = getStripe();
    const coachUserId = req.user.claims.sub;

    const [coach] = await db.select().from(coachProfiles)
      .where(eq(coachProfiles.userId, coachUserId)).limit(1);
    if (!coach) return res.status(404).json({ message: 'Coach profile not found' });

    if (!coach.stripeAccountId) {
      return res.json({ configured: true, connected: false, onboardingComplete: false });
    }

    const account = await stripe.accounts.retrieve(coach.stripeAccountId);
    const onboardingComplete = account.charges_enabled && account.payouts_enabled;

    if (onboardingComplete && coach.stripeOnboardingComplete !== 1) {
      await db.update(coachProfiles)
        .set({ stripeOnboardingComplete: 1 })
        .where(eq(coachProfiles.userId, coachUserId));
    }

    res.json({
      configured: true,
      connected: true,
      onboardingComplete,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements?.currently_due ?? [],
    });
  } catch (error: any) {
    console.error('Coach stripe status error:', error);
    res.status(500).json({ message: 'Failed to check Stripe status' });
  }
});

// ─── GET /api/payments/transactions ─────────────────────────────────────────
router.get('/transactions', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user.claims.sub;
    const all = await db.select().from(transactions)
      .where(eq(transactions.athleteId, userId));
    res.json(all);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

export const paymentsRouter = router;
