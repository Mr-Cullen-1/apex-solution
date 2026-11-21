/* eslint-disable @typescript-eslint/no-require-imports -- Execute real server TypeScript with a server-only test shim. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const { database, store: sqlStore } = require("./quo-db.cjs");
const store = db => sqlStore(db, load("src/features/quo/model.ts").QuoError, scope);
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const loaded = { exports: {} }; cache.set(file, loaded);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const requireLocal = name => name === 'server-only' ? {} : name.startsWith('@/') ? load('src/' + name.slice(2) + '.ts') : name.startsWith('.') ? load(path.join(path.dirname(file), name + '.ts')) : require(name);
  new Function('require', 'module', 'exports', code)(requireLocal, loaded, loaded.exports);
  return loaded.exports;
}
const scope = { orgId: 'ORtest', phoneNumberId: 'PNtest' };
const secret = 'whsec_' + Buffer.alloc(32, 5).toString('base64');
function fixture(type = 'call.completed', changes = {}) {
  return { id: 'EVtest', apiVersion: '2026-03-30', createdAt: '2026-11-20T01:01:00Z', type, data: {
    context: { orgId: scope.orgId, phoneNumberId: scope.phoneNumberId, participants: { resolution: 'available', external: ['+15555550123'], workspace: ['+15165860826'] } },
    resource: { id: 'ACtest', direction: 'incoming', status: 'answered', createdAt: '2026-11-20T01:00:00Z', updatedAt: '2026-11-20T01:01:00Z', answeredAt: '2026-11-20T01:00:05Z', completedAt: '2026-11-20T01:01:00Z', duration: 55, hasVoicemail: false, ...changes },
  } };
}
function signed(raw, timestamp = Math.floor(Date.now() / 1000), delivery = 'msg_test') {
  const signature = crypto.createHmac('sha256', Buffer.alloc(32, 5)).update(`${delivery}.${timestamp}.`).update(raw).digest('base64');
  return new Headers({ 'webhook-id': delivery, 'webhook-timestamp': String(timestamp), 'webhook-signature': 'v1,' + signature });
}
test('signature uses raw bytes, rejects missing/tampered/expired/future headers and supports rotation', () => {
  assert.ok(fs.existsSync('src/features/quo/signature.ts'), 'Quo signature implementation is missing');
  const { verifySignature } = load('src/features/quo/signature.ts');
  const raw = Buffer.from(JSON.stringify(fixture()));
  assert.equal(verifySignature(raw, signed(raw), secret), true);
  assert.equal(verifySignature(Buffer.concat([raw, Buffer.from(' ')]), signed(raw), secret), false);
  assert.equal(verifySignature(raw, new Headers(), secret), false);
  for (const offset of [-301, 301]) assert.equal(verifySignature(raw, signed(raw, Math.floor(Date.now()/1000) + offset), secret), false);
  const headers = signed(raw); headers.set('webhook-signature', 'v1,invalid ' + headers.get('webhook-signature'));
  assert.equal(verifySignature(raw, headers, secret), true);
  assert.equal(verifySignature(raw, headers, 'bad-key'), false);
});
test('normalization distinguishes answered/missed/voicemail and rejects invalid scope/version/data', () => {
  const { parseWebhook, normalizeApiCall } = load('src/features/quo/model.ts');
  const completed = parseWebhook(fixture(), scope);
  assert.equal(completed.call.outcome, 'answered'); assert.equal(completed.call.duration_seconds, 55);
  const missed = fixture('call.missed', { direction: undefined, status: undefined, answeredAt: undefined, completedAt: undefined, duration: undefined, hasVoicemail: undefined });
  assert.equal(parseWebhook(missed, scope).call.outcome, 'missed');
  assert.equal(parseWebhook(missed, scope).call.has_voicemail, null);
  const voicemail = parseWebhook(fixture('call.completed', { status: 'unanswered', answeredAt: null, hasVoicemail: true }), scope);
  assert.equal(voicemail.call.outcome, 'missed'); assert.equal(voicemail.call.has_voicemail, true);
  assert.equal(parseWebhook(fixture('call.answered'), scope).call.phase, 1);
  assert.equal(parseWebhook(fixture('call.completed', { direction: 'outgoing' }), scope), null);
  assert.equal(parseWebhook({ ...fixture(), type: 'message.received' }, scope), null);
  assert.throws(() => parseWebhook({ ...fixture(), apiVersion: 'v1' }, scope));
  assert.throws(() => parseWebhook(fixture(), { ...scope, orgId: 'ORother' }));
  assert.throws(() => parseWebhook(fixture('call.completed', { duration: -1 }), scope));
  assert.throws(() => parseWebhook(fixture('call.completed', { createdAt: 'not a date' }), scope));
  const unknown = fixture(); unknown.data.context.participants.resolution = 'unavailable';
  assert.equal(parseWebhook(unknown, scope).call.caller_number, null);
  const api = { ...fixture().data.resource, phoneNumberId: 'PNtest', status: 'completed', participants: [{ phoneNumber: '+15555550123', actorId: null }], voicemail: { transcript: 'SECRET_TEXT', recordingUrl: 'SECRET_URL' } };
  const normalized = normalizeApiCall(api, scope);
  assert.equal(normalized.has_voicemail, true); assert.equal(normalized.caller_number, '+15555550123');
  assert.ok(!JSON.stringify(normalized).includes('SECRET'));
});
test('real SQL persistence is atomic, idempotent, ordered and inaccessible to public roles', async () => {
  const db = await database();
  try {
    const { parseWebhook } = load('src/features/quo/model.ts');
    const event = { ...parseWebhook(fixture(), scope), deliveryId: 'msg_first', source: 'webhook' };
    const persist = async value => (await db.query('select public.quo_ingest_call($1::jsonb) as result', [JSON.stringify(value)])).rows[0].result;
    assert.equal(await persist(event), 'processed');
    assert.equal(await persist(event), 'duplicate');
    assert.equal(await persist({ ...event, deliveryId: 'msg_second' }), 'duplicate');
    assert.equal((await db.query('select count(*)::int as n from public.quo_calls')).rows[0].n, 1);
    const older = { ...parseWebhook({ ...fixture('call.answered', { updatedAt: '2026-11-20T01:00:05Z' }), id: 'EVolder' }, scope), deliveryId: 'msg_older', source: 'webhook' };
    assert.equal(await persist(older), 'stale');
    const row = (await db.query('select * from public.quo_calls')).rows[0];
    assert.equal(row.phase, 3); assert.equal(Number(row.duration_seconds), 55); assert.equal(row.outcome, 'answered');
    const missed = { ...parseWebhook({ ...fixture('call.missed', { id: 'ACmissed', answeredAt: null }), id: 'EVmissed' }, scope), source: 'webhook', deliveryId: 'msg_missed' };
    assert.equal(await persist(missed), 'processed');
    const voicemail = { ...parseWebhook({ ...fixture('call.completed', { id: 'ACmissed', status: 'unanswered', answeredAt: null, hasVoicemail: true }), id: 'EVvoicemail' }, scope), source: 'webhook', deliveryId: 'msg_voicemail' };
    assert.equal(await persist(voicemail), 'processed');
    const missedRow = (await db.query("select * from public.quo_calls where quo_call_id='ACmissed'")).rows[0];
    assert.equal(missedRow.outcome, 'missed'); assert.equal(missedRow.has_voicemail, true); assert.equal(missedRow.answered_at, null);
    const answered = { ...parseWebhook({ ...fixture('call.answered', { id: 'ACanswered' }), id: 'EVanswered' }, scope), source: 'webhook', deliveryId: 'msg_answered' };
    assert.equal(await persist(answered), 'processed');
    assert.equal((await db.query("select outcome from public.quo_calls where quo_call_id='ACanswered'")).rows[0].outcome, 'answered');
    const invalid = { ...event, eventId: 'EVbad', deliveryId: 'msg_bad', call: { ...event.call, duration_seconds: -2 } };
    await assert.rejects(persist(invalid));
    assert.equal((await db.query("select count(*)::int as n from public.quo_call_events where event_id='EVbad'")).rows[0].n, 0);
    for (const role of ['anon', 'authenticated']) {
      await db.exec('set role ' + role);
      await assert.rejects(db.query('select * from public.quo_calls'));
      await assert.rejects(persist(event));
      await db.exec('reset role');
    }
    await db.exec('set role service_role'); assert.equal(await persist(event), 'duplicate');
    await db.exec('reset role');
    const rls = (await db.query("select relrowsecurity from pg_class where relname in ('quo_calls','quo_call_events','quo_reconciliation_runs')")).rows;
    assert.equal(rls.length, 3); assert.ok(rls.every(r => r.relrowsecurity));
  } finally { await db.close(); }
});
module.exports = { load, fixture, scope, secret, signed };

test('webhook handler persists before ACK and returns retryable failure without leaking data', async () => {
  assert.ok(fs.existsSync('src/features/quo/webhook.ts'), 'Webhook handler missing');
  const { handleWebhook } = load('src/features/quo/webhook.ts');
  const raw = Buffer.from(JSON.stringify(fixture())); const logs = []; let writes = 0;
  const deps = { scope, key: secret, persist: async () => { writes++; return 'processed'; }, log: code => logs.push(code) };
  const request = headers => new Request('https://example.test/api/webhooks/quo', { method: 'POST', headers, body: raw });
  assert.equal((await handleWebhook(request(new Headers()), deps)).status, 401); assert.equal(writes, 0);
  assert.equal((await handleWebhook(request(signed(raw)), deps)).status, 200); assert.equal(writes, 1);
  const failed = await handleWebhook(request(signed(raw)), { ...deps, persist: async () => { throw new Error('PRIVATE_KEY +15555550123'); } });
  assert.equal(failed.status, 503); assert.ok(!JSON.stringify(logs).includes('PRIVATE'));
  const huge = Buffer.alloc(65537, 32);
  assert.equal((await handleWebhook(new Request('https://example.test', { method: 'POST', body: huge, headers: signed(huge) }), deps)).status, 413);
  const invalid = Buffer.from('{');
  assert.equal((await handleWebhook(new Request('https://example.test', { method: 'POST', body: invalid, headers: signed(invalid) }), deps)).status, 400);
});
test('Quo GET client handles version, cursor, retries, invalid responses and never follows redirects', async () => {
  const { listCalls } = load('src/features/quo/client.ts');
  const options = { ...scope, apiKey: 'test-key', from: '2026-11-19T00:00:00Z', to: '2026-11-20T00:00:00Z', after: 'page_two' };
  let attempts = 0;
  const request = async (url, init) => {
    attempts++; assert.equal(new URL(url).origin, 'https://api.quo.com'); assert.equal(new URL(url).searchParams.get('after'), 'page_two');
    assert.equal(init.headers['Quo-Api-Version'], '2026-03-30'); assert.equal(init.headers.Authorization, 'test-key'); assert.equal(init.redirect, 'error');
    return attempts === 1 ? new Response('', { status: 429 }) : Response.json({ data: [], nextCursor: null });
  };
  assert.deepEqual(await listCalls(options, request, async () => {}), { data: [], nextCursor: null }); assert.equal(attempts, 2);
  await assert.rejects(listCalls(options, async () => new Response('SECRET', { status: 401 }), async () => {}), /quo_unauthorized/);
  await assert.rejects(listCalls(options, async () => new Response('SECRET', { status: 500 }), async () => {}), /quo_unavailable/);
  await assert.rejects(listCalls(options, async () => Response.json({ data: 'bad' }), async () => {}), /invalid_api_response/);
  await assert.rejects(listCalls(options, async () => { throw new Error('SECRET'); }, async () => {}), /quo_network_error/);
});
test('reconciliation uses durable pagination and sanitizes API failure', async () => {
  const db=await database();
  try {
    const {reconcileCalls}=load('src/features/quo/reconcile.ts');
    const raw={...fixture().data.resource,phoneNumberId:scope.phoneNumberId,participants:[],status:'completed'};
    let pages=0;const input={from:'2026-11-19T00:00:00Z',to:'2026-11-20T02:00:00Z',maxPages:3};
    const deps={scope,store:store(db),list:async()=>({data:[raw],nextCursor:++pages===1?'next':null})};
    const result=await reconcileCalls(input,deps);
    assert.equal(result.status,'completed');assert.equal(result.pages,2);
    assert.equal((await db.query('select count(*)::int n from public.quo_call_events')).rows[0].n,1);
    await db.exec("update public.quo_reconciliation_runs set last_claimed_at=now()-interval '10 seconds'");
    const failure=await reconcileCalls(input,{...deps,list:async()=>{throw new Error('PRIVATE');}});
    assert.equal(failure.status,'failed');assert.ok(!JSON.stringify(failure).includes('PRIVATE'));
    assert.equal((await db.query('select status from public.quo_reconciliation_runs where id=$1',[failure.runId])).rows[0].status,'failed');
  } finally {await db.close();}
});

test('reconciliation rejects arbitrary cursors, invalid windows and mixed resume inputs', () => {
  const {parseReconcileInput}=load('src/features/quo/reconcile.ts');
  const input={from:'2026-11-19T00:00:00Z',to:'2026-11-20T02:00:00Z',maxPages:1};
  const runId=crypto.randomUUID();assert.deepEqual(parseReconcileInput({runId}),{runId,maxPages:1});
  for(const bad of [{...input,maxPages:6},{...input,from:input.to},{...input,after:'cursor'},{...input,from:'2025-01-01T00:00:00Z'},{...input,runId},{runId:'bad'}]) assert.throws(()=>parseReconcileInput(bad));
});

test('signed webhook retries and reconciliation use the actual atomic SQL persistence', async () => {
  const db = await database();
  try {
    const { handleWebhook } = load('src/features/quo/webhook.ts');
    const { reconcileCalls } = load('src/features/quo/reconcile.ts');
    const persist = async e => (await db.query('select public.quo_ingest_call($1::jsonb) as result', [JSON.stringify(e)])).rows[0].result;
    const raw = Buffer.from(JSON.stringify(fixture()));
    const send = () => handleWebhook(new Request('https://example.test', { method: 'POST', body: raw, headers: signed(raw) }), { scope, key: secret, persist, log: () => {} });
    assert.equal((await (await send()).json()).status, 'processed');
    assert.equal((await (await send()).json()).status, 'duplicate');
    const input = { from: '2026-11-19T00:00:00Z', to: '2026-11-20T02:00:00Z' };
    const result = await reconcileCalls(input, { scope, store: store(db),
      list: async () => ({ data: [{ ...fixture().data.resource, phoneNumberId: scope.phoneNumberId, status: 'completed', participants: [] }], nextCursor: null }),
    });
    assert.equal(result.status, 'completed');
    assert.equal((await db.query('select count(*)::int as n from public.quo_calls')).rows[0].n, 1);
    assert.equal((await db.query('select count(*)::int as n from public.quo_call_events')).rows[0].n, 2);
    assert.equal((await db.query('select status from public.quo_reconciliation_runs')).rows[0].status, 'completed');
  } finally { await db.close(); }
});

test('HTTP routes fail closed; reconciliation requires its own bearer secret before database/API work', async () => {
  const names = ['QUO_CALL_TRACKING_ENABLED', 'QUO_ORG_ID', 'QUO_PHONE_NUMBER_ID', 'QUO_RECONCILE_SECRET', 'QUO_API_KEY', 'QUO_WEBHOOK_KEY'];
  const saved = Object.fromEntries(names.map(n => [n, process.env[n]]));
  const oldInfo = console.info, oldError = console.error, logs = [];
  console.info = console.error = value => logs.push(value);
  try {
    process.env.QUO_CALL_TRACKING_ENABLED = 'false';
    const webhook = load('src/app/api/webhooks/quo/route.ts');
    const reconcile = load('src/app/api/internal/quo/reconcile/route.ts');
    const request = (body = '{}', auth = '') => new Request('https://example.test', { method: 'POST', headers: { authorization: auth }, body });
    assert.equal((await webhook.POST(request())).status, 503);
    assert.equal((await reconcile.POST(request())).status, 503);
    Object.assign(process.env, { QUO_CALL_TRACKING_ENABLED: 'true', QUO_ORG_ID: scope.orgId, QUO_PHONE_NUMBER_ID: scope.phoneNumberId, QUO_RECONCILE_SECRET: 'x'.repeat(32), QUO_API_KEY: 'FIXTURE_KEY', QUO_WEBHOOK_KEY: secret });
    assert.equal((await reconcile.POST(request())).status, 401);
    assert.equal((await reconcile.POST(request('{}', 'Bearer incorrect'))).status, 401);
    assert.equal((await reconcile.POST(request('{', 'Bearer ' + 'x'.repeat(32)))).status, 400);
    assert.equal((await reconcile.POST(request('{}', 'Bearer ' + 'x'.repeat(32)))).status, 400);
    assert.equal((await webhook.POST(request())).status, 401);
    process.env.QUO_WEBHOOK_KEY='malformed';
    assert.equal((await webhook.POST(request())).status, 503);
    assert.ok(!JSON.stringify(logs).includes('FIXTURE_KEY'));
  } finally {
    for (const name of names) if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name];
    console.info = oldInfo; console.error = oldError;
  }
});
