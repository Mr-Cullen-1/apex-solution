# Quo call tracking — Sprint 2

Implemented locally on 20 November 2026. Disabled by default. No production database changes, webhook registration, real calls/messages, commit, push or deployment are part of this sprint.

## Scope and boundaries

Only inbound calls on one explicitly configured Quo organization/phone number are stored. Existing booking tables, booking submission, customer matching, frontend events, GTM and GA4 initialization are unchanged. There is no `phone_lead`, automatic booking, qualified-lead inference, contact sync or messaging automation. A call to the shared business number does not establish website/campaign attribution.

`status` retains the provider's status, while `outcome` is a normalized operational classification (`answered`, `missed`, `failed`, `forwarded`, `abandoned`, `ai_handled`, `unknown`). `has_voicemail` is independent: a missed call can also have voicemail. `answered` describes a connection, not a qualified lead or verified human conversation. Unknown/ambiguous callers remain null.

## Official contract checked

- [Versioned webhook payloads](https://www.quo.com/docs/2026-03-30/webhooks-event-payloads.md): version `2026-03-30`; envelope `data.resource` and `data.context`. `call.missed` has a minimal resource and no direction field; it is an inbound missed-call event. Outgoing answered/completed calls are ignored.
- [Signature validation](https://www.quo.com/docs/2026-03-30/webhooks-signature-validation): `webhook-id`, `webhook-timestamp`, `webhook-signature`; HMAC-SHA256 over `id.timestamp.raw-body`, using decoded `whsec_` secret bytes. Five-minute clock tolerance, constant-time comparison, multiple v1 signatures supported. Legacy OpenPhone signatures are not accepted.
- [Webhook delivery](https://www.quo.com/docs/2026-03-30/webhooks-overview): retries and out-of-order delivery require durable idempotency. Retain deduplication identifiers at least 28 hours (longer than the documented retry schedule); use the approved operational retention period if longer.
- [List calls](https://www.quo.com/docs/2026-03-30/calls/list-calls): fixed `https://api.quo.com/calls`, raw API key in `Authorization`, `Quo-Api-Version: 2026-03-30`, `after` cursor, `nextCursor` response. REST statuses differ from webhook statuses. `include=voicemail` makes voicemail presence explicit; transcript/recording fields in that response are discarded, never stored or logged.
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) and [RPC](https://supabase.com/docs/reference/javascript/rpc): reuse the existing privileged server client; no browser database access.

## Implementation map

| File | Responsibility |
| --- | --- |
| `src/features/quo/model.ts` | Version/scope validation, allowlisted snapshots and status normalization |
| `src/features/quo/signature.ts` | Raw-body signature and replay-window verification |
| `src/features/quo/config.ts` | Disabled-by-default switch and server-only configuration |
| `src/features/quo/webhook.ts` | Bounded 64 KiB body, verify before JSON parse, persist before ACK |
| `src/features/quo/client.ts` | GET-only Quo client, version header, pagination, timeout/retry handling |
| `src/features/quo/repository.ts` | Existing Supabase server client, transactional ingestion RPC, run checkpoints |
| `src/features/quo/reconcile.ts` | Bounded time windows, stable snapshot IDs, safe pagination checkpoints |
| `src/app/api/webhooks/quo/route.ts` | Public POST receiver, authenticated by signature |
| `src/app/api/internal/quo/reconcile/route.ts` | Bearer-protected internal POST reconciliation; no GET job or active scheduler |
| `supabase/migrations/20261120064501_quo_call_tracking.sql` | Three isolated tables and atomic RPC |
| `supabase/migrations/20261120104159_quo_tracking_fixes.sql` | Fact provenance, durable pages, scope leases, cursor history and restricted RPCs |
| `tests/quo.test.cjs`, `tests/quo-regressions.test.cjs`, `tests/quo-db.cjs` | Synthetic signed requests, fault injection, actual SQL/RLS and progress tests |
| `tests/quo-concurrency.cjs` | Opt-in real multi-session localhost PostgreSQL tests |
| `.env.example` | Empty server-only settings and default-disabled flag |
| `package.json`, `package-lock.json` | `test:quo` command and pinned dev-only PGlite dependency |
| `QUO_INTEGRATION_PLAN.md` | Historical plan linked to the implemented Sprint 2 scope |
| `docs/QUO_CALL_TRACKING.md` | Architecture, verification and activation runbook (this file) |

Every runtime module is server-only. The routes use Node.js, not Edge. No secret is public-prefixed or returned. Logs contain only component, controlled result/error code and aggregate reconciliation counts; no raw error messages, caller numbers, request bodies, credentials, recordings or transcripts.

## Database and idempotency

Apply `20261120064501_quo_call_tracking.sql` followed by `20261120104159_quo_tracking_fixes.sql`. Both are additive and neither has been applied to a hosted database. The original migration was preserved; the second upgrades its objects:

1. `quo_calls`: primary key `(org_id, quo_call_id)`, configured phone ID, nullable caller E.164 number, direction, status, outcome, duration, started/answered/completed timestamps, provider update timestamp, lifecycle phase, nullable voicemail flag, allowlisted metadata and persistence timestamps.
2. `quo_call_events`: primary key `(org_id, event_id)`, unique delivery ID, call ID, source/type, processing state, timestamps and duplicate count. No raw payload. Reconciliation uses a deterministic SHA-256 ID of the normalized snapshot, so unchanged calls remain idempotent across repeated scans.
3. `quo_reconciliation_runs`: organization/number, fixed date window, last safe cursor, page/call counts, run status and sanitized failure code. Sprint 2.1 adds a normalized pending page (up to 50 snapshots), per-item index, next page cursor, persistent cursor history, and lease owner/expiry. Pending snapshots contain caller PII under the same service-only access; clear them on page completion and include unfinished runs in the retention policy.

All three tables enable RLS and revoke access from PUBLIC, anon and authenticated. Only service_role has SELECT/INSERT/UPDATE. `quo_ingest_call(jsonb)` is SECURITY INVOKER, has an empty search_path, and is executable only by service_role. Its advisory transaction lock serializes one call, deduplicates event and delivery IDs, and updates the call and receipt in one transaction. A failed call write also rolls back the receipt. Lifecycle uses the maximum phase, provider timestamp and a stable status tie-break. Outcome has separate evidence provenance: unknown never erases a known result, and late lower-phase evidence can fill unknown. Caller and duration have their own timestamps; unavailable caller context cannot erase a known caller, while newer explicit ambiguity/withholding clears it. Conflicting single callers at the same provider timestamp become ambiguous/null instead of selecting a number arbitrarily. Ambiguity is counted before E.164 filtering. Earliest answered/start and latest completion observations are retained; known voicemail presence is monotonic. Only events that add no facts/provenance are marked stale. Distinct events for the same call are retained; a call ID must not be used to discard all subsequent lifecycle events.

The new RPCs are also SECURITY INVOKER with empty search_path, a two-second lock timeout and service_role-only grants. `quo_advance_run` ingests exactly one staged call and updates its page index in one transaction; a failure rolls back both. Cursor/page counters advance only after the page is committed. Window/count/page constraints and scope lease/claim/status indexes protect the run table. Existing fact provenance is backfilled from stored source timestamps; it cannot reconstruct evidence already discarded by an older implementation.

No foreign keys, triggers or updates touch existing booking/customer tables. The privileged key is reused through `src/lib/supabase/server.ts`; admin-session credentials do not grant access to call data.

## Webhook behavior

`POST /api/webhooks/quo` accepts only signed requests for the configured organization, phone number and payload version. It handles `call.answered`, `call.completed`, `call.missed`. Unsupported event types and outgoing calls return `200 ignored` without writing. Valid calls return `200 processed`, `duplicate` or `stale` only after the database RPC finishes.

Missing/invalid signatures return 401; invalid JSON/schema returns 400; wrong scope returns 403; oversized body returns 413. Disabled/missing configuration or database failures return 503. No success is returned for an unpersisted event. Failed database attempts are logged using a safe error code; the transaction is rolled back so Quo can retry. There is no in-memory queue or after-response task that could lose data.

Voicemail presence is read from completed events and reconciliation snapshots. This sprint does not subscribe to `call.voicemail.completed`, download recordings or store transcripts. Delayed voicemail changes are recovered by later overlapping reconciliation windows.

## Reconciliation operations

`POST /api/internal/quo/reconcile` requires `Authorization: Bearer <QUO_RECONCILE_SECRET>`. Never place the secret in a URL. This endpoint must only be called by a trusted operator or protected scheduler; do not expose its bearer token in browser code.

Example JSON body (synthetic dates; choose a fixed window for the intended scan):

```json
{
  "from": "2026-11-19T00:00:00Z",
  "to": "2026-11-20T00:00:00Z",
  "maxPages": 1
}
```

The date interval must be positive and at most 31 days. Default one page per invocation, maximum five; each API page requests at most 50 calls. The response includes `runId`, `status`, cumulative `pages`/`calls`, `nextCursor`, `pageIndex`, and a sanitized `errorCode` on failure. `calls` counts committed persistence attempts (including duplicate/stale snapshots), not leads. Partial work returns 200 with `status: partial`; processing failure returns 503.

Resume using the returned run ID, without dates or a caller-supplied cursor:

```json
{ "runId": "<returned UUID>", "maxPages": 1 }
```

The server owns the fixed window and cursor. `after` is rejected. If a hard termination loses the first response/runId, retry the identical fixed `from`/`to` window: the unfinished run is reused after its lease expires. A completed runId returns its saved result; a new date-window request after completion starts a fresh scan. Different windows may each have unfinished progress, but only one invocation per organization/number can hold a lease.

Before processing a page, its normalized snapshots and next cursor are staged durably. Each call and page index commit atomically. For a 50-call page interrupted after 45 commits, retry processes only the remaining five without refetching the page. A lost RPC response cannot roll progress backwards: release reads committed state and never accepts client counters. A hard crash leaves a 90-second lease; resume after expiry. Former owners cannot mutate the run. Simultaneous scope claims return 409 `run_busy`; more than one admitted invocation per five seconds returns 429 `run_throttled` with `Retry-After: 5`. These are authenticated database-backed admission controls, not a replacement for platform perimeter limits.

Persistent cursor history rejects A-to-B-to-A loops across invocations. History is bounded to 10,000 pages per run; split very large windows. Invalid page/schema data is not silently skipped. A permanently invalid staged item, expired provider cursor or cursor loop needs operator investigation; do not blindly retry forever. Start an overlapping fresh window after correcting the issue when the old cursor cannot recover; stable snapshot IDs protect repeated ingestion. Pending snapshots already fetched are processed without depending on cursor validity.

There are at most three GET attempts per page, each with a five-second timeout covering body reads. Transport failures during either fetch or body reading, 429 and 5xx are retried. Invalid JSON/schema is classified separately and not retried. Backoff honors Retry-After up to two seconds; longer delays return a rate-limit error for later retry. Redirects are forbidden. New fetches stop at 20 seconds; per-call work stops at 45 seconds, leaving room for the last five-second RPC and release inside the 60-second route budget. Database RPCs have five-second client timeouts and two-second lock timeouts.

The API filters by **call creation time, not update time**. Recommended activation schedule: small overlapping recent windows (for example last 48 hours every 10 minutes, adjusted to actual volume and rate limits), plus periodic older lookback and explicit backfill. Exhaust all cursors for each fixed window before declaring success. Calls older than the selected creation window cannot be recovered by that scan, including later voicemail updates to old calls. The schedule is a recommendation; no cron job has been configured.

## Environment

| Variable | Purpose |
| --- | --- |
| `QUO_CALL_TRACKING_ENABLED` | New kill switch; only exact `true` enables endpoints; default disabled |
| `QUO_API_KEY` | Existing key, reused server-side for GET reconciliation only |
| `QUO_ORG_ID` | New explicit allowlist scope; verify against the actual account |
| `QUO_PHONE_NUMBER_ID` | New explicit Quo number ID; verify it belongs to the intended Apex number |
| `QUO_WEBHOOK_KEY` | Versioned whsec_ signing secret, separate from API key; malformed base64/short keys fail configuration with 503 before signature processing |
| `QUO_RECONCILE_SECRET` | New independent random bearer secret, at least 32 characters |
| `SUPABASE_URL`, `SUPABASE_SECRET_KEY` | Existing server client configuration; legacy service-role fallback unchanged |

Sprint 2.1 adds no environment variables. Only Sprint 2 empty placeholders/default false exist in `.env.example`. `.env.local` was not edited or staged. Organization/number IDs, account entitlements, the actual API key's permissions and production connectivity still require verification; tests use synthetic data.

## Production activation — separate authorized work

1. Review the additive migration and caller-data retention/access policy. Calls contain personal data. Decide an explicit retention period, deletion procedure and staff access before collecting it; no broad admin UI or cleanup job is introduced here.
2. Apply/test both migrations in order in an isolated Supabase staging project. Before the upgrade, check any existing run windows/counts against the new constraints; resolve incompatible historical rows under a reviewed data repair rather than skipping constraints. Verify service_role RPC access and anon/authenticated denials via PostgREST, not only SQL. Confirm existing booking flows there. Then review pending migration history and apply only these two intended migrations to production under separate authorization; do not blindly push unrelated pending migrations.
3. Read-only verify the Quo account, API entitlement, organization ID, Apex number ID and existing subscriptions. Reuse the existing API key. Configure the server environment and a new random reconciliation secret; keep tracking disabled until ready.
4. Deploy reviewed code separately. Configure exactly one versioned subscription to `https://apexhomesupport.com/api/webhooks/quo`, scoped to the verified phone ID, for the three call events. Provision its signing secret securely and enable the integration only after the database and environment are ready. Registering that subscription is explicitly deferred, not done by this sprint.
5. Test signed synthetic deliveries in staging, duplicate delivery, delayed/out-of-order events and API reconciliation. Verify no credentials/transcripts enter logs. Check clock synchronization, endpoint reachability, provider delivery timeout and database latency before activation.
6. Set up a trusted POST scheduler with protected bearer auth. Resume partial runs by runId (or retry the identical window after losing the first response), honor 409/429 and lease expiry, monitor `failed`/stuck `running` runs, 401/403/503 webhook responses, duplicates/stale counts and Quo delivery failures. No alert messages are sent by this code.
7. Confirm operational call/voicemail records against Quo, without treating answered as qualified or enabling GA4 conversions. Existing live calls need no test call/message from this implementation.

Rollback is operational: do not reverse the second migration while upgraded code is running. Its new resume API is incompatible with old cursor-based callers. Disable/pause the subscription and scheduler, set `QUO_CALL_TRACKING_ENABLED=false`, retain stored data and deduplication keys. Re-enable and reconcile the interrupted fixed windows when repaired. Do not drop tables or rewrite booking history as rollback.

## Local verification

`npm run test:quo` runs the two test suites against both migrations in disposable PGlite. Quo unit/SQL fixtures never load application environment files or call Quo/Supabase production. Browser checks use the locally built app, disable Quo tracking and intercept lead submissions/external analytics. Coverage includes event-order symmetry, late facts, anonymous/group callers, signature/configuration errors, transport vs JSON errors, 45/50 resume, atomic rollback, lost ACK, crash without runId, lease expiry, scope admission, persisted cursor loops, RLS and public RPC denial.

`node tests/quo-concurrency.cjs` additionally uses 12 independent PostgreSQL connections on a disposable localhost-only cluster, with an observed transaction lock wait. It creates and drops its own random test database. The driver and native binaries are isolated under ignored `node_modules/.quo-pg-tools`, not application dependencies. Local setup uses pinned `@embedded-postgres/windows-x64@18.7.0-beta.19` and `pg@8.23.1`, a cluster in `qa-runs/quo-pg-sprint21`, user `quo_test`, host `127.0.0.1`, port `55439`. Stop that project-owned cluster after testing. No production URL or application credential is accepted by the script.

These tests do not prove hosted Supabase/PostgREST permissions, actual Quo account/delivery behavior, or production latency. Staging gateway verification and separately authorized activation remain required. Platform webhook rate limiting, monitoring and retention operations remain deployment tasks. Previously noted dependency advisories are outside this change; their current status must be checked separately.

### Sprint 2.1 verification on 20 November 2026

- Full `node --test tests/*.test.cjs` against the local production build: **34/34 passed**, including **21 Quo tests**.
- Real PostgreSQL 18.7: **3/3 concurrency checks passed**, each with 12 sessions: duplicate deliveries (actual lock contention observed), scope claims, and lease-protected page advancement.
- `npm run lint`, `npm run typecheck`, `npm run build`: passed. Build used the existing reviews fallback and logged `reviews_fetch_failed`; live review availability was not verified.
- Existing booking/frontend analytics browser regression: **9/9 passed**, no runtime errors. No real lead was submitted.
- Existing GTM isolated fixture: passed across route navigation and private-route checks; no console/page errors. Live GA4 delivery or container publishing was not tested.
- `git diff --check`: passed; no tracked booking, layout, shared Supabase client or frontend analytics changes. `.env.local` remains ignored and untouched.
- Both migrations were applied only to disposable local databases. No account registration, production writes, commit, push or deploy.

### Files changed specifically in Sprint 2.1

- `src/features/quo/model.ts`
- `src/features/quo/signature.ts`
- `src/features/quo/config.ts`
- `src/features/quo/client.ts`
- `src/features/quo/repository.ts`
- `src/features/quo/reconcile.ts`
- `src/app/api/internal/quo/reconcile/route.ts`
- `supabase/migrations/20261120104159_quo_tracking_fixes.sql` (new)
- `tests/quo.test.cjs`
- `tests/quo-regressions.test.cjs` (new)
- `tests/quo-db.cjs` (new)
- `tests/quo-concurrency.cjs` (new)
- `package.json` (test command only)
- `docs/QUO_CALL_TRACKING.md`
- `QUO_INTEGRATION_PLAN.md`

The pre-existing uncommitted Sprint 2 files remain local, including its original migration, webhook handler/route, `.env.example` and PGlite lockfile entry. No new dependency or environment secret is introduced into the application by Sprint 2.1.

**Readiness:** the requested HIGH and reconciliation MEDIUM fixes pass local regression and real concurrent SQL checks. Ready for staging verification; not yet approved for production activation. Remaining gates are both migrations/PostgREST permissions in staging, actual Quo account/scope/signing configuration, latency/retry smoke tests, retention/monitoring and a separately authorized release. Old callers must adopt runId-based resume; no scheduler was registered by this sprint.

### November 24 remediation verification

No Quo credentials, webhook subscription, hosted migration, scheduler or activation flag was changed. Current account discovery still does not establish an isolated Apex staging deployment/database. The existing 21 Quo unit/SQL tests passed again, and all three real PostgreSQL concurrency checks passed with 12 independent local connections (including observed lock contention). This supersedes only local test evidence; historical provider GET results do not prove new delivery or real answered/missed call handling.

Staging handoff: verify separate database and destination URL first; apply the two Quo migrations; securely configure organization/number allowlist, whsec signing key and independent reconciliation secret. Register a staging-only subscription for the documented answered/completed/missed events only after that environment is available. Then test answered and missed calls, duplicate/out-of-order delivery, interrupted runId recovery and compare provider events to persisted facts. Keep production tracking disabled. Real calls, webhook delivery and hosted RLS remain BLOCKED/NOT VERIFIED.
