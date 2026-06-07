#!/usr/bin/env node
/**
 * Quick production smoke test — run: node scripts/smoke-test.mjs [baseUrl]
 * Default: https://coachathleteconnect-production.up.railway.app
 */
const BASE = (process.argv[2] || process.env.WEB_APP_URL || 'https://coachathleteconnect-production.up.railway.app').replace(/\/$/, '');

const checks = [
  { name: 'Health', path: '/api/health', expect: 200 },
  { name: 'Landing', path: '/', expect: 200 },
  { name: 'Get started', path: '/auth/get-started', expect: 200 },
  { name: 'Login', path: '/auth/login', expect: 200 },
  { name: 'Browse (public)', path: '/browse', expect: 200 },
  { name: 'Payments config', path: '/api/payments/config', expect: 200 },
  { name: 'Session (unauth)', path: '/api/auth/session', expect: 401 },
];

let passed = 0;
let failed = 0;

for (const c of checks) {
  try {
    const res = await fetch(`${BASE}${c.path}`, { redirect: 'manual' });
    const ok = res.status === c.expect;
    console.log(`${ok ? '✓' : '✗'} ${c.name} — ${res.status} (expected ${c.expect})`);
    ok ? passed++ : failed++;
  } catch (e) {
    console.log(`✗ ${c.name} — ${e.message}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
