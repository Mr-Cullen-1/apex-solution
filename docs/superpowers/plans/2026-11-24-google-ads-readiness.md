# Google Ads readiness remediation implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Repair the confirmed repository blockers and prepare verifiable staging/account handoffs without production changes.

**Architecture:** Retain App Router and existing booking/Supabase adapters. Isolate analytics behind an explicit readiness gate and a public-route boundary. Add bounded request parsing and a durable, service-role-only booking limiter; notification failures must not invalidate a persisted request.

**Tech Stack:** Next.js, React, TypeScript, PostgreSQL/Supabase, existing Node test harnesses.

**Spec:** User's November 24, 2026 five-phase remediation request; preceding pre-Google Ads audit.

## Global constraints
- Dedicated branch; separate logical commits; relevant verification after each change.
- No production deployment, production data changes, advertising activation, or invented legal/business facts.
- External delivery/call tests require isolated staging or explicitly approved test records.

## Review focus
- Query strings/private routes never become analytics fields or automatic page views.
- Successful booking is counted once; invalid attempts and notification errors do not become false conversions.
- Chunked/false Content-Length bodies must obey the real 8,000-byte limit.
- Missing limiter configuration fails closed with a useful call fallback; spoofable headers do not provide an unbounded bypass.
- Persisted requests survive rejected notification/status-update promises.

## Tasks
### 1. Analytics privacy and GTM handoff
- [ ] Add regression tests for safe locations, private routes and default-disabled loading.
- [ ] Replace root GTM bootstrap with public-route initialization; sanitized page context and one manual page-view owner.
- [ ] Prepare six-event GTM workspace configuration and conversion/duplicate-verification runbook. Account changes remain unverified without access.
- [ ] Run analytics/unit tests and typecheck; commit.

### 2. Legal structure
- [ ] Add noindex Privacy Policy and Terms routes explicitly awaiting owner approval, with no operative legal promises.
- [ ] Centralize required owner inputs and expose footer links; verify rendered routes and metadata; commit.

### 3. Dependency and API security
- [ ] Refresh advisories, upgrade minimum compatible safe releases and lockfile; audit and regression checks; commit dependency changes separately.
- [ ] Reproduce actual body-size bypass, then bound streamed bytes and reject invalid origin/content type.
- [ ] Add atomic persistent booking rate limiter, server-only salt and migration; test SQL permissions/window limits and route failure behavior; commit.

### 4. Booking reliability
- [ ] Reproduce unexpected notification rejection after persistence; isolate delivery outcomes and redact provider errors.
- [ ] Test persistence failure, notification rejection and status-update failure with isolated dependencies; commit.
- [ ] Verify real persistence/email/Telegram only if isolated staging is confirmed; otherwise record BLOCKED.

### 5. Quo and delivery
- [ ] Re-run signature/idempotency/reconciliation tests; review staging prerequisites and restricted RPCs.
- [ ] Run lint, typecheck, build, unit/SQL/browser checks; review whole branch.
- [ ] Update remediation report with evidence, unresolved owner/account/staging requirements, commits, PR and launch recommendation.
- [ ] Push dedicated branch and create draft PR; no merge/deployment/Ads activation.

## Decisions and evidence ledger
- Planning/execution proceeds under the user's explicit implementation authorization; no additional design-approval gate is needed.
- Ruling: external analytics will default off until its container/stream settings are verified. This prevents shipping the known unsafe published container; traffic measurement remains unavailable until authorized account setup.
- Staging has not been identified. Existing credentials must not be treated as staging credentials.
