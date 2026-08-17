import dotenv from 'dotenv';
import '../src/config/database.js';
import { Subscription } from '../src/models/index.js';
import { runExpiryJob } from '../src/subscription/expiry.job.js';

dotenv.config();

const BASE = process.env.TEST_BASE_URL || 'http://localhost:5001';
const SKIP_GOOGLE = process.env.SKIP_GOOGLE_TEST !== '0';
const email = `ml09-${Date.now()}@example.com`;
const password = 'password12345';

const AI_BODY = {
  budgetMin: 200000000,
  budgetMax: 400000000,
  needType: 'keluarga',
  passengers: 5,
  priority: 'hemat',
};

let token = '';
let userId = '';
let checkoutOrderId = '';
let passed = 0;
let failed = 0;

async function req(method, path, body, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

function assert(name, cond) {
  if (cond) {
    console.log(`✓ ${name}`);
    passed += 1;
  } else {
    console.log(`✗ ${name}`);
    failed += 1;
  }
}

function skip(name, reason) {
  console.log(`○ Skip ${name} — ${reason}`);
}

async function simulatePremiumSuccess(orderId) {
  const sub = await Subscription.where('orderId', orderId).first();
  if (!sub) throw new Error(`Subscription tidak ditemukan untuk orderId: ${orderId}`);

  const now = new Date();
  await Subscription.where('_id', sub._id).update({
    expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    startedAt: now,
    paidAt: now,
    paymentStatus: 'success',
    paymentType: 'premium_monthly',
  });
}

console.log(`\n[ML-09] Integration test → ${BASE}\n`);

// === 1. Register + login + me (email) ===
let r = await req('POST', '/api/auth/register', { name: 'ML09', email, password });
assert('register 201', r.status === 201);
token = r.json.token;

r = await req('POST', '/api/auth/login', { email, password });
assert('login 200', r.status === 200);
token = r.json.token;

r = await req('GET', '/api/auth/me', null, true);
assert('me 200 + 5 tokens', r.status === 200 && r.json.aiTokensRemaining === 5);
userId = String(r.json.user?._id || '');

// === 2. Google login → me (opsional) ===
if (SKIP_GOOGLE) {
  skip('google login → me', 'set SKIP_GOOGLE_TEST=0 + GOOGLE_ID_TOKEN untuk test real');
} else {
  const googleToken = process.env.GOOGLE_ID_TOKEN;
  if (!googleToken) {
    skip('google login → me', 'GOOGLE_ID_TOKEN kosong di env');
  } else {
    r = await req('POST', '/api/auth/google', { idToken: googleToken });
    assert('google login 200', r.status === 200 && !!r.json.token);
    token = r.json.token;

    r = await req('GET', '/api/auth/me', null, true);
    assert('google me 200', r.status === 200 && !!r.json.user?.email);
  }
}

// === 3. AI recommend 5× → token 0 → 403 ===
for (let i = 1; i <= 5; i++) {
  r = await req('POST', '/api/ai/recommend', AI_BODY, true);
  console.log(`  AI call #${i}: ${r.status}`);
}

r = await req('GET', '/api/auth/me', null, true);
assert('tokens habis', r.status === 200 && r.json.aiTokensRemaining === 0);

r = await req('POST', '/api/ai/recommend', AI_BODY, true);
assert(
  'AI blocked 403 TOKEN_EXHAUSTED',
  r.status === 403 && r.json.code === 'TOKEN_EXHAUSTED',
);

// === 4. Subscription status free ===
r = await req('GET', '/api/subscription/status', null, true);
assert('status free tier', r.status === 200 && !r.json.data.premiumActive);

// === 5. Checkout (Snap token) ===
r = await req('POST', '/api/subscription/checkout', null, true);
assert('checkout snapToken', r.status === 200 && !!r.json.snapToken);
checkoutOrderId = r.json.orderId || '';

// === 6. Simulasi webhook sukses → premium → AI lolos ===
if (!checkoutOrderId) {
  skip('premium simulate', 'orderId kosong dari checkout');
} else {
  try {
    await simulatePremiumSuccess(checkoutOrderId);

    r = await req('GET', '/api/subscription/status', null, true);
    assert(
      'premium active after simulate webhook',
      r.status === 200 && r.json.data.premiumActive === true,
    );

    r = await req('POST', '/api/ai/recommend', AI_BODY, true);
    assert('AI lolos saat premium', r.status === 200);
  } catch (err) {
    console.log(`✗ premium simulate — ${err.message}`);
    failed += 1;
  }
}

// === 7. Expired → cron → AI diblok ===
if (!checkoutOrderId) {
  skip('expired → AI blocked', 'checkoutOrderId tidak ada');
} else {
  try {
    const sub = await Subscription.where('orderId', checkoutOrderId).first();
    if (!sub) throw new Error('Subscription tidak ditemukan untuk test expired');

    await Subscription.where('_id', sub._id).update({
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });

    await runExpiryJob();

    r = await req('GET', '/api/subscription/status', null, true);
    assert(
      'premium inactive after expire',
      r.status === 200 && !r.json.data.premiumActive,
    );

    r = await req('GET', '/api/auth/me', null, true);
    assert(
      'tokens 0 after expiry cron',
      r.status === 200 && r.json.aiTokensRemaining === 0,
    );

    r = await req('POST', '/api/ai/recommend', AI_BODY, true);
    assert(
      'AI blocked when expired',
      r.status === 403 && r.json.code === 'TOKEN_EXHAUSTED',
    );
  } catch (err) {
    console.log(`✗ expired test — ${err.message}`);
    failed += 1;
  }
}

console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);