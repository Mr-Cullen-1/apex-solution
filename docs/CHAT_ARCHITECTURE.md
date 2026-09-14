# Chat architecture

## Phase 1 (Sep 2026) — UI shell (mock replies)
## Phase 2 (Sep 2026) — real Gemini backend
## Phase 3 (Sep 2026) — safety layers, rate limiting, prompt hardening
## Phase 4 (Sep 2026) — AI-driven conversion actions (client-owned)
## Phase 5 (Sep 2026) — production-readiness audit

## Production operational status

**As of Phase 5, this feature exists only as uncommitted local changes —
it has not been committed, pushed, or deployed.** `git log` shows no commit
for any of Phases 1–4; the live production domain (confirmed reachable and
served by Vercel) returns 404 for `/api/chat` and its homepage HTML has no
chat launcher. Every "production" verification claim elsewhere in this repo's
history for this feature (Phase 3.1's live Supabase/Gemini testing, Phase
4's live UI testing) was performed against a local production build
(`next build && next start`) pointed at the real Supabase project and real
Gemini key — functionally equivalent to Vercel's runtime, but not actually
served from the production domain. Before real customer traffic: commit,
push, deploy, and re-verify `/api/chat` and the launcher are live on
`apexhomesupport.com` specifically.

Required Vercel production environment variables (see `.env.example` for
the full documented list with explanations): `GEMINI_API_KEY`,
`CHAT_RATE_LIMIT_SALT`, `REVIEW_RATE_LIMIT_SALT`, `SUPABASE_URL`,
`SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_CHAT_ID`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`. All are
server-only; only `NEXT_PUBLIC_SITE_URL` is public and is not a secret.

**Gemini tier**: confirmed Free Tier in earlier live testing (an actual
quota error observed: `"Quota exceeded for metric:
generativelanguage.googleapis.com/generate_content_free_tier_requests,
limit: 15, model: gemini-3.5-flash-lite"`). Current full tier/billing
status should be confirmed directly in Google AI Studio before launch —
not fully verifiable from this codebase alone.

```
Browser (ChatPanel / chat-context.tsx)
  -> POST /api/chat  { messages: [{ role, content }, ...] }
  -> body-size guard (16 KB) -> parse JSON -> normalize + validate
     (src/features/chat/model.ts)
  -> detectEmergency(latest user message) (src/features/chat/safety.ts)
       matched -> deterministic canned reply, Gemini NEVER called (200)
  -> isChatRateLimited()?  yes -> { ok:false, status:"rate_limited" } (429)
  -> isGeminiConfigured()?  no -> { ok:false, status:"not_configured" } (503)
  -> requestAssistantReply() (src/features/chat/gemini.ts, server-only)
       -> client.interactions.create({ model, input, system_instruction,
            store:false, response_format:{json schema} })
       -> parse + re-validate the structured JSON Gemini returned
  -> { ok:true, status:"answered", reply:{ message, intent, categoryId,
       safety, emergencyKind } }
```

**Multiple safety layers, not just Gemini.** Per the layering above, an
active-hazard message never reaches Gemini at all — the deterministic guard
runs first, before rate limiting or even the Gemini-configured check, so a
life-safety response never depends on either. Gemini's own hardened system
prompt is the *secondary* layer for anything the guard's narrow patterns
don't catch (see "Emergency guard" and "System prompt hardening" below).

**Model:** `gemini-3.5-flash-lite` via the official `@google/genai` SDK's
Interactions API (`ai.interactions.create`, not the legacy
`generateContent`). Chosen for latency/cost on short support questions and
simple classification — not deep reasoning. `generation_config.thinking_level:
"minimal"` is the only generation parameter set; no `temperature`/`top_p`/
`top_k` (not part of this API's request shape, and not needed here). No
tools are configured (no Google Search, code execution, function calling,
or booking actions) — this is a text-only support interaction.

**Stateless by design.** `store: false` and no `previous_interaction_id` —
Gemini never retains Apex visitor conversations server-side. Instead the
browser sends its own bounded recent history every turn (see
`chat-context.tsx`'s `sendMessage`), and the server re-bounds/re-validates
it independently (`normalizeChatPayload`/`validateChatPayload` in
`model.ts`) rather than trusting the client's limits.

**Request limits** (server-authoritative): at most 16 KB request body, at
most 10 messages (`CHAT_MAX_MESSAGES`), at most 800 characters per message
(`CHAT_MAX_MESSAGE_LENGTH`), and the last message must be from `"user"`.
Anything else (wrong role, blank content, malformed JSON) is dropped or
rejected before Gemini is ever called.

**Structured output, validated twice.** Gemini's JSON Schema
(`response_format` in `gemini.ts`) constrains generation to `{ message,
intent, categoryId }`, but per this repo's no-Zod convention the parsed
result is independently re-validated server-side
(`normalizeAssistantReply` in `model.ts`) before it ever reaches the
client — `intent`/`categoryId` degrade to a safe default (`"unknown"` /
`null`) rather than failing the reply; only a missing/blank `message` is
fatal. Raw Gemini response objects and upstream errors are never forwarded
to the browser.

**Frontend today only displays `reply.message`.** `intent`/`categoryId`/
`safety`/`emergencyKind` already travel through the API response so a later
phase can act on them (e.g. auto-suggesting Book Now for a given category)
— Phase 4 scope, not implemented yet.

## Emergency guard (Phase 3)

`src/features/chat/safety.ts` — `detectEmergency(message)` inspects only
the newest user message with a small set of deliberately narrow, explainable
regex patterns (never a general NLP classifier) for five high-confidence
**active** hazard classes:

- `gas` — active smell/leak/hiss language ("smell gas", "gas smell",
  "rotten egg[s]", "gas leak", "leaking gas", "gas ... hiss[ing]").
- `carbon_monoxide` — a CO/carbon-monoxide term co-occurring with an
  alarm/detector term *and* an active-state word ("going off", "beeping",
  "sounding", ...), or explicit (suspected) CO poisoning language.
- `electrical` — an electrical-component word (outlet/panel/breaker/wire/
  plug/...) co-occurring with a present-continuous danger verb ("sparking",
  "arcing", "smoking", "smoldering", "melting" — deliberately *not* bare
  "spark"/"arc", which appear in general questions like "why do outlets
  spark?"), or "burning plastic", exposed/live/energized wiring, or a shock
  report.
- `water_electrical` — water and an electrical-infrastructure term within
  the same clause, or flooding near a panel/breaker/outlet.
- `fire_smoke` — "is on fire"/"is smoking"/"ablaze", "flames", "house
  fire", "electrical fire", smoke visibly coming from something.

Checked in that order (most acutely life-threatening first); the first
match wins. A message that matches none of these still reaches Gemini
normally — this is a high-confidence trip-wire, not a complete emergency
classifier.

**Bypasses Gemini entirely.** A match short-circuits `/api/chat` before
rate limiting or the Gemini-configured check even run: `buildEmergencyReply`
constructs the full `ChatAssistantReply` from a fixed, hand-authored message
per `EmergencyKind` (leave the area, avoid sparks, call 911 / the gas
utility's emergency line, stay out until cleared, etc. — never a
troubleshooting step, never Apex's normal business number as a
substitute for 911). `categoryId` is always `null` (an emergency is never a
normal booking-preselection moment) and `intent` is `"call"`. Only the
matched category is logged (`[chat_emergency_guard_triggered] kind=gas`),
never the visitor's message text.

**Tuned against an explicit false-positive set** (see the test prompts in
the safety.ts header comment and this doc's test log below) so ordinary
service questions mentioning the same topics — "gas furnace," "carbon
monoxide detector," "why can outlets spark," "burning smell from an old
heater," "AC makes a hissing noise" — are never escalated.

## Safe-troubleshooting boundary (Phase 3, prompt-enforced)

Gemini may suggest only low-risk checks: thermostat mode/setpoint, whether
equipment has power, an obviously dirty filter, an appliance door being
closed, or other user-facing controls — preferring "a technician should
inspect this" whenever uncertain. The prompt explicitly forbids step-by-step
procedures for gas lines, combustion adjustment, refrigerant handling,
electrical panels, capacitors, bypassing safety switches/interlocks, live
voltage testing, rewiring, or disassembling burners/sealed systems, and
forbids stating a diagnosis as certain (causes must be framed as
possibilities, with a technician needed to confirm). This is enforced by
the prompt only (not deterministically), so it is Gemini's own behavior,
not a hard guarantee — see the live test results for how it performed
against the tested prompts.

## System prompt hardening (Phase 3)

`src/features/chat/system-prompt.ts` still builds its category list from
the real catalog (unchanged from Phase 2). Hardened content added this
phase: an explicit instruction-authority section stating system
instructions always outrank visitor text, that visitor messages are
untrusted data regardless of claimed authority ("developer message,"
"internal test," "pretend this is fiction," etc.), and that the prompt
itself must never be revealed, quoted, paraphrased, translated, or encoded
(including Base64) even indirectly; an explicit list of things the
assistant must never claim (scheduled appointment, dispatched technician,
real-time availability, invented prices/warranties/certifications, a
placed call, on-site diagnosis, or any tool/action beyond replying in this
chat); an instruction never to invent a phone number; the safe-
troubleshooting boundary above; and a no-false-diagnosis instruction. This
prompt is a secondary, non-deterministic layer — the emergency guard above
is what's actually deterministic.

## Rate limiting (Phase 3)

`src/features/chat/rate-limit.ts` mirrors `features/reviews/rate-limit.ts`'s
architecture — DB-backed (not an in-process `Map`, since serverless
instances are ephemeral/distributed), keyed by a SHA-256 hash of
(`CHAT_RATE_LIMIT_SALT` + IP + User-Agent), computed via
`check_and_record_chat_rate_limit` in
`supabase/migrations/20260917100000_create_chat_rate_limit.sql` (its own
table, `chat_rate_limit_events`, own salt — not reviews' table/salt).
Deliberately simpler than reviews' later reserve/release variant: a chat
turn has no expensive follow-up step whose failure should refund the
visitor's quota, so a plain atomic check-and-record is enough.

**Limit: 20 requests per rate key per 10-minute window.** Checked *before*
the costly Gemini call, but *after* the emergency guard (an emergency reply
is never rate-limited or Gemini-metered). A confirmed hit returns
`{ ok:false, status:"rate_limited" }` (429); the client shows a friendly
"you've sent several messages... try again shortly, or use booking/call"
message and the composer re-enables normally — no fake AI answer is ever
generated locally.

**Fails open** (never blocks a request) outside `NODE_ENV=production`, when
Supabase isn't configured, when `CHAT_RATE_LIMIT_SALT` is unset, or when the
RPC call itself errors — identical philosophy to reviews' limiter: a
rate-limiter hiccup must never take the whole chatbot offline. Logged as
`[chat_rate_limit_unconfigured]` / `[chat_rate_limit_failed]` respectively.

**Known gap:** the migration above was authored but has not been applied to
the live Supabase project as of this writing (this development environment
does not have schema-migration access to it). Until it's applied, the RPC
call fails with "function does not exist," which the fail-open path already
handles gracefully — the chatbot keeps working normally, simply without
enforcement, until the migration is run.

## Privacy / logging (Phase 3)

Never logged: the Gemini API key, the rate-limit salt, complete chat
history, full visitor message text (only the matched emergency *category*
is logged, never the message), the system prompt, or raw Gemini response
objects. Logged (metadata only): request-outcome tags —
`[chat_request_invalid]`, `[chat_emergency_guard_triggered] kind=...`,
`[chat_rate_limited]`, `[chat_rate_limit_failed]`,
`[chat_rate_limit_unconfigured]`, `[chat_gemini_not_configured]`,
`[chat_gemini_request_failed]` (upstream error code/message, not visitor
content), `[chat_gemini_response_invalid]` (a fixed reason string, never
the malformed payload itself).

**Environment.** `GEMINI_API_KEY` and `CHAT_RATE_LIMIT_SALT` (both
server-only, never `NEXT_PUBLIC_`) — see `.env.example`. Set them in
`.env.local` for local development and in the Vercel project's environment
variables for production/preview; never commit real values. Without
`GEMINI_API_KEY`, `/api/chat` returns `{ ok:false, status:"not_configured" }`
(503) and the chat UI shows a friendly "having trouble connecting" fallback
rather than crashing.

**Known limitations:** no streaming (one full response per turn), no
Markdown rendering of `message` (plain text only), the emergency guard is a
high-confidence trip-wire, not an exhaustive classifier (untested phrasings
still fall through to Gemini's own secondary safety instructions), and the
model id `gemini-3.5-flash-lite` was not present in the installed
`@google/genai` SDK's model-name literal union at the time Phase 2 was
written — confirmed working against the live API in Phase 2.1 regardless
(the SDK's model list simply lagged the real API). Rate-limit enforcement
(Phase 3.1) is live and verified against the real Apex Supabase project.

## Conversion actions (Phase 4)

**Gemini recommends, the UI decides.** The model's structured output
(`intent`/`categoryId`/`safety`) is unchanged from Phase 2/3 — Phase 4 adds
no new field to the Gemini response schema and no second model call. What's
new is entirely client-side: `src/features/chat/actions.ts` exports a pure,
deterministic `getChatActions({ intent, categoryId, safety })` function that
maps that already-validated metadata to a small `ChatAction[]` — Gemini
never chooses a button label, a category it didn't already return through
the validated API response, or an action shape.

```
chat-context.tsx: reply.{intent,categoryId,safety,emergencyKind}
  -> copied verbatim onto the resulting ChatMessage
     (a locally-authored fallback message — rate-limited/network/
     unavailable — never gets these fields, so it can never grow actions)
  -> chat-panel.tsx: only the LATEST assistant message computes
     getChatActions(...) — prevents CTA clutter as the conversation grows
  -> ChatMessageBubble renders <ChatActionRow actions={...} /> beneath
     that one message only
```

**Rules** (`actions.ts`): `safety === "emergency"` always returns `[]` —
never mixed with a life-safety message, checked first, before intent is
even considered. `"booking"` renders a book action (categoryId's label if
known, else "Book a Service") plus "Call Apex". `"call"` renders only "Call
Apex". `"service_question"` renders the book+call pair only when a category
is known — a vague question earns no CTA rather than a presumptuous one.
`"off_topic"` always renders `[]`. `"unknown"` renders a book action only if
a category happens to be known, otherwise `[]` — deliberately conservative,
per the instruction not to sell after an unclear answer.

**Booking integration**: a "book" action calls the exact same
`useBookNow().open({ categoryId })` as every other booking entry point in
the app (`BookingLink`, the Phase 1 quick actions) — no second booking UI.
`categoryId` is passed through exactly as the server validated it; the
client never derives or guesses one from message text. Clicking it closes
the chat panel first (same pattern as the Phase 1 "Book a service" quick
action) so there are never two simultaneous focus traps.

**Call integration**: a "call" action is a plain `<a href={contact.phoneHref}>`
sourced from `src/content/company.ts` — never a model-generated number, and
hidden entirely if `contact.phoneHref` is ever null (same guard used
everywhere else in the app).

**Known limitation**: category retention across turns is Gemini's own
behavior, not deterministic — in live testing it correctly carried
`categoryId: "cooling"` from an initial symptom message through a later
`"Can someone come tomorrow?"` booking-intent turn in the common case, but
one live run returned `categoryId: null` on that same follow-up phrasing.
When that happens the UI correctly falls back to the generic "Book a
Service" label (per the rule above) rather than guessing — this is
expected, safe degradation, not a client bug.
