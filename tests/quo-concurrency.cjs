/* eslint-disable @typescript-eslint/no-require-imports -- Opt-in local PostgreSQL concurrency check. */
// Requires the disposable quo_test cluster bound only to 127.0.0.1:55439.
// Never reads application credentials or accepts a production connection URL.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const { Client } = require('../node_modules/.quo-pg-tools/node_modules/pg');
const options = { host: '127.0.0.1', port: 55439, user: 'quo_test', database: 'postgres', connectionTimeoutMillis: 3000 };
const databaseName = 'quo_regression_' + randomUUID().replaceAll('-', '');
const scope = { orgId: 'ORconcurrency', phoneNumberId: 'PNconcurrency' };
const event = {
  eventId: 'EVconcurrent', deliveryId: 'msg_concurrent', eventType: 'call.completed', source: 'webhook',
  call: { org_id: scope.orgId, phone_number_id: scope.phoneNumberId, quo_call_id: 'ACconcurrent',
    caller_number: null, direction: 'incoming', status: 'unknown', outcome: 'unknown', phase: 3,
    duration_seconds: null, started_at: '2026-11-20T01:00:00Z', answered_at: null,
    completed_at: '2026-11-20T01:01:00Z', source_updated_at: '2026-11-20T01:01:00Z',
    has_voicemail: false, metadata: { api_version: '2026-03-30', caller_resolution: 'unavailable' } },
};

(async () => {
  const admin = new Client(options), clients = [];
  let created = false;
  try {
    await admin.connect();
    const identity = (await admin.query('select current_user,inet_server_addr()::text address,inet_server_port() port')).rows[0];
    assert.deepEqual(identity, { current_user: 'quo_test', address: '127.0.0.1/32', port: 55439 });
    for (const role of ['anon', 'authenticated', 'service_role']) {
      if (!(await admin.query('select 1 from pg_roles where rolname=$1', [role])).rowCount) {
        await admin.query('create role ' + role + (role === 'service_role' ? ' bypassrls' : ''));
      }
    }
    await admin.query('create database ' + databaseName); created = true;
    const setup = new Client({ ...options, database: databaseName });
    clients.push(setup); await setup.connect();
    for (const file of fs.readdirSync('supabase/migrations').filter(f => /quo_(call_tracking|tracking_fixes)\.sql$/.test(f)).sort()) {
      await setup.query(fs.readFileSync('supabase/migrations/' + file, 'utf8'));
    }
    for (let i = 0; i < 12; i++) {
      const client = new Client({ ...options, database: databaseName });
      clients.push(client); await client.connect(); await client.query('set role service_role');
    }
    const workers = clients.slice(1);
    const ingest = (client, value) => client.query('select public.quo_ingest_call($1::jsonb) result', [JSON.stringify(value)]);
    // Hold a transaction open so the other sessions must actually contend.
    await workers[0].query('begin');
    assert.equal((await ingest(workers[0], event)).rows[0].result, 'processed');
    const pending = workers.slice(1).map((client, i) => ingest(client, i % 2 ? event : { ...event, eventId: 'EVdelivery' + i }));
    const settled = Promise.all(pending);
    let waiting = false;
    for (let i = 0; i < 30 && !waiting; i++) {
      waiting = (await admin.query("select count(*)::int n from pg_stat_activity where datname=$1 and wait_event_type='Lock'", [databaseName])).rows[0].n > 0;
      if (!waiting) await new Promise(resolve => setTimeout(resolve, 20));
    }
    assert.ok(waiting, 'Expected actual overlapping lock waits');
    await workers[0].query('commit');
    assert.ok((await settled).every(r => r.rows[0].result === 'duplicate'));
    assert.equal((await setup.query('select count(*)::int n from public.quo_calls')).rows[0].n, 1);
    assert.equal((await setup.query('select count(*)::int n from public.quo_call_events')).rows[0].n, 1);
    console.log('PASS 12 concurrent deliveries: one call, one receipt, 11 duplicates (observed lock wait)');

    const owners = workers.map(() => randomUUID());
    const claims = await Promise.allSettled(workers.map((client, i) => client.query(
      'select public.quo_claim_run($1::jsonb,$2::uuid,null,$3::timestamptz,$4::timestamptz) result',
      [JSON.stringify(scope), owners[i], '2026-11-20T00:00:00Z', '2026-11-20T02:00:00Z'],
    )));
    assert.equal(claims.filter(r => r.status === 'fulfilled').length, 1);
    assert.ok(claims.filter(r => r.status === 'rejected').every(r => r.reason.message === 'run_busy'));
    const winner = claims.findIndex(r => r.status === 'fulfilled'), run = claims[winner].value.rows[0].result;
    assert.equal((await setup.query('select count(*)::int n from public.quo_reconciliation_runs')).rows[0].n, 1);
    console.log('PASS 12 concurrent claims: one scope lease, 11 run_busy responses');

    await workers[winner].query('select public.quo_stage_page($1::jsonb,$2::uuid,$3::uuid,$4::jsonb,null)',
      [JSON.stringify(scope), owners[winner], run.id, JSON.stringify([{ ...event, source: 'reconciliation', eventId: 'EVreconcile', deliveryId: undefined }])]);
    const advances = await Promise.allSettled(workers.map((client, i) => client.query(
      'select public.quo_advance_run($1::jsonb,$2::uuid,$3::uuid) result', [JSON.stringify(scope), owners[i], run.id],
    )));
    assert.equal(advances.filter(r => r.status === 'fulfilled').length, 1);
    assert.ok(advances.filter(r => r.status === 'rejected').every(r => r.reason.message === 'lease_lost'));
    const row = (await setup.query('select status,calls_processed,pages_processed from public.quo_reconciliation_runs')).rows[0];
    assert.deepEqual(row, { status: 'completed', calls_processed: 1, pages_processed: 1 });
    console.log('PASS concurrent page progress: only lease owner commits call + cursor');
    console.log('PostgreSQL ' + (await setup.query('show server_version')).rows[0].server_version);
  } finally {
    await Promise.allSettled(clients.map(client => client.end()));
    if (created) await admin.query('drop database ' + databaseName);
    await admin.end();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
