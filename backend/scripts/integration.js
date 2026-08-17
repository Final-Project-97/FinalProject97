import dotenv from 'dotenv';
import '../src/config/database.js';

dotenv.config();

const BASE = process.env.TEST_BASE_URL || 'http://localhost:5001';
const email = `ml09-${Date.now()}@example.com`;
const password = 'password12345';

let token = '';
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
    console.log(`Right ${name}`);
    passed += 1;
  } else {
    console.log(`Wrong ${name}`);
    failed += 1;
  }
}

// 1. Register + login + me
let r = await req('POST', '/api/auth/register', { name: 'ML09', email, password });
assert('register 201', r.status === 201);
token = r.json.token;

r = await req('POST', '/api/auth/login', { email, password });
assert('login 200', r.status === 200);
token = r.json.token;

r = await req('GET', '/api/auth/me', null, true);
assert('me 200 + 5 tokens', r.status === 200 && r.json.aiTokensRemaining === 5);

// 2. AI recommend 5x → token 0 → 403 (butuh AL-07 hidup)
for (let i = 1; i <= 5; i++) {
  r = await req('POST', '/api/ai/recommend', {
    budgetMin: 200000000,
    budgetMax: 400000000,
    needType: 'keluarga',
    passengers: 5,
    priority: 'hemat',
  }, true);
  console.log(`  AI call #${i}: ${r.status}`);
}

r = await req('GET', '/api/auth/me', null, true);
assert('tokens habis', r.json.aiTokensRemaining === 0);

r = await req('POST', '/api/ai/recommend', {
  budgetMin: 200000000,
  budgetMax: 400000000,
  needType: 'keluarga',
  passengers: 5,
}, true);
assert('AI blocked 403 TOKEN_EXHAUSTED', r.status === 403);

// 3. Subscription status free
r = await req('GET', '/api/subscription/status', null, true);
assert('status free tier', r.status === 200 && !r.json.data.premiumActive);

// 4. Checkout (Snap token terbuat)
r = await req('POST', '/api/subscription/checkout', null, true);
assert('checkout snapToken', r.status === 200 && !!r.json.snapToken);

// 5. Webhook simulasi → premium (manual: isi orderId dari step checkout)
// r = await req('POST', '/api/subscription/webhook', midtransPayload);
// assert('premium active after webhook', ...);

console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);