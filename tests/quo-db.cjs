/* eslint-disable @typescript-eslint/no-require-imports -- Disposable SQL test harness. */
const fs = require("node:fs");
const { randomUUID } = require("node:crypto");
const { PGlite } = require("@electric-sql/pglite");
async function database() {
  const db = new PGlite();
  await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
  for (const f of fs.readdirSync('supabase/migrations').filter(f => /quo_(call_tracking|tracking_fixes)\.sql$/.test(f)).sort()) await db.exec(fs.readFileSync('supabase/migrations/' + f, 'utf8'));
  return db;
}
async function persist(db, e) { return (await db.query('select public.quo_ingest_call($1::jsonb) as result', [JSON.stringify(e)])).rows[0].result; }
function store(db, QuoError, selectedScope, owner = randomUUID()) {
  async function rpc(name, args, casts) {
    try { return (await db.query(`select public.${name}(${casts.map((c,i) => '$' + (i+1) + '::' + c).join(',')}) as result`, args)).rows[0].result; } catch(error) { throw new QuoError(["run_busy","run_throttled","run_not_found","lease_lost","cursor_loop","cursor_history_limit","invalid_page","invalid_window"].includes(error.message) ? error.message : "database_unavailable"); }
  }
  const prefix = [JSON.stringify(selectedScope), owner];
  return {
    claim: i => rpc('quo_claim_run', [...prefix, i.runId ?? null, i.from ?? null, i.to ?? null], ['jsonb','uuid','uuid','timestamptz','timestamptz']),
    stage: (id, events, cursor) => rpc('quo_stage_page', [...prefix,id,JSON.stringify(events),cursor], ['jsonb','uuid','uuid','jsonb','text']),
    advance: id => rpc('quo_advance_run', [...prefix,id], ['jsonb','uuid','uuid']),
    release: (id,status,error) => rpc('quo_release_run', [...prefix,id,status,error ?? null], ['jsonb','uuid','uuid','text','text']),
  };
}

module.exports = { database, store, persist };
