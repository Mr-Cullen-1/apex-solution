/* eslint-disable @typescript-eslint/no-require-imports -- Disposable PostgreSQL and pure rate-key tests. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { PGlite } = require('@electric-sql/pglite');
const load = require('./load-ts.cjs')({ '@/lib/supabase/server': { getSupabaseServerClient() { throw new Error('offline'); } } });
const { bookingRateKeys, checkBookingRateLimit } = load('src/features/booking/rate-limit.ts');
test('rate keys ignore spoofed headers outside trusted proxy and never depend on user agent', () => {
  const saved = process.env.VERCEL; delete process.env.VERCEL;
  try {
    const req = ip => new Request('https://example.test', { headers: { 'x-forwarded-for': ip, 'user-agent': ip } });
    const a = bookingRateKeys(req('1.2.3.4'), '(516) 555-0199', 'test-only-salt');
    const b = bookingRateKeys(req('5.6.7.8'), '5165550199', 'test-only-salt');
    assert.deepEqual(a, b); assert.match(a.p_ip_key, /^[a-f0-9]{64}$/); assert.notEqual(a.p_ip_key, a.p_phone_key);
  } finally { if (saved === undefined) delete process.env.VERCEL; else process.env.VERCEL = saved; }
});
test('missing salt and infrastructure failure fail closed', async () => {
  const saved = process.env.BOOKING_RATE_LIMIT_SALT; delete process.env.BOOKING_RATE_LIMIT_SALT;
  try {
    assert.deepEqual(await checkBookingRateLimit(new Request('https://example.test'), '5165550199'), { status: 'unavailable' });
    process.env.BOOKING_RATE_LIMIT_SALT = 'a'.repeat(32);
    assert.deepEqual(await checkBookingRateLimit(new Request('https://example.test'), '5165550199'), { status: 'unavailable' });
  } finally { if (saved === undefined) delete process.env.BOOKING_RATE_LIMIT_SALT; else process.env.BOOKING_RATE_LIMIT_SALT = saved; }
});
test('atomic SQL caps IP and normalized-phone buckets, renews window and denies public roles', async () => {
  const db = new PGlite();
  try {
    await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
    const file = fs.readdirSync('supabase/migrations').find(f => f.endsWith('_booking_rate_limit.sql'));
    assert.ok(file, 'rate-limit migration missing');
    await db.exec(fs.readFileSync('supabase/migrations/' + file, 'utf8'));
    await db.exec('set role service_role');
    const reserve = async (ip, phone) => (await db.query('select public.reserve_booking_attempt($1,$2) as result', [ip.repeat(64), phone.repeat(64)])).rows[0].result.allowed;
    for (let i = 0; i < 3; i++) assert.equal(await reserve('a', 'b'), true);
    assert.equal(await reserve('c', 'b'), false, 'phone cap survives IP rotation');
    assert.equal(await reserve('a', 'd'), true); assert.equal(await reserve('a', 'd'), true);
    assert.equal(await reserve('a', 'e'), false, 'IP cap survives phone rotation');
    await db.exec("update public.booking_rate_buckets set bucket_start = bucket_start - interval '30 minutes'");
    assert.equal(await reserve('a', 'b'), true);
    for (const role of ['anon', 'authenticated']) {
      await db.exec('reset role; set role ' + role);
      await assert.rejects(reserve('a', 'b'), /permission denied/);
      await assert.rejects(db.query('select * from public.booking_rate_buckets'), /permission denied/);
    }
    await db.exec('reset role');
    assert.equal((await db.query("select relrowsecurity from pg_class where relname='booking_rate_buckets'")).rows[0].relrowsecurity, true);
  } finally { await db.close(); }
});
