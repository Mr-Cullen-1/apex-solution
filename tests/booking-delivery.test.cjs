/* eslint-disable @typescript-eslint/no-require-imports -- Exercise real provider adapters against an isolated fetch fixture. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const createLoader = require('./load-ts.cjs');
test('provider errors never return customer text or credentials and sends have an abort signal', async () => {
  const previous = { ...process.env }; const originalFetch = global.fetch;
  const calls = [];
  Object.assign(process.env, { NODE_ENV: 'production', RESEND_API_KEY: 'test-only-key', RESEND_FROM_EMAIL: 'test@example.test', TELEGRAM_BOT_TOKEN: 'test-only-token', TELEGRAM_CHAT_ID: 'test-only-chat' });
  global.fetch = async (url, options) => { calls.push({ url, options }); return new Response(JSON.stringify({ name: 'validation_error', message: 'PRIVATE_CUSTOMER test-only-key', description: 'PRIVATE_CUSTOMER test-only-token', ok: false }), { status: 422 }); };
  try {
    const load = createLoader();
    const email = await load('src/features/booking/email.ts').sendConfirmationEmail({ requestId: 'test-id', fullName: 'Test', email: 'test@example.test', message: 'Test', zipCode: '10001' });
    const telegram = await load('src/features/booking/telegram.ts').sendTelegramMessage('Test');
    assert.equal(email.status, 'failed'); assert.equal(telegram.status, 'failed');
    assert.doesNotMatch(JSON.stringify([email, telegram]), /PRIVATE|test-only/);
    assert.equal(calls.length, 2); assert.ok(calls.every(call => call.options.signal instanceof AbortSignal));
    assert.equal(new Headers(calls[0].options.headers).get('idempotency-key'), 'book-now-confirmation/test-id');
  } finally {
    global.fetch = originalFetch;
    for (const key of ['NODE_ENV','RESEND_API_KEY','RESEND_FROM_EMAIL','TELEGRAM_BOT_TOKEN','TELEGRAM_CHAT_ID']) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
  }
});
