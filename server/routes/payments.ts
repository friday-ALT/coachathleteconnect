import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { users, coachProfiles, timeSlotRequests, transactions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// ─── Stripe client ────────────────────────────────────────────────────────────
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' });
}

const PLATFORM_FEE_PERCENT = 0.15; // 15% platform fee
const APP_SCHEME = 'coachconnect';  // matches app.json "scheme"

// ─── POST /api/payments/create-checkout ──────────────────────────────────────
// Athlete calls this to get a Stripe Checkout URL for booking a session
router.post('/create-checkout', isAuthenticated, async (req: any, res: Response) => {
  try {
    const stripe = getStripe();
    const athleteId = req.user.claims.sub;
    const { coachId, requestedDate, requestedStartTime, requestedEndTime, durationMins, message } = req.body;

    if (!coachId || !requestedDate || !requestedStartTime || !durationMins) {
      return res.status(400).json({ message: 'Missing required booking details' });
    }

    // Load coach profile for price + Stripe account
    const [coach] = await db.select().from(coachProfiles)
      .where(eq(coachProfiles.userId, coachId)).limit(1);
    if (!coach) return res.status(404).json({ message: 'Coach not found' });
    if (!coach.pricePerHour) return res.status(400).json({ message: 'Coach has not set a price' });

    // Calculate amounts (all in pence/cents)
    const amount      = Math.round(coach.pricePerHour * durationMins / 60);
    const platformFee = Math.round(amount * PLATFORM_FEE_PERCENT);
    const coachPayout = amount - platformFee;

    // Load athlete info for Stripe customer
    const [athlete] = await db.select().from(users)
      .where(eq(users.id, athleteId)).limit(1);
    if (!athlete) return res.status(404).json({ message: 'Athlete not found' });

    // Create or retrieve Stripe customer for athlete
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

    // Build metadata for webhook to use
    const metadata: Record<string, string> = {
      athleteId,
      coachId,
      requestedDate,
      requestedStartTime,
      requestedEndTime: requestedEndTime || '',
      durationMins: String(durationMins),
      message: message || '',
      amount: String(amount),
      platformFee: String(platformFee),
      coachPayout: String(coachPayout),
      coachStripeAccountId: coach.stripeAccountId || '',
    };

    // Build checkout session params
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
          unit_amount: amount,
        },
        quantity: 1,
      }],
      // Deep link back to app after payment
      success_url: `${APP_SCHEME}://payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_SCHEME}://payment-cancel`,
      metadata,
    };

    // If coach has a connected Stripe account, route money to them automatically
    if (coach.stripeAccountId && coach.stripeOnboardingComplete === 1) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFee,
        transfer_data: { destination: coach.stripeAccountId },
      };
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams);

    // Create a PENDING transaction record
    await db.insert(transactions).values({
      athleteId,
      coachId,
      amount,
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
// Mobile polls this after returning from Stripe to confirm payment status
router.get('/checkout-status/:sessionId', isAuthenticated, async (req: any, res: Response) => {
  try {
    const stripe = getStripe();
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Find the pending transaction and mark complete
      const [tx] = await db.select().from(transactions)
        .where(eq(transactions.stripeCheckoutSessionId, sessionId)).limit(1);

      if (tx && tx.status === 'PENDING') {
        await db.update(transactions).set({
          status: 'COMPLETED',
          stripePaymentIntentId: typeof session.payment_intent === 'string'
            ? session.payment_intent : session.payment_intent?.id ?? null,
          updatedAt: new Date(),
        }).where(eq(transactions.id, tx.id));

        // Create the session request (now confirmed with payment)
        const m = session.metadata!;
        const [newRequest] = await db.insert(timeSlotRequests).values({
          athleteId: m.athleteId,
          coachId: m.coachId,
          requestedDate: m.requestedDate,
          requestedStartTime: m.requestedStartTime,
          requestedEndTime: m.requestedEndTime || null,
          message: m.message || null,
          status: 'PENDING', // still needs coach to accept
        }).returning();

        // Link the request to the transaction
        await db.update(transactions).set({ requestId: newRequest.id })
          .where(eq(transactions.id, tx.id));

        return res.json({ status: 'paid', requestId: newRequest.id });
      }

      return res.json({ status: 'paid' });
    }

    res.json({ status: session.payment_status });
  } catch (error: any) {
    console.error('Checkout status error:', error);
    res.status(500).json({ message: 'Failed to check payment status' });
  }
});

// ─── POST /api/payments/webhook ──────────────────────────────────────────────
// Stripe calls this for async payment events
router.post('/webhook', async (req: Request, res: Response) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return res.json({ received: true });

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
      const [tx] = await db.select().from(transactions)
        .where(eq(transactions.stripeCheckoutSessionId, session.id)).limit(1);
      if (tx && tx.status === 'PENDING') {
        await db.update(transactions).set({
          status: 'COMPLETED',
          stripePaymentIntentId: typeof session.payment_intent === 'string'
            ? session.payment_intent : null,
          updatedAt: new Date(),
        }).where(eq(transactions.id, tx.id));
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
});

// ─── POST /api/payments/coach/onboard ────────────────────────────────────────
// Returns a Stripe Connect Express onboarding URL for the coach
router.post('/coach/onboard', isAuthenticated, async (req: any, res: Response) => {
  try {
    const stripe = getStripe();
    const coachUserId = req.user.claims.sub;

    const [coach] = await db.select().from(coachProfiles)
      .where(eq(coachProfiles.userId, coachUserId)).limit(1);
    if (!coach) return res.status(404).json({ message: 'Coach profile not found' });

    const [user] = await db.select().from(users)
      .where(eq(users.id, coachUserId)).limit(1);

    let stripeAccountId = coach.stripeAccountId;

    // Create a new Connected Account if none exists
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

    // Generate an onboarding link (valid for ~10 minutes)
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${APP_SCHEME}://stripe-refresh`,
      return_url:  `${APP_SCHEME}://stripe-return`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error: any) {
    console.error('Coach onboard error:', error);
    res.status(500).json({ message: error.message || 'Failed to create onboarding link' });
  }
});

// ─── GET /api/payments/coach/status ──────────────────────────────────────────
// Returns whether the coach has connected Stripe + their payout status
router.get('/coach/status', isAuthenticated, async (req: any, res: Response) => {
  try {
    const stripe = getStripe();
    const coachUserId = req.user.claims.sub;

    const [coach] = await db.select().from(coachProfiles)
      .where(eq(coachProfiles.userId, coachUserId)).limit(1);
    if (!coach) return res.status(404).json({ message: 'Coach profile not found' });

    if (!coach.stripeAccountId) {
      return res.json({ connected: false, onboardingComplete: false });
    }

    const account = await stripe.accounts.retrieve(coach.stripeAccountId);
    const onboardingComplete = account.charges_enabled && account.payouts_enabled;

    // Sync the flag in DB if it changed
    if (onboardingComplete && coach.stripeOnboardingComplete !== 1) {
      await db.update(coachProfiles)
        .set({ stripeOnboardingComplete: 1 })
        .where(eq(coachProfiles.userId, coachUserId));
    }

    res.json({
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
// Returns the current user's transaction history
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
