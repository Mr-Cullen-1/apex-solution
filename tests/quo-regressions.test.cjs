/* eslint-disable @typescript-eslint/no-require-imports -- Synthetic server and SQL regression tests. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const loaded = { exports: {} }; cache.set(file, loaded);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'module', 'exports', code)(name => name === 'server-only' ? {} : name.startsWith('@/') ? load('src/' + name.slice(2) + '.ts') : name.startsWith('.') ? load(path.join(path.dirname(file), name + '.ts')) : require(name), loaded, loaded.exports);
  return loaded.exports;
}
const scope = { orgId: 'ORregression', phoneNumberId: 'PNregression' };
const input = { from: '2026-11-20T00:00:00Z', to: '2026-11-20T02:00:00Z', maxPages: 1 };
const raw = { id: 'ACregression', phoneNumberId: scope.phoneNumberId, direction: 'incoming', status: 'completed', createdAt: '2026-11-20T01:00:00Z', updatedAt: '2026-11-20T01:01:00Z', answeredAt: null, completedAt: '2026-11-20T01:01:00Z', duration: 0, participants: [] };
function event(type, changes = {}, external = []) {
  return { ...load('src/features/quo/model.ts').parseWebhook({ id: 'EV' + type.replaceAll('.', ''), apiVersion: '2026-03-30', type, createdAt: raw.updatedAt,
    data: { context: { ...scope, participants: { resolution: external.length ? 'available' : 'unavailable', external, workspace: [] } }, resource: { ...raw, status: 'unknown', hasVoicemail: false, ...changes } } }, scope), source: 'webhook' };
}
const { database, persist, store: sqlStore } = require("./quo-db.cjs");
const store = (db, selectedScope = scope) => sqlStore(db, load("src/features/quo/model.ts").QuoError, selectedScope);
async function allowResume(db) { await db.exec("update public.quo_reconciliation_runs set last_claimed_at=now()-interval '10 seconds'"); }

test('both missed/completed(unknown) orders yield the same terminal facts', async () => {
  const db = await database();
  try {
    const events = [event('call.missed'), event('call.completed')]; const rows=[];
    for (const order of [events, [...events].reverse()]) {
      await db.exec('truncate public.quo_calls, public.quo_call_events');
      for (const e of order) await persist(db,e);
      rows.push((await db.query('select phase,status,outcome from public.quo_calls')).rows[0]);
    }
    assert.deepEqual(rows[0],rows[1]); assert.equal(rows[0].outcome,'missed'); assert.equal(rows[0].phase,3);
  } finally { await db.close(); }
});
test('late answered enriches empty facts without regressing terminal lifecycle; reversed order agrees', async () => {
  const db = await database();
  try {
    const events=[event('call.completed'),event('call.answered',{ answeredAt:'2026-11-20T01:00:05Z',updatedAt:'2026-11-20T01:00:05Z' },['+15555550123'])]; const rows=[];
    for(const order of [events,[...events].reverse()]) {
      await db.exec('truncate public.quo_calls, public.quo_call_events'); for(const e of order) await persist(db,e);
      rows.push((await db.query('select phase,status,outcome,answered_at,caller_number from public.quo_calls')).rows[0]);
    }
    assert.deepEqual(rows[0],rows[1]); assert.equal(rows[0].phase,3); assert.equal(rows[0].outcome,'answered'); assert.ok(rows[0].answered_at); assert.equal(rows[0].caller_number,'+15555550123');
  } finally { await db.close(); }
});
test('group callers stay unknown before filtering anonymous/blocked/short-code entries', () => {
  const { normalizeApiCall } = load('src/features/quo/model.ts');
  for(const phones of [['Anonymous','+15555550123'],['+15555550123','+15555550124'],['911','+15555550123'],['Blocked'],['Restricted']]) {
    const c=normalizeApiCall({...raw,participants:phones.map(phoneNumber=>({phoneNumber,actorId:null}))},scope);
    assert.equal(c.caller_number,null);
  }
  assert.equal(normalizeApiCall({...raw,participants:[{phoneNumber:'+15555550123',actorId:null}]},scope).caller_number,'+15555550123');
});
test('response-body transport failure retries, malformed JSON/schema do not retry', async () => {
  const { listCalls }=load('src/features/quo/client.ts'); let attempts=0;
  const result=await listCalls({...scope,...input,apiKey:'synthetic'},async()=> {
    attempts++; if(attempts===1) return {ok:true,status:200,text:async()=>{throw new TypeError('terminated');},json:async()=>{throw new TypeError('terminated');}};
    return Response.json({data:[],nextCursor:null});
  },async()=>{});
  assert.equal(attempts,2);assert.equal(result.nextCursor,null);
  for(const body of ['{',JSON.stringify({data:'wrong',nextCursor:null})]) {
    attempts=0;await assert.rejects(listCalls({...scope,...input,apiKey:'synthetic'},async()=>{attempts++;return new Response(body);},async()=>{}),/invalid_api_response/);assert.equal(attempts,1);
  }
});
test('invalid signing key is a configuration error before signature handling', () => {
  const { requiredSecret }=load('src/features/quo/config.ts');const old=process.env.QUO_WEBHOOK_KEY;
  try { for(const key of ['bad','whsec_AA==','whsec_not-base64!!!',' whsec_' + Buffer.alloc(32).toString('base64')]) { process.env.QUO_WEBHOOK_KEY=key;assert.throws(()=>requiredSecret('QUO_WEBHOOK_KEY'),/not_configured/); } }
  finally { if(old===undefined)delete process.env.QUO_WEBHOOK_KEY;else process.env.QUO_WEBHOOK_KEY=old; }
});
test('45/50 timeout resumes remaining five without refetch/reprocessing the prefix', async () => {
  const db=await database();
  try {
    const {reconcileCalls}=load('src/features/quo/reconcile.ts');let clock=0,fetches=0,advances=0;const sql=store(db);
    const deps={scope,store:{...sql,advance:async id=>{const r=await sql.advance(id);clock+=1000;advances++;return r;}},now:()=>clock,list:async()=>{fetches++;return{data:Array.from({length:50},(_,i)=>({...raw,id:'AC'+i})),nextCursor:null};}};
    const first=await reconcileCalls(input,deps);assert.equal(first.status,'partial');assert.equal(first.calls,45);assert.equal(first.pageIndex,45);
    await allowResume(db);const second=await reconcileCalls({runId:first.runId},deps);
    assert.equal(second.status,'completed');assert.equal(second.calls,50);assert.equal(advances,50);assert.equal(fetches,1);
    assert.equal((await db.query('select count(*)::int as n from public.quo_calls')).rows[0].n,50);
  } finally {await db.close();}
});
test('cursor history survives invocations and rejects A-B-A', async () => {
  const db=await database();
  try {
    const {reconcileCalls}=load('src/features/quo/reconcile.ts');let n=0;const deps={scope,store:store(db),list:async()=>({data:[],nextCursor:['A','B','A'][n++]})};
    const a=await reconcileCalls(input,deps);await allowResume(db);
    const b=await reconcileCalls({runId:a.runId},deps);await allowResume(db);
    const c=await reconcileCalls({runId:b.runId},deps);assert.equal(c.status,'failed');assert.equal(c.errorCode,'cursor_loop');assert.equal(c.pages,2);
  } finally {await db.close();}
});

test('failed ingestion rolls back receipt AND page progress; lost ACK preserves committed progress', async () => {
  const db=await database();
  try {
    const sql=store(db), run=await sql.claim(input);
    const invalid={...event('call.completed'),source:'reconciliation'};
    invalid.call.duration_seconds=-1;
    await sql.stage(run.id,[invalid],null);
    await assert.rejects(sql.advance(run.id),/database_unavailable/);
    const failed=(await db.query('select page_index,calls_processed,next_cursor from public.quo_reconciliation_runs')).rows[0];
    assert.deepEqual(failed,{page_index:0,calls_processed:0,next_cursor:null});
    assert.equal((await db.query('select count(*)::int n from public.quo_call_events')).rows[0].n,0);
    await db.exec('truncate public.quo_reconciliation_runs');
    const {reconcileCalls}=load('src/features/quo/reconcile.ts');let advances=0,fetches=0;
    const deps={scope,store:{...sql,advance:async id=>{const r=await sql.advance(id);if(++advances===1)throw Error('ACK lost');return r;}},list:async()=>{fetches++;return {data:[raw,{...raw,id:'ACsecond'}],nextCursor:null};}};
    const first=await reconcileCalls(input,deps);
    assert.equal(first.status,'failed');assert.equal(first.calls,1);assert.equal(first.pageIndex,1);
    await allowResume(db);
    const second=await reconcileCalls({runId:first.runId},deps);
    assert.equal(second.status,'completed');assert.equal(second.calls,2);assert.equal(advances,2);assert.equal(fetches,1);
  } finally {await db.close();}
});

test('lease, throttle, scope and role restrictions protect durable progress; crash resumes by fixed window', async () => {
  const db=await database();
  try {
    const first=store(db),second=store(db),run=await first.claim(input);
    await assert.rejects(second.claim(input),/run_busy/);
    const e={...event('call.completed'),source:'reconciliation'};
    await first.stage(run.id,[e,{...e,eventId:'EVsecond',call:{...e.call,quo_call_id:'ACsecond'}}],null);
    await first.advance(run.id);
    await assert.rejects(store(db,{...scope,orgId:'ORother'}).claim({runId:run.id}),/run_not_found/);
    await db.exec("update public.quo_reconciliation_runs set lease_until=now()-interval '1 second',last_claimed_at=now()-interval '100 seconds'");
    // The first HTTP response may never have arrived, so the caller has no runId.
    const resumed=await second.claim(input);
    assert.equal(resumed.id,run.id);assert.equal(resumed.page_index,1);
    await assert.rejects(first.advance(run.id),/lease_lost/);
    await second.release(run.id,'partial');
    await assert.rejects(first.claim({runId:run.id}),/run_throttled/);
    for(const role of ['anon','authenticated']) {
      await db.exec('set role '+role);
      await assert.rejects(db.query('select page_events from public.quo_reconciliation_runs'));
      await assert.rejects(first.claim(input));await assert.rejects(first.stage(run.id,[],null));
      await assert.rejects(first.advance(run.id));await assert.rejects(first.release(run.id,'partial'));
      await db.exec('reset role');
    }
    await allowResume(db);await db.exec('set role service_role');
    await second.claim({runId:run.id});assert.equal((await second.advance(run.id)).status,'completed');
    await db.exec('reset role');
  } finally {await db.close();}
});

test('late ambiguity clears a guessed caller in either delivery order; voicemail and answered facts survive', async () => {
  const db=await database();
  try {
    const events=[event('call.answered',{answeredAt:'2026-11-20T01:00:05Z',updatedAt:'2026-11-20T01:00:05Z'},['+15555550123']),event('call.completed',{hasVoicemail:true},['Anonymous','+15555550123'])];
    const rows=[];
    for(const order of [events,[...events].reverse()]) {
      await db.exec('truncate public.quo_calls,public.quo_call_events');for(const e of order)await persist(db,e);
      rows.push((await db.query('select phase,outcome,caller_number,answered_at,has_voicemail,metadata from public.quo_calls')).rows[0]);
    }
    assert.deepEqual(rows[0],rows[1]);assert.equal(rows[0].caller_number,null);assert.equal(rows[0].has_voicemail,true);assert.ok(rows[0].answered_at);
  } finally {await db.close();}
});

test('body transport retries are bounded, including abort after headers', async () => {
  const {listCalls}=load('src/features/quo/client.ts');let attempts=0;
  await assert.rejects(listCalls({...scope,...input,apiKey:'synthetic'},async()=>{attempts++;return {ok:true,status:200,text:async()=>{throw new DOMException('aborted','AbortError');}};},async()=>{}),/quo_network_error/);
  assert.equal(attempts,3);
});

test('conflicting single callers at the same provider timestamp remain ambiguous in either order', async () => {
  const db=await database();
  try {
    const a=event('call.completed',{},['+15555550123']);
    const b={...event('call.completed',{},['+15555550124']),eventId:'EVconflict'};
    for(const order of [[a,b],[b,a]]) {
      await db.exec('truncate public.quo_calls,public.quo_call_events');
      for(const e of order)await persist(db,e);
      const row=(await db.query('select caller_number,metadata from public.quo_calls')).rows[0];
      assert.equal(row.caller_number,null);assert.equal(row.metadata.caller_resolution,'ambiguous');
    }
  } finally {await db.close();}
});
