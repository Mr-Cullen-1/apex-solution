# Booking delivery acceptance — staging required

No new request, email, Telegram message or call was created against production during remediation. Current connector discovery does not expose the Apex Supabase/Vercel project; existing local credentials are not evidence of staging isolation.

Code changes preserve persistence as the source of truth. Notification exceptions are settled independently; logs record channel and internal request ID, never raw provider exceptions or request contents. Email/Telegram transport errors return fixed categories. Resend retains request-ID idempotency and now passes an eight-second abort signal; Telegram already had an eight-second timeout. Campaign lookup/insert are bounded to five seconds each and delivery status updates to three seconds. An ambiguous persistence response advises calling before retrying.

`sent` means provider accepted the send, not mailbox delivery or staff reading. There is no new outbox or automatic resend worker. An interrupted process may leave pending/unknown status; reconcile using provider records before any retry, especially Telegram which has no send idempotency key. Exactly-once booking across repeated HTTP submissions is NOT claimed; backend request idempotency remains a follow-up.

## Isolated acceptance protocol

1. Owner supplies staging deployment and separate database identifiers, confirms no production customer data, separate notification destinations and approved synthetic test identities. Verify environment scope without exporting secrets.
2. Apply existing schema plus booking limiter migration to staging; configure server-only salt and provider credentials. Verify hosted RLS/grants and read only the staged test rows.
3. Submit one uniquely marked approved request with email and one without. Record request ID, customer linkage, activity row, returned status and timestamp. Check atomic persistence and no orphan records under simulated RPC failure.
4. Confirm Resend sender-domain verification, accepted message ID and actual inbox delivery; test bounce/failure without including customer data in logs.
5. Confirm Telegram destination and message ID, actual appearance, plain-text formatting, timeout/rate-limit behavior and status updates.
6. Simulate notification outage/status-write failure. The request must still return received after successful storage. Confirm unknown/pending states are visible to operators and not automatically resent.
7. Exercise double-click/reload/ambiguous network response; distinguish frontend suppression from backend idempotency. Reconcile possible duplicates before retry.
8. Record exact test IDs and owner-approved cleanup process. Do not clean unrelated data. Attach evidence before calling delivery FIXED.
