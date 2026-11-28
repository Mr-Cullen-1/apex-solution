# Booking protection rollout

Do not deploy the API change until its migration and secret are verified in the intended isolated environment. No hosted migration or secret was changed during remediation.

- Actual request stream capped at 8,000 bytes and five seconds, independent of Content-Length. JSON only; browser cross-origin requests rejected. Missing Origin is accepted for non-browser clients, so origin checking is defense in depth, not authentication.
- Validated attempts reserve quota atomically through `reserve_booking_attempt`: five per trusted IP and three per normalized phone per fixed 15-minute bucket. Both restrictions apply. Failed downstream submissions consume a slot to bound repeated provider/DB work. HTTP 429 includes Retry-After 900 and a call fallback.
- Only salted HMAC keys are stored, never IP/phone/User-Agent values. A server-only random `BOOKING_RATE_LIMIT_SALT` of at least 32 characters is required. Previous-day buckets are pruned opportunistically on successful reservations; schedule cleanup separately if strict retention requires deletion during idle periods.
- RLS is enabled; table and RPC grants exclude PUBLIC/anon/authenticated; security-invoker RPC is callable only by the server service role. No changes to customer or request RLS are made.
- On Vercel only, use the platform-overwritten x-forwarded-for. Outside a verified Vercel environment use a shared IP bucket, so spoofed proxy headers cannot reset limits. Before deploying to other hosting, implement and test that host's trusted proxy contract. Do not simply trust any supplied X-Forwarded-For.
- Missing salt, RPC, DB or timeout fails closed with HTTP 503 and a clear “not submitted” call fallback. This is an explicit rollout prerequisite, not a silent fail-open exemption.

Staging acceptance: apply migration, configure the salt securely, submit approved test records; verify the sixth same-IP request and fourth same-phone request are blocked, retry after expiry, check two actual concurrent connections, verify role permissions and rollback on transaction errors. PGlite tests verify SQL behavior but do not certify hosted deployment or cross-connection contention.

Limits are a basic cost/abuse control, not complete bot prevention. A distributed attacker rotating phones/IPs and fixed-window boundary bursts remain possible. Verify hosting WAF/body/connection controls in staging; add an accessible challenge only if measured abuse warrants it. Shared NAT users can reach the IP cap; review real support volumes before approved launch.

November 24 local verification also ran tests/booking-concurrency.cjs on disposable PostgreSQL 18.7 with 12 independent connections: exactly three same-phone admissions, exactly five same-IP/different-phone admissions, actual lock waiting and transaction rollback all passed. The test accepts only localhost port 55439/user quo_test and creates/drops its own random database. Hosted PostgREST behavior is still unverified. Proxy trust follows https://vercel.com/docs/headers/request-headers#x-forwarded-for; verify any enterprise/custom proxy settings before launch.
