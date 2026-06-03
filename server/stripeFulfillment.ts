import type Stripe from 'stripe';
import { db } from './db';
import { transactions, timeSlotRequests } from '@shared/schema';
import { eq } from 'drizzle-orm';

/** Mark transaction paid and create time_slot_request if not already linked. */
export async function fulfillPaidCheckout(
  session: Stripe.Checkout.Session,
): Promise<{ requestId?: string; alreadyFulfilled: boolean }> {
  const [tx] = await db.select().from(transactions)
    .where(eq(transactions.stripeCheckoutSessionId, session.id))
    .limit(1);

  if (!tx) {
    return { alreadyFulfilled: true };
  }

  if (tx.requestId) {
    return { requestId: tx.requestId, alreadyFulfilled: true };
  }

  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id ?? null;

  if (tx.status === 'PENDING') {
    await db.update(transactions).set({
      status: 'COMPLETED',
      stripePaymentIntentId: paymentIntentId,
      updatedAt: new Date(),
    }).where(eq(transactions.id, tx.id));
  }

  const m = session.metadata;
  if (!m?.athleteId || !m?.coachId || !m?.requestedDate || !m?.requestedStartTime) {
    return { alreadyFulfilled: false };
  }

  const [newRequest] = await db.insert(timeSlotRequests).values({
    athleteId: m.athleteId,
    coachId: m.coachId,
    requestedDate: m.requestedDate,
    requestedStartTime: m.requestedStartTime,
    requestedEndTime: m.requestedEndTime || null,
    message: m.message || null,
    status: 'PENDING',
  }).returning();

  await db.update(transactions).set({ requestId: newRequest.id })
    .where(eq(transactions.id, tx.id));

  return { requestId: newRequest.id, alreadyFulfilled: false };
}
