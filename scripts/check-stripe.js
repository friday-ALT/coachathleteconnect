#!/usr/bin/env node
/**
 * Quick Stripe wiring check — run: npm run stripe:check
 */
import 'dotenv/config';

const key = process.env.STRIPE_SECRET_KEY?.trim();
const ok = !!key && (key.startsWith('sk_test_') || key.startsWith('sk_live_'));

console.log('\n💳 Stripe configuration\n');
if (ok) {
  const mode = key.startsWith('sk_live_') ? 'LIVE ⚠️' : 'TEST';
  console.log(`   ✅ STRIPE_SECRET_KEY set (${mode})`);
  console.log(`   ${process.env.STRIPE_WEBHOOK_SECRET?.trim() ? '✅' : '⚪'} STRIPE_WEBHOOK_SECRET ${process.env.STRIPE_WEBHOOK_SECRET?.trim() ? 'set' : '(optional)'}`);
  console.log('\n   Web + mobile use the same API — add keys to Railway for production.\n');
  process.exit(0);
}

console.log('   ❌ STRIPE_SECRET_KEY missing or invalid');
console.log('\n   Fix:');
console.log('   1. Add to DesignSyncMobile-2/.env (see .env.example)');
console.log('   2. Get sk_test_... from https://dashboard.stripe.com/test/apikeys');
console.log('   3. Restart: npm run dev');
console.log('   4. Railway: same vars → redeploy\n');
process.exit(1);
