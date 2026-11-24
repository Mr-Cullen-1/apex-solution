/* eslint-disable @typescript-eslint/no-require-imports -- Opt-in disposable localhost PostgreSQL test, never accepts application credentials. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const { Client } = require('../node_modules/.quo-pg-tools/node_modules/pg');
const options = { host: '127.0.0.1', port: 55439, user: 'quo_test', database: 'postgres', connectionTimeoutMillis: 3000 };
const name = 'booking_regression_' + randomUUID().replaceAll('-', '');
(async () => {
  const admin = new Client(options), clients = []; let created = false;
  try {
    await admin.connect();
    assert.deepEqual((await admin.query('select current_user,inet_server_addr()::text address,inet_server_port() port')).rows[0], { current_user: 'quo_test', address: '127.0.0.1/32', port: 55439 });
    await admin.query('create database ' + name); created = true;
    const setup = new Client({ ...options, database: name }); clients.push(setup); await setup.connect();
    const migration = fs.readdirSync('supabase/migrations').find(f => f.endsWith('_booking_rate_limit.sql'));
    await setup.query(fs.readFileSync('supabase/migrations/' + migration, 'utf8'));
    for (let i = 0; i < 12; i++) { const c = new Client({ ...options, database: name }); clients.push(c); await c.connect(); await c.query('set role service_role'); }
    const workers = clients.slice(1);
    const reserve = (c, ip, phone) => c.query('select public.reserve_booking_attempt($1,$2) result', [ip, phone]);
    await workers[0].query('begin');
    assert.equal((await reserve(workers[0], 'a'.repeat(64), 'b'.repeat(64))).rows[0].result.allowed, true);
    const pending = Promise.all(workers.slice(1).map(c => reserve(c, 'a'.repeat(64), 'b'.repeat(64))));
    let waiting = false;
    for (let i = 0; i < 30 && !waiting; i++) {
      waiting = (await admin.query("select count(*)::int n from pg_stat_activity where datname=$1 and wait_event_type='Lock'", [name])).rows[0].n > 0;
      if (!waiting) await new Promise(resolve => setTimeout(resolve, 20));
    }
    assert.ok(waiting, 'actual overlapping lock wait'); await workers[0].query('commit');
    assert.equal((await pending).filter(r => r.rows[0].result.allowed).length, 2);
    assert.equal((await setup.query('select max(attempts)::int n from public.booking_rate_buckets')).rows[0].n, 3);
    console.log('PASS 12 concurrent same-phone requests: exactly 3 admitted, actual lock wait observed');
    const separatePhones = await Promise.all(workers.map((c, i) => reserve(c, 'c'.repeat(64), i.toString(16).padStart(64, '0'))));
    assert.equal(separatePhones.filter(r => r.rows[0].result.allowed).length, 5);
    console.log('PASS 12 concurrent different-phone requests: exactly 5 admitted for one IP');
    await workers[0].query('begin'); await reserve(workers[0], 'd'.repeat(64), 'e'.repeat(64)); await workers[0].query('rollback');
    assert.equal((await setup.query('select count(*)::int n from public.booking_rate_buckets where rate_key=$1', ['d'.repeat(64)])).rows[0].n, 0);
    console.log('PASS rollback removes both rate reservations');
  } finally {
    for (const c of clients) await c.end().catch(() => {});
    if (created) await admin.query('drop database ' + name);
    await admin.end();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
