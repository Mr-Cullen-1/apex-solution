# Staging and analytics access handoff

Updated November 24, 2026 after the owner's staging clarification. This document records configuration inspection, not authorization to create environments or modify live services.

## Verified configuration

| Item | Observed state | Meaning |
|---|---|---|
| Repository | `Mr-Cullen-1/apex-solution`, remediation branch `fix/google-ads-readiness-2026-11-24`, draft PR #1 | Local changes are reviewable; no merge or release performed |
| Vercel link/config | No `vercel.json` or `.vercel/project.json`; repository-filtered connector query returned no projects in its current account context | Production project/team and preview environment scope cannot be verified through this connection |
| Staging files | No `.env.staging` or `.env.staging.local` | No local evidence of isolated staging; not proof that none exists elsewhere |
| Supabase | Local configured host `tadwrcbhisqswixwuqze.supabase.co`; no `supabase/config.toml` or CLI project-ref link | Treat existing credentials as production-sensitive and ineligible for test writes |
| Supabase account access | Connector exposes an unrelated inactive project, not the configured Apex project | Hosted schema/RLS and staging isolation remain inaccessible; no database query or migration was run in this follow-up |
| GTM container | `GTM-5JLZPN4Q` in local configuration and `.env.example` | Identifier is known; authenticated workspace permissions are not established |
| GA4 measurement | `G-50J6LW5JET` in the inspected audit evidence and GTM draft | Measurement ID is known; the GA4 numeric property ID, stream ID and account access still need confirmation |
| New analytics activation | `NEXT_PUBLIC_GA4_ID` unset; readiness evaluates false | The remediation code does not load external analytics by default |
| Booking limiter | `BOOKING_RATE_LIMIT_SALT` absent locally | A staging secret and migration are prerequisites before deployment; missing protection returns controlled 503 |
| Quo | Tracking evaluates false; API credential present, webhook/reconciliation credentials absent | Credential presence is not staging authorization or proof of delivery readiness |

Existing Supabase/Resend/Telegram/Quo credential values were neither printed nor changed. Credentials being present does not make those destinations safe for synthetic traffic.

## Exact information and access required

1. **Vercel:** correct team/project identifiers and read access to deployments and environment scopes. Provide an existing isolated staging URL and its Git branch, or separately approve creation after reviewing a concrete proposal. Confirm that Preview variables do not point to production write credentials. No environment will be created under the current authorization.
2. **Supabase:** separate staging project reference/URL and access to inspect its schema, migrations, RLS and RPC grants. Confirm separation from production data. Provision staging server credentials and the booking limiter salt through a secure environment/secret manager; do not paste values into chat. Applying migrations requires the verified staging target first.
3. **GTM:** access to inspect container `GTM-5JLZPN4Q` and identify its account; an isolated staging container/workspace for draft import and Preview. Live-container modification or publishing requires separate approval. The supplied JSON still needs import validation.
4. **GA4:** numeric property ID and web-stream ID corresponding to `G-50J6LW5JET`, read access to configuration/DebugView, and an isolated test property/stream with permission to configure its events. Confirm primary booking versus secondary contact/call-intent definitions and owner-approved consent/data practices. Live changes remain deferred.
5. **Booking/notifications:** approved synthetic customer identity, test email inbox, verified Resend sender/domain and provider-log access, dedicated Telegram chat/topic and bot membership. State the allowed test records and cleanup boundaries. Real persistence and delivery stay **BLOCKED** until isolation is verified.
6. **Quo:** dedicated staging number or explicitly isolated scope, organization/number identifiers, staging-only webhook destination and secure signing/reconcile credentials. Approve a real-call test window and recipients. Webhook registration and answered/missed call tests stay **BLOCKED** until these exist.
7. **Business/legal:** approved operator/DBA, privacy/support contacts, actual sharing/retention/call/SMS practices and operative policy/terms text; evidence for advertised business claims. Details are in `LEGAL_APPROVAL_REQUIRED.md`.

## Work already completed without staging

Dependency upgrades, analytics privacy boundaries/GTM draft, legal page structures, bounded booking parsing and durable quota migration, notification failure isolation, log redaction and local Quo verification are committed. Last code verification passed 49 unit/SQL/HTTP tests, 45 responsive cases, nine frontend analytics groups, enabled/disabled analytics fixtures and six native database concurrency checks. Lint/typecheck/build passed and the recorded npm audit reported zero advisories. No unresolved failure remains in those executed suites; review-fetch build warnings and external verification gaps remain disclosed.

This follow-up only changes documentation/status classification. It does not rerun or reinterpret local tests as real delivery, and makes no claim that the known production issues have been deployed away.

**Google Ads readiness: NO-GO.** No staging creation, production testing, live GTM modification, deployment or Ads activation is authorized by this handoff.
