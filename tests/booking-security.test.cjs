/* eslint-disable @typescript-eslint/no-require-imports -- Route tests isolate remote side effects. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const createLoader = require('./load-ts.cjs');
const valid = { fullName: 'Staging Test', phone: '5165550199', zipCode: '10001', message: 'Test request' };
function route(limit = { status: 'allowed' }) {
  let writes = 0;
  const load = createLoader({
    '@/features/booking/submission-adapter': { submitBookNowRequest: async () => { writes++; return { ok: true, status: 'received', requestId: 'test' }; } },
    '@/features/booking/rate-limit': { checkBookingRateLimit: async () => limit },
  });
  return { post: load('src/app/api/book-now/route.ts').POST, writes: () => writes };
}
function request(body, headers = {}) { return new Request('https://example.test/api/book-now', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://example.test', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) }); }
test('real byte cap rejects oversized bodies without trusting Content-Length', async () => {
  for (const headers of [{}, { 'content-length': '1' }]) {
    const r = route();
    const response = await r.post(request({ ...valid, ignored: 'x'.repeat(8100) }, headers));
    assert.equal(response.status, 413); assert.equal(r.writes(), 0);
  }
});
test('byte cap counts multibyte chunks; cancels stream immediately on overflow', async () => {
  let cancelled = false;
  const stream = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('界'.repeat(2700))); }, cancel() { cancelled = true; } });
  const r = route();
  const response = await r.post(new Request('https://example.test/api/book-now', { method: 'POST', headers: { 'content-type': 'application/json' }, body: stream, duplex: 'half' }));
  assert.equal(response.status, 413); assert.equal(cancelled, true); assert.equal(r.writes(), 0);
});
test('rejects wrong content type, cross-site origin, malformed JSON and invalid fields without persistence', async () => {
  for (const [req, status] of [[request(valid, { 'content-type': 'text/plain' }), 415], [request(valid, { origin: 'https://evil.test' }), 403], [request('{'), 400], [request({}), 400]]) {
    const r = route(); const response = await r.post(req); assert.equal(response.status, status); assert.equal(response.headers.get('cache-control'), 'no-store'); assert.equal(r.writes(), 0);
  }
});
test('rate limited and unavailable protection fail closed; allowed booking preserves 201', async () => {
  for (const [limit, status] of [[{ status: 'limited', retryAfter: 900 }, 429], [{ status: 'unavailable' }, 503], [{ status: 'allowed' }, 201]]) {
    const r = route(limit); const response = await r.post(request(valid)); assert.equal(response.status, status); assert.equal(r.writes(), status === 201 ? 1 : 0);
    if (status === 429) assert.equal(response.headers.get('retry-after'), '900');
  }
});
test('stalled request body is cancelled at its deadline without persistence', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let cancelled = false;
  const r = route();
  const pending = r.post(new Request('https://example.test/api/book-now', { method: 'POST', headers: { 'content-type': 'application/json' }, body: new ReadableStream({ cancel() { cancelled = true; } }), duplex: 'half' }));
  t.mock.timers.tick(5001);
  assert.equal((await pending).status, 408); assert.equal(cancelled, true); assert.equal(r.writes(), 0);
});
test('route execution budget covers worst-case campaign booking plus response headroom', () => {
  const routeModule = createLoader({ '@/features/booking/submission-adapter': {}, '@/features/booking/rate-limit': {} })('src/app/api/book-now/route.ts');
  // Body + limiter + campaign + insert + parallel delivery/status; five seconds headroom.
  assert.ok(routeModule.maxDuration >= 5 + 5 + 5 + 5 + 8 + 3 + 5);
});
