/* eslint-disable @typescript-eslint/no-require-imports -- Verify actual repository logging and deadlines without database writes. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
test('all notification status-write failures log only a stable category and request ID', async () => {
  const logs = [], signals = []; const original = console.error; console.error = (...args) => logs.push(args);
  const query = { update() { return this; }, eq() { return this; }, abortSignal(signal) { signals.push(signal); return Promise.resolve({ error: { message: 'PRIVATE_CUSTOMER_SECRET' } }); } };
  const load = require('./load-ts.cjs')({ '@/lib/supabase/server': { getSupabaseServerClient: () => ({ from: () => query }) } });
  try {
    const repo = load('src/features/booking/repository.ts');
    await repo.markTelegramSent('test-id', 1); await repo.markTelegramFailed('test-id', 'failure');
    await repo.markEmailSent('test-id', 'email-id'); await repo.markEmailFailed('test-id', 'failure');
    assert.equal(logs.length, 4); assert.doesNotMatch(JSON.stringify(logs), /PRIVATE/);
    assert.equal(signals.length, 4); assert.ok(signals.every(s => s instanceof AbortSignal));
  } finally { console.error = original; }
});
