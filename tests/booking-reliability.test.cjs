/* eslint-disable @typescript-eslint/no-require-imports -- Actual orchestrator with isolated persistence/delivery boundaries. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const createLoader = require('./load-ts.cjs');
function adapter({ insertFails = false, insertThrows = false, telegramThrows = false, statusThrows = false } = {}) {
  const calls = [];
  const row = { id: 'test-request', email: 'test@example.test', source: 'book_now' };
  const repository = {
    createServiceRequest: async () => { calls.push('persist'); if (insertThrows) throw new Error('PRIVATE_DB_DETAIL'); return insertFails ? { ok: false } : { ok: true, row }; },
    markTelegramSent: async () => { calls.push('telegram-status'); if (statusThrows) throw new Error('PRIVATE_STATUS_DETAIL'); },
    markEmailSent: async () => { calls.push('email-status'); }, markEmailFailed: async () => {}, markTelegramFailed: async () => {},
  };
  const load = createLoader({
    '@/lib/supabase/server': { isSupabaseConfigured: () => true },
    './repository': repository,
    './telegram': { isTelegramConfigured: () => true, formatLeadMessage: () => 'synthetic', sendTelegramMessage: async () => { calls.push('telegram'); if (telegramThrows) throw new Error('PRIVATE_PROVIDER_DETAIL'); return { status: 'sent', messageId: 1 }; } },
    './email': { isResendConfigured: () => true, sendConfirmationEmail: async () => { calls.push('email'); return { status: 'sent', messageId: 'email-test' }; } },
  });
  return { submit: load('src/features/booking/submission-adapter.ts').submitBookNowRequest, calls };
}
test('persisted booking remains received when notification or status update unexpectedly rejects', async () => {
  const logs = []; const saved = console.error; console.error = (...args) => logs.push(args);
  try {
    for (const options of [{ telegramThrows: true }, { statusThrows: true }]) {
      const a = adapter(options); assert.deepEqual(await a.submit({}), { ok: true, status: 'received', requestId: 'test-request' });
      assert.equal(a.calls[0], 'persist'); assert.ok(a.calls.includes('email-status'));
    }
    assert.ok(logs.length > 0); assert.ok(!JSON.stringify(logs).includes('PRIVATE'));
  } finally { console.error = saved; }
});
test('persistence error sends no notifications; ambiguous exception advises calling before retry', async () => {
  for (const options of [{ insertFails: true }, { insertThrows: true }]) {
    const a = adapter(options); const result = await a.submit({}); assert.equal(result.ok, false); assert.deepEqual(a.calls, ['persist']);
    if (options.insertThrows) assert.match(result.message, /confirm|before trying/i);
  }
});
