# Apex Home Services — Website User Manual

*Prepared from a full audit of the live codebase as of September 14, 2026 (last commit: `eb42934`, "add Apex AI support chatbot"). This document describes only what is actually built and working today. Anything planned but not built is explicitly marked as not implemented.*

---

## 1. About the Website

The Apex Home Services website is a **lead-generation website**, not a self-service scheduling platform. Its job is to help a homeowner understand what Apex offers, and then get their contact information and problem description into Apex's hands as quickly as possible — so a staff member can call them back and arrange the actual visit.

**What a customer can do on the site:**
- Learn about Apex's four service categories (Appliance Repair, Cooling, Heating, Water Heater Repair), the counties Apex covers, and the equipment brands Apex works on.
- Submit a **service request** ("Book Now") with their contact details and a description of the problem.
- Call the business directly with one tap, from almost anywhere on the site.
- Chat with an AI assistant that answers basic questions and can hand them off to a request form or a phone call.
- Leave a review of a past experience, and read approved reviews from other customers.

**What Apex staff can do (separately, in the admin panel):**
- See every incoming request, organized in one place, with delivery status for the notifications sent about it.
- Track each request through a simple status pipeline (New → Contacted → Scheduled → Completed/Cancelled).
- Look up a customer's full history across all their requests.
- Moderate customer-submitted reviews before they go public.
- Manage which staff members have admin access.

**The actual customer journey today:**

```
Visitor browses the site (homepage, a service page, etc.)
   → clicks "Book Now" (or "Call Now")
   → fills in name, phone, ZIP, optional email, and a short message
   → submits
   → the request is saved immediately and a Telegram message is sent to Apex
   → (if an email was given) the customer also gets a confirmation email
   → a staff member sees the request in the admin panel and calls the customer back
```

There is **no online calendar, no time-slot picker, and no automatic appointment confirmation**. "Book Now" is the name of the request form — submitting it does not confirm a scheduled visit. The actual date/time of service is arranged over the phone, after Apex calls the customer back. This is stated directly to the customer on the confirmation screen ("Sending this does not confirm an appointment. Availability is confirmed when Apex follows up.").

---

## 2. Website Navigation

The header sits at the top of every public page and stays visible while scrolling (it shrinks slightly and becomes semi-transparent once you scroll down).

| Element | What it does | Notes |
|---|---|---|
| **Apex logo / name** | Returns to the homepage | Always in the top-left |
| **Services** (desktop only) | Opens a "mega menu" dropdown listing all four service categories and their sub-services, plus a shortcut to open Book Now | Only appears on wide screens (desktop); on mobile it's a collapsible section inside the hamburger menu |
| **Service Areas** | Goes to the `/service-areas` page | Lists the 29 counties Apex covers |
| **About** | Goes to the `/about` page | Company background/positioning |
| **Contact us** | Goes to the `/contact` page | A page of "which link do I want" pathways, not a contact form |
| **"Live Now" badge** | Not clickable — a status indicator only | A small pulsing green dot with the text "Live Now," shown only on desktop widths and inside the mobile menu. It is decorative/marketing copy, not a live availability feed from any real system. |
| **Phone number button** | Tap/click to call `(516) 586-0826` | Always visible, at every screen width, including the smallest phones — it never hides behind the hamburger menu |
| **Book Now button** | Opens the Book Now request form (a pop-up modal) | Always visible next to the phone button, at every screen width |
| **Hamburger menu icon** (mobile/tablet) | Opens a full-screen slide-in navigation drawer | Contains the same links as the desktop nav, plus a collapsible Services section, the Live Now badge, a Call button, and a full-width Book Now button at the bottom |

**Sticky mobile action bar:** On phones and tablets (below desktop width), a bar is pinned to the very bottom of the screen at all times, with two large buttons: **Call** and **Book Now**. This bar is hidden on the `/book` redirect page (which immediately forwards you elsewhere) and has no phone number to show if one hasn't been configured — but that scenario doesn't apply today, since the real Apex number is set.

**Footer** (bottom of every page except `/review`): repeats the Apex logo and one-line description, then one column per service category (Appliance Repair, Cooling, Heating, Water Heater Repair) with links to each sub-service, plus a Call button and Book Now button on wider screens (on mobile, the sticky bar already covers this). A copyright line closes the footer.

---

## 3. Homepage

The homepage is built from nine stacked sections, in this order:

1. **Hero** — The first thing a visitor sees. A large headline ("Home repairs fast and reliable"), a short description of the four service types, a **Call Now** button with the phone number, a **Book Now** text link, a rotating photo carousel on the right (real Apex job photos, not stock imagery), a small "Live Now · Instant Response" badge, and a floating card about same-day service availability. Small pills below the text list the four service categories, and a line lists the coverage states by abbreviation (NY, NJ, CT, MA, RI).
2. **Service Call Pricing strip** — A single line stating the starting service-call price ("Service calls starting at $89, based on your location") and that the diagnostic fee is credited toward the repair if the customer proceeds the same day, next to a Call button and a Book Now button.
3. **Trust strip** — Four small credential badges: "EPA 608 Certified Technicians," "Experienced on Major Appliance Brands," "10+ Years Technician Experience," and "Same-Day Service Available." These are not clickable — just credibility signals.
4. **Customer Reviews** — Shows up to 6 real, Apex-approved customer reviews (see Section 9 of the Reviews architecture below). **This section is completely invisible if there are zero approved reviews in the system**, or renders as a single card, a two-card row, or a carousel depending on how many exist. Below the reviews are two links: "Leave a review" (goes to `/review`) and "Read all reviews" (goes to `/reviews`).
5. **Services grid** — A card carousel of the four service categories, each with a photo, name, short description, and an "Explore [service]" link into that category's page. Cards show a small "Same-day available" badge.
6. **First-Time Offer** — A dedicated panel advertising 10% off a first maintenance visit, listing the five eligible services (Outdoor AC unit cleaning, Furnace maintenance, Refrigerator/Dryer/Washer maintenance), each linking to its service page, plus a **"Claim this offer"** button that opens Book Now pre-tagged with the offer.
7. **Apex Results** — A before/after photo gallery of completed jobs. If no approved before/after photos exist yet for a given entry, it shows an honest "Awaiting approval" placeholder rather than a fake image.
8. **Brands We Service** — Lists the appliance, premium-appliance, and HVAC brand groups Apex has experience with, with a "Browse all brands" link to `/brands` and a "Contact us" link.
9. **Service Area explorer + FAQ** — A section for exploring coverage, followed by an accordion of frequently asked questions (about choosing a service, coverage, and preparing a request).

Every "Book Now" text or button anywhere on the homepage opens the same single request form (a pop-up), never a separate page.

---

## 4. Services

The `/services` page is the directory of everything Apex offers. It shows:

- **Four service categories**, each a card linking to its own category page: **Appliance Repair**, **Cooling**, **Heating**, **Water Heater Repair**.
- A **"Start with what changed"** symptom-based section — cards like "AC not cooling" or "Furnace not heating" that link straight into the most relevant category or sub-service, so a customer who doesn't know the technical name for their problem can still find the right starting point.
- A brand-count summary linking to `/brands`.
- A coverage summary linking to `/service-areas`.

**Category pages** (e.g., `/services/cooling`) show: a hero banner for that category, a compact version of the First-Time Offer (only if that category is eligible), a directory of the specific sub-services under that category (e.g., under Cooling: AC Repair, AC Installation, AC Maintenance, AC Replacement, Heat Pumps), a "what changed" problem-picker specific to that category (each option opens Book Now with that category and problem context already filled in, plus an "Other" option for anything not listed), a general "how service works" explanation, relevant brands, the coverage area, an FAQ, and a final call-to-action.

**Sub-service pages** (e.g., `/services/cooling/ac-repair`) go one level deeper: an overview of that specific service, a bulleted list of "Reasons to request service" (symptoms), related services, brands, coverage, FAQ, and a final call-to-action.

Every one of these pages funnels toward the same Book Now form — clicking "Book Now" from a specific sub-service page pre-fills that service in the request, so the customer doesn't have to re-select it.

**Important accuracy note:** The service and FAQ copy is deliberately written to avoid diagnosing anything remotely ("these observations can support a service request, but they do not confirm a specific diagnosis"). Nothing on a service page promises a specific repair, price, or outcome — that's intentional, confirmed business copy, not a gap.

---

## 5. Request Service / "Book Now" Form

This is the single most important flow on the site — it is the only way a website visitor's information reaches Apex.

### 1. How it's opened
The **same pop-up form** opens from dozens of places: the header's Book Now button, the mobile sticky bar, the hero, the pricing strip, the First-Time Offer's "Claim this offer" button, any service or sub-service page's Book Now button, any "Other" problem card, the About/Brands/Service Areas/Contact pages, and the AI chatbot's "Book a Service" action. There is no separate "Request Service" page — Book Now *is* the request form. Old bookmarked links to `/book` and `/book?service=...` still work; they silently redirect into this same pop-up with the right service pre-filled.

### 2. What information is collected
| Field | Required? | Notes |
|---|---|---|
| Full Name | **Required** | One field, not split into first/last |
| Phone number | **Required** | Free text (no strict format enforced beyond basic validation) |
| ZIP code | **Required** | Exactly 5 digits |
| Email address | Optional | If provided, the customer also gets a confirmation email (see Section 12) |
| "Tell us what's going on" (message) | **Required** | Free text, up to 1,200 characters |
| SMS/text consent checkbox | Optional, unchecked by default | *"I agree that my phone number may be used for service-request text communication. This is not marketing consent."* Never required to submit. |

There is **no date/time picker anywhere in this form.** There is no field for street address (only ZIP). There is no way to attach a photo to a service request (photo attachment exists only on the separate customer *review* form — see Section 9).

If the form was opened from a specific service, category, or the First-Time Offer, that context is shown at the top of the form ("Regarding: Heating") and is submitted silently along with the form — the customer is never asked to re-select something the site already knows.

### 3–6. Selection & contact info
Service/category selection happens automatically based on which button the customer clicked — there is no dropdown inside the form itself to pick a service. If Book Now is opened generically (e.g., from the header with no page context), no service is pre-filled and the customer's message is the only place they describe what they need.

### 7. Address/location fields
Only a ZIP code is collected — no street address, city, or map. The form copy is explicit that exact service-area eligibility for that ZIP is confirmed separately by staff, not automatically by the website.

### 8. Date/time fields
**None exist.** This is a lead form, not a scheduler.

### 9. Description field
The "Tell us what's going on" textarea, required, capped at 1,200 characters.

### 10. Validation
All required fields are checked before submission is attempted; specific field-level error messages appear directly under the field that has a problem (e.g., a missing phone number). The form will not submit until every required field passes.

### 11–12. Submission and what the customer sees
On submit, the button changes to "Sending…" and is disabled (this also prevents accidental double-submission from an impatient double-click). On success, the entire form is replaced with a confirmation panel:

> *"Request received. Thanks, [First Name]. We received your service request and someone from our team will reach out shortly."*

followed by a **Call [phone number] now** button and a **Close** button. The wording is careful never to promise a specific arrival time or confirmed appointment.

### 13. What happens internally after submission
1. The request is normalized and validated again on the server (never trusting the browser).
2. It is saved as the permanent record in Apex's database (this is the single source of truth — if this step fails, nothing else happens and the customer sees a real error).
3. The customer is matched to an existing customer record (by phone, then by email) or a new one is created, so repeat customers build up a history.
4. A Telegram message is sent to Apex's internal Telegram chat (see Section 11) — attempted for every request.
5. If an email was provided, a confirmation email is sent via Resend (see Section 12) — attempted only when there's an email to send to.
6. The customer's browser gets a success response as soon as step 2 succeeds — **it does not wait for or depend on whether Telegram or the email actually went through.**

### What happens on failure scenarios

| Situation | What the customer experiences |
|---|---|
| Required field missing/invalid | Inline error next to that field; nothing is submitted |
| The database itself is unreachable (rare/real outage) | An honest error message and a **Call [number] now** fallback button — no fake success is ever shown |
| The customer's internet connection drops mid-submit | *"The request could not be sent right now. Your details have not been sent."* — everything they typed is preserved so they can retry |
| The internal Telegram notification fails to send | **The customer sees nothing different — they still get the success message.** The request is still saved; only its internal "Telegram status" is marked failed for staff to notice (see Section 13) |
| The confirmation email fails to send (e.g., bad email address, provider outage) | Same as above — the customer still sees success; only the internal "Email status" is marked failed |
| Customer submits twice by mistake | Each submission creates its own request record (there is no "you already submitted this" duplicate check) — but both will be linked to the same customer profile automatically if the phone or email matches |

---

## 6. Instagram / Advertising Lead Flow

**This does not currently exist.** There is no dedicated landing page, route, or form built for Instagram ads or other campaign traffic, no UTM-parameter handling, and no ad-specific tracking anywhere in the codebase. Every visitor — whether they arrive from an ad, a search engine, or a direct link — lands on the same public site and uses the same Book Now form described in Section 5. The only "source" information captured with a request is the page path it was submitted from (e.g., `/services/heating`) and a fixed label of `"website"` — there is no mechanism to tell Apex "this lead came from an Instagram ad" versus any other traffic. If Apex wants ad-specific attribution or a dedicated campaign landing page, that would be new work, not something to look for in the current site.

---

## 7. Phone Calls

Every "Call" element on the site is a plain tap-to-call link pointing to the same real, confirmed Apex number: **(516) 586-0826**. There is no dynamic or per-source phone number, no call tracking, no call recording, and no call history logged anywhere in the admin panel (this is a deliberate, documented limitation — see Section 13).

Places a customer can call from with one tap:
- The header (every page, every screen size)
- The mobile sticky action bar (phones/tablets)
- The homepage hero, pricing strip, and services grid
- The Contact page
- The footer
- The Book Now form's confirmation screen (both success and failure states)
- The AI chatbot's "Call Apex" action buttons and its "Talk to someone" quick-reply chip

On a phone, tapping any of these opens the native phone dialer with the number pre-filled, ready to call. On a desktop computer, the same link is used — the browser or OS will typically offer to hand it off to a calling app (Skype, FaceTime, etc.) if one is configured, or simply do nothing useful if none is — this is standard `tel:` link behavior, not something the website controls.

---

## 8. Text / Chat Functionality

This is one area where the marketing copy and the actual behavior diverge slightly, so it's worth being precise:

- **The chat launcher (the message bubble icon in the corner of the screen) opens the AI assistant panel** — a text-based conversation with an AI chatbot (see Section 9). It is **not** SMS, and it does not send a text message to the customer's phone.
- **There is no working "Text us" button anywhere on the site today.** A text-message (`sms:`) link to the Apex number is defined in the codebase's configuration but is not actually placed on any page or button — it exists in the data but nothing currently renders it.
- Marketing copy near the hero ("Instant response. Call or text and we reply right away.") implies customers can text the business number directly. That's plausible in the sense that (516) 586-0826 is a real phone number capable of receiving texts, but the **website itself provides no click-to-text button** to make that easy — a customer would have to manually text the number from their own phone app.

**Recommendation for Apex:** if staff do want to promote texting as a contact method, either add a real click-to-text button (the underlying link already exists in the code, just unused) or adjust the hero copy to avoid implying a feature the website doesn't visibly offer.

---

## 9. AI Chatbot ("Apex Assistant")

### What it's for
A small chat panel (opened via the floating message icon) that answers basic questions about Apex's services and helps guide a visitor toward either submitting a request or calling. It is powered by Google's Gemini AI model, running only on the server (the AI key is never exposed to the browser).

### What it can answer
General questions about the four service categories (Appliance Repair, Cooling, Heating, Water Heater Repair), which category might fit a described symptom, and very basic, low-risk troubleshooting suggestions (e.g., "check if the thermostat is set to the right mode," "check if the equipment has power," "check if a filter looks dirty"). It is instructed to always prefer saying "a technician should inspect this" over guessing.

### What it should not answer, and won't
It is explicitly restricted to Apex Home Services topics. If asked something unrelated (general trivia, other companies, coding help, politics, etc.), it's instructed to politely decline and redirect to Apex topics rather than attempting to answer. It is also instructed to never:
- Claim it scheduled an appointment, dispatched a technician, or confirmed a booking.
- State real-time technician availability or arrival times.
- Invent specific prices, discounts, warranty terms, certifications, or promotions.
- Claim a call or text was placed on the customer's behalf.
- Claim it performed or can perform an on-site diagnosis.
- State a diagnosis as certain — it must frame possible causes as possibilities.
- Give step-by-step instructions for anything dangerous (gas lines, electrical panels, refrigerant, capacitors, bypassing safety switches, live-wire work, disassembling sealed systems) — it declines and recommends a technician instead.
- Reveal, quote, or paraphrase its own instructions, even if asked to "translate," "encode," or "pretend" — it's specifically hardened against these tricks.
- Make up a phone number — if asked for one, it points to the number already shown in the chat/site rather than inventing one.

### How service intent is identified
Behind the scenes, every AI reply also carries a small amount of structured, validated information that never appears in the chat text itself: which of the four service categories seems relevant (if any), and whether the visitor's intent seems to be "asking a question," "wanting to book," "wanting to call," "off-topic," or "unclear." This information is checked by the website's own code — the AI's raw output is never trusted directly — and is what decides whether a "Book a Service" or "Call Apex" button appears underneath that specific reply.

### What happens with an unrelated question
The assistant briefly and politely explains it can only help with Apex Home Services topics, and no action buttons appear underneath that reply.

### What happens when the AI can't safely answer, or is unavailable
If the AI service itself is not reachable or not configured, the customer sees a friendly message: *"I'm having trouble connecting right now. You can still book a service or call Apex directly."* If the visitor has sent too many messages too quickly (a spam/abuse protection, roughly 20 messages per 10 minutes), they see: *"You've sent several messages in a short time. Please try again shortly, or use the booking/call options if you need help now."* Neither of these is a real AI answer — they are fixed, locally-generated fallback messages, and neither one shows any conversion buttons.

### Complex requests
There's no special handling beyond the general troubleshooting boundary above — a complex or ambiguous request is treated like any other question: the assistant is instructed to prefer recommending an inspection over guessing, and the conversion-action logic (below) deliberately shows **no button at all** rather than a presumptuous one when the assistant's own answer is vague.

### Emergencies — this is a real, deterministic safety feature
Before a message ever reaches the AI, the website itself scans the customer's newest message for five specific active-hazard situations: an active **gas leak**, **carbon monoxide** danger, **fire/smoke**, an active **electrical hazard** (sparking, arcing, exposed live wires, shock), or **water contacting electrical equipment**. If any of these is detected, the AI is **never called at all** — the customer instantly receives a pre-written safety message specific to that hazard (e.g., for gas: leave the building, don't operate switches or phones inside, call 911 or the gas utility's emergency line from a safe location, and stay out until it's cleared). No conversion buttons (Book Now, Call) ever appear on an emergency message — the safety instructions are the only thing shown. This detection only looks for clearly active, ongoing danger language; a general question like "why do outlets spark sometimes?" or "how does a gas furnace work?" is treated as an ordinary question, not an emergency.

### Action buttons
Buttons appear only underneath the assistant's **most recent** reply (older messages never keep their buttons, to avoid clutter), and only when the underlying validated information supports them:

| Situation | Buttons shown |
|---|---|
| An active emergency was detected | **None** — ever |
| The visitor seems to want to book | "Book [Category] Service" (or generic "Book a Service") **and** "Call Apex" |
| The visitor seems to want to call | "Call Apex" only |
| A specific service question with a known category | "Book [Category] Service" and "Call Apex" |
| A vague service question with no clear category | No buttons — the assistant doesn't presume |
| Off-topic | No buttons |
| Unclear intent | A book button only if a category happens to be known; otherwise none |

Clicking a "Book" button opens the exact same Book Now pop-up used everywhere else on the site (pre-filled with the relevant category, if known) — there is no second, separate booking interface for the chatbot. Clicking "Call Apex" is the same plain tap-to-call link used everywhere else. The chatbot itself never generates a phone number, a link, or a button on its own — it only ever provides the category/intent information, and the website's own fixed logic decides what to show from that.

---

## 10. Booking / Appointment Flow

There is **no separate booking or appointment-scheduling system**. "Book Now" is simply the name given to the request form described in Section 5 — clicking it opens that same pop-up form, pre-filled with whatever service context is available. There is no calendar, no available-time-slot list, and no automatic confirmation of a specific date or time. Submitting the form sends a request to Apex; an actual appointment time is arranged afterward, by a staff member calling the customer back. This is stated to the customer directly in the form itself.

---

## 11. Telegram Notifications

Every submitted service request triggers an attempt to send a formatted message into Apex's internal Telegram chat, as an operational "a new lead just came in" alert for staff.

**When it fires:** Immediately after a request is successfully saved — for every single Book Now submission, with no exceptions.

**What it includes:** the customer's name, phone, email (or "Not provided"), ZIP code, the service/category they selected (or "Not specified" if none), any short issue tag, their full message, whether they consented to SMS/text communication, the source ("Apex Home Services — Book Now"), a unique request ID, and the submission timestamp (Eastern time).

**Who receives it:** Whoever is a member of the Telegram chat/group that Apex's technical configuration points to. This manual intentionally does not (and should not) list the actual chat ID or bot credentials.

**What Apex staff should do after receiving one:** Treat it as the first, fastest signal that a new lead exists, and use it to decide whether to call the customer right away — but the admin panel's Requests list (Section 13) is the authoritative, permanent record; Telegram is a notification, not a database.

**If Telegram fails to send** (bad configuration, outage, etc.), the request is **never lost** — it's already safely saved before Telegram is even attempted. The only consequence is that staff might miss the instant notification, so it's worth periodically checking the admin dashboard's "Telegram Failed" count as a backstop.

---

## 12. Email / Resend Notifications

**Which events trigger an email:** Only one — a customer submitting the Book Now form **and providing an email address**. If no email was given, no email is sent (there's nothing to send it to), and nothing is treated as an error.

**Who receives it:** The customer only. There is no copy or notification email sent to Apex staff through this system — Apex's own notification channel is Telegram (Section 11), not this email.

**What the email says:** A short, non-promotional confirmation — subject line *"We received your service request"* — with a greeting using the customer's first name, a summary of what they submitted (service/category if known, issue if any, ZIP code, and their message), and a request reference number. The wording is careful never to imply Apex itself is dispatching a technician or confirming a specific time — it says Apex will "reach out shortly to confirm the details and help coordinate your service request."

**What the client should expect:** This only works once the required email-sending configuration (a Resend account and verified sending domain) is active in production. If that configuration is missing or a send fails for some other reason, the customer's request is **still saved and still gets the on-screen success message** — the email is simply skipped, and it's recorded internally so staff can notice (see the "Email Failed" indicator in the admin dashboard, Section 13).

---

## 13. Admin Panel

### Logging in
- **URL:** `/admin/login` on the main site, or the entire dashboard is also reachable at the dedicated subdomain **admin.apexhomesupport.com** (which quietly serves the exact same admin pages — the browser's address bar stays on the subdomain the whole time).
- **Credentials:** Email + password only. There is no public sign-up page and no "forgot password" self-service link — admin accounts are created entirely by another admin from inside the panel (see "Managing admins" below).
- **How authentication works, from a user's perspective:** After a correct email/password, the system separately checks that this person is registered as an active Apex admin. If either check fails, the same generic message is shown — *"Unable to sign in with those credentials."* — so a login page can never be used to guess whether an email exists in the system.
- **First login after being added:** A brand-new admin is given a temporary, randomly generated password by whoever added them. The very first time they log in, they're required to set their own permanent password before they can access anything else in the panel.

### Dashboard (`/admin`)
The landing page after login. Shows, in real time (never a stale cached number):
- Key counts: New Requests, Open Requests, Requests in the last 24 hours, Total Customers, Pending Reviews, Approved Reviews, Telegram Failed, Email Failed, and (for the highest permission level only) Active Admins.
- A chart of daily request volume over the last 7/14/30 days.
- A donut chart of request status distribution (New/Contacted/Scheduled/Completed/Cancelled).
- A donut chart of review moderation status (Pending/Approved/Rejected).
- A ranking of the most-requested service categories.
- A breakdown of Telegram and email delivery outcomes (Sent/Pending/Failed/Not requested).
- A "Recent activity" list of the newest requests, each linking straight to its detail page.

### Leads / Requests (`/admin/requests`)
This is where every Book Now submission lives. The list shows the newest requests first, with filters for operational status, Telegram delivery status, email delivery status, whether the first-time offer was used, and which service, plus a text search box — all reflected in the page's URL, so a filtered view can be bookmarked or shared. Each row previews the customer's name, service, and status (not their full message, to keep the list scannable).

Opening a request (`/admin/requests/[id]`) shows everything: full contact info (phone, email, ZIP), the exact service/issue selected, the offer claimed (if any), the customer's complete message, Telegram and email delivery status with timestamps, when the request was created/last updated, a full activity timeline, a note-composer for internal comments, and a direct link to that customer's full profile.

**Lead statuses** (only these five exist): **NEW → CONTACTED → SCHEDULED → COMPLETED / CANCELLED.** These are set from a simple dropdown on the request's detail page and can be changed in any direction at any time (e.g., you can move something back to NEW if needed) — nothing is locked once set. Changing the status is logged in that request's activity timeline automatically. **Important:** opening or viewing a request never re-sends a Telegram message or email — those only ever fire once, automatically, at the moment the request was originally submitted.

**Managing a lead:** view full details, change its status, add an internal note (visible only inside the admin panel, never to the customer), and jump to the linked customer profile. There is **no delete button**, no way to edit the customer's submitted answers, and no "call customer" button that logs anything — calling is done by dialing the number shown on the page manually; nothing about the call itself is tracked by the website (see Section 21/limitations).

### Customers (`/admin/customers`)
An internal directory, automatically built from Book Now submissions — customers are matched by phone number (or email, if no phone match) so a repeat customer's history stays under one profile rather than creating duplicates. The list is searchable by name, phone, or email, and shows each customer's total request count and most recent request date. Opening a profile (`/admin/customers/[id]`) shows their full contact info, every request they've ever submitted (in full, never summarized away), their activity timeline, and a note composer. **There is no customer login, password, or self-service account of any kind** — this is purely an internal record for staff.

### Reviews (`/admin/reviews`)
The moderation queue for customer-submitted reviews (see Section 9 of the review flow, and Section 16 below). Defaults to showing **Pending** reviews (the ones needing action), with tabs for Approved, Rejected, and All, plus search and pagination. Opening a review shows its full text, rating, any attached photo, and lets an admin:
- **Approve** or **Reject** it (reversible at any time — moving something back to Pending is allowed).
- Toggle **"Verified Customer"** — a manual badge, never automatic.
- Toggle **"Featured"** — only allowed while a review is Approved; rejecting a featured review automatically un-features it.

Approving or rejecting a review updates the public homepage and `/reviews` page automatically (within a couple of minutes) — no separate "publish" step is needed.

### Admins (`/admin/admins`) — restricted
Only visible to the highest permission level (Super Admin); an ordinary Admin is redirected away from this page even if they try the URL directly. From here, a Super Admin can:
- **Create a new admin** by entering an email and choosing a role. The system generates a secure temporary password and shows it **once, on screen** — it is never emailed, never shown again, and must be shared with the new admin directly (in person, a password manager, etc.). No invitation email is ever sent by the system.
- **Reset an existing admin's password** (generates a new temporary password shown once the same way).
- **Activate or deactivate** an admin account.
- **Change an admin's role** between the two levels: **Admin** (everything except managing other admins) and **Super Admin** (everything, including this page).
- The system will not allow deactivating or demoting the *last remaining* active Super Admin, to prevent accidentally locking everyone out.

### Change Password (`/admin/change-password`)
Reachable any time from the sidebar, and forced automatically for a new admin's first login or right after a password reset.

### Other admin sections
That's the complete list — Dashboard, Requests, Customers, Reviews, Admins, and Change Password. There is no separate settings page, no billing page, and no analytics page beyond what's on the Dashboard.

---

## 14. How Apex Should Process a New Lead

1. A customer submits a service request through the website (or the chatbot hands them to the same form).
2. It's saved immediately — this already happened before anything else below, so the lead is never lost even if the next steps have a hiccup.
3. A Telegram message lands in Apex's internal chat within moments.
4. (If the customer gave an email) they automatically receive a confirmation email.
5. A staff member opens the admin panel's **Requests** list and finds the new lead (or opens the notification link, if using one) — it will show status **NEW**.
6. Staff calls the customer at the number shown on the request.
7. Once contact is made, staff updates the status to **CONTACTED**, and adds an internal note if useful (e.g., "left voicemail," "customer said morning works better").
8. Once a specific visit is arranged (by phone — the website has no calendar), staff updates the status to **SCHEDULED**.
9. After the visit is completed, staff updates the status to **COMPLETED** (or **CANCELLED** if it didn't happen).

---

## 15. Mobile Usage

- **Navigation** collapses into a hamburger menu with a full-screen slide-in drawer; the desktop mega-menu becomes a simple expandable "Services" section inside it.
- **Sticky Call/Book Now bar** is pinned to the bottom of the screen on phones and tablets at all times (it disappears on desktop, where the header's own Call/Book Now buttons are always visible instead).
- **Click-to-call** works exactly as described in Section 7 — tapping any phone number/Call button opens the native dialer.
- **Forms** (Book Now and the review form) are sized to fit comfortably on a phone screen without requiring internal scrolling on most devices, and are laid out so the fixed bottom bar never blocks the submit button.
- **Chatbot** works identically on mobile — the panel simply expands to fill more of the screen (up to 85% of the viewport height) instead of appearing as a small corner box like it does on desktop.
- **Admin panel on mobile:** it is responsive (a compact top bar with a slide-in navigation drawer replaces the desktop sidebar), but it's built as an internal operations tool, not optimized as a phone-first experience the way the public site is — staff will generally have an easier time on a desktop or tablet for anything beyond a quick status check.

---

## 16. Website Forms

| Form | Location | Purpose | Information collected | What happens after submission |
|---|---|---|---|---|
| **Book Now** | Pop-up modal, triggered from dozens of buttons sitewide (header, mobile bar, hero, service pages, chatbot, First-Time Offer, etc.) | Capture a new service lead | Full Name, Phone, ZIP code, Email (optional), Message, SMS-consent checkbox (optional) — plus silently-attached service/category/offer context | Saved to Apex's database; Telegram notification sent; confirmation email sent if an email was given; success message shown to customer |
| **Leave a Review** | `/review` | Let a past customer share feedback | Full Name (private, never shown publicly), Star rating (1–5), Review text, Service (optional dropdown), Location (optional, city/county/state text), an optional single photo, a required publish-consent checkbox | Saved as "pending"; an Apex admin must approve it before it can ever appear publicly |
| **Admin: Add Note** | Any request or customer detail page (staff only) | Internal record-keeping | Free-text note | Saved to that request/customer's internal activity timeline; never shown to the customer |
| **Admin: Search (Requests/Customers/Reviews/Customers list)** | Various admin list pages (staff only) | Filter/find records | A search text string | Filters the results shown; nothing is submitted anywhere else |

---

## 17. Notifications

| Event | Customer sees | Apex receives | Channel(s) |
|---|---|---|---|
| Book Now request submitted | On-screen success confirmation (or an honest error if the database itself failed) | A new row in the admin panel's Requests list (always) | Website (admin panel) |
| Book Now request submitted | Nothing extra | An operational alert with the customer's full details | Telegram |
| Book Now request submitted **with an email address** | A confirmation email | Nothing extra (no copy is sent to Apex via this channel) | Email (Resend) |
| A review is submitted at `/review` | An on-screen "submitted for approval" confirmation | A new "pending" row visible in `/admin/reviews` (no push/email/Telegram alert exists for this) | Website (admin panel) |
| An admin approves/rejects a review | Nothing (reviews have no customer account to notify) | The change is reflected on the public homepage/`/reviews` within ~2 minutes | Website only |
| A request's status is changed by staff | Nothing (customers aren't notified of status changes) | Recorded in that request's activity timeline | Website (admin panel) |

**Not implemented:** there is no push-notification, SMS, or email alert to Apex staff when a *review* is submitted — staff must check the admin Reviews queue manually (or notice the "Pending Reviews" count on the Dashboard).

---

## 18. External Services Used by the Website

| Service | What it does | Can the site work without it? | Paid plan considerations | Depends on it |
|---|---|---|---|---|
| **Supabase** (database) | Stores every service request, customer record, review, and admin account | No — this is the site's only database. Without it configured, Book Now, Reviews, and Admin all return a clear "not available right now" message rather than crashing | Has a free tier; a real production volume of leads/reviews may eventually need a paid tier — check current usage against Supabase's own pricing | Book Now, Reviews, Admin panel, Customer CRM |
| **Telegram Bot API** | Sends the instant new-lead alert to Apex's internal chat | Yes — the site keeps working and leads are still saved even if Telegram is completely unconfigured; only the instant notification is skipped | Telegram's Bot API itself is free | Book Now notifications only |
| **Resend** (email) | Sends the customer's confirmation email | Yes — same as above; only the confirmation email is skipped if unconfigured | Has a free tier with a sending volume limit; a verified sending domain is required for production | Book Now confirmation emails only |
| **Google Gemini** (`@google/genai`) | Powers the AI chatbot's replies | Yes — without it, the chatbot shows a friendly "having trouble connecting" message instead of a real reply; nothing else on the site depends on it | Confirmed running on Google's **Free Tier** in earlier testing (a real usage-limit error was observed); production chat volume may require upgrading to a paid tier | AI chatbot only |
| **Vercel** (hosting) | Runs and serves the website itself, including both `apexhomesupport.com` and `admin.apexhomesupport.com` | No — this is where the whole site is deployed | Depends on Apex's current Vercel plan and traffic; not something this document can price | Everything |

No analytics platform (Google Analytics, etc.) was found anywhere in the codebase — none is currently installed.

---

## 19. What the Client Should NOT Change

Please do not independently change any of the following without contacting the developer first:

- Environment variables of any kind (Supabase, Telegram, Resend, Gemini keys, rate-limit salts, the site URL) — these are set in Vercel's project settings, not in the website itself, and an incorrect change can silently break leads, notifications, or the chatbot.
- Database configuration or structure in Supabase — the tables, permissions, and functions are precisely wired together; manual edits (especially permission/security settings) can break the site or expose data.
- The Telegram bot token or chat ID.
- The Gemini API key or its billing/tier settings, without understanding the cost implications.
- The Resend sending domain or API key.
- Vercel deployment or domain settings (including the `admin.apexhomesupport.com` subdomain configuration) — this routing is intentionally precise.
- The production domain configuration in general.

If any of the above genuinely needs to change (e.g., rotating a leaked key, changing hosting providers), that's a real, valid need — just loop in the developer rather than making the change directly, since several of these are interdependent in ways that aren't obvious from the admin panel alone.

---

## 20. Common Tasks

### How to check a new service request
Log in to `/admin` (or `admin.apexhomesupport.com`) → go to **Requests** → the newest ones are at the top, with status **NEW**.

### How to call a lead
Open the request in the admin panel to see their phone number, and dial it from your own phone — there is no in-panel "call" button that does this automatically.

### How to update a lead
Open the request → use the **Operational status** dropdown to move it along (New → Contacted → Scheduled → Completed/Cancelled) → optionally add a note underneath.

### How to verify the website form is working
Submit a real (or clearly-marked test) request through the public Book Now form, then check that it appears in `/admin/requests` within a few seconds, and confirm the Telegram/Email delivery indicators show "Sent" on its detail page. Remember to delete or ignore any test data appropriately afterward, since there is no "test mode."

### How to test the chatbot
Open the chat bubble on the live site and ask an ordinary service question (e.g., "my AC isn't cooling") — it should reply with relevant guidance and, if appropriate, show a "Book Cooling Service" / "Call Apex" button.

### How to test Call Now
Tap any Call button on a phone — it should open your phone's dialer with `(516) 586-0826` already entered.

### How to test Book Now
Click any "Book Now" button anywhere on the site and confirm the pop-up opens with the right context noted at the top (e.g., "Regarding: Heating" if opened from the Heating page).

### How to check Telegram notifications
Submit a test Book Now request and confirm the message arrives in Apex's configured Telegram chat within moments.

### How to check email notifications
Submit a test Book Now request **with a real email address you can check**, and confirm the confirmation email arrives (also check spam/junk folders during testing).

---

## 21. Troubleshooting

| Problem | Possible reason | What to do |
|---|---|---|
| Book Now form won't submit | A required field is missing/invalid — look for a red error message next to a specific field | Fill in the missing/invalid field and try again |
| Book Now shows "The request could not be sent right now" | A network problem on the customer's end, or a temporary server issue | Ask the customer to try again, or call in directly; nothing was saved for this attempt |
| Book Now shows a generic error with a Call button, not the success message | The database itself is temporarily unreachable — a real backend problem, not a form-validation issue | Contact the developer immediately — this means leads may not be saving at all |
| A Telegram notification wasn't received for a known submission | Telegram may be misconfigured, or Telegram itself had an outage | Check the request's detail page in `/admin/requests/[id]` — if "Telegram" shows Failed, the lead is still safely saved; contact the developer if this keeps happening |
| A confirmation email wasn't received | The customer's email may be invalid/mistyped, it landed in spam, or Resend is misconfigured/unverified | Check the request's detail page — if "Email confirmation" shows Failed, confirm the email domain is verified in Resend; check spam folders first |
| Chatbot doesn't respond / shows "having trouble connecting" | The Gemini AI service isn't configured, hit a usage limit, or is temporarily down | Try again in a few minutes; if it persists, contact the developer to check the Gemini configuration/billing tier |
| Chatbot says "you've sent several messages…" | The visitor (or a shared IP, e.g. office Wi-Fi) hit the short-term rate limit (roughly 20 messages/10 minutes) | This is expected anti-abuse behavior; wait a few minutes, or use Call/Book Now instead |
| Call button doesn't do anything on a desktop computer | Normal browser behavior — a `tel:` link only works if the computer has a calling app associated with it | Not a bug; on desktop, customers typically read the number and dial it manually or via their phone |
| Admin login fails | Wrong email/password, or the account isn't (or is no longer) an active admin — the message is intentionally the same for both cases | Double-check credentials; if you believe the account should work, ask a Super Admin to check/reset it in `/admin/admins` |
| A new admin was created but the temporary password is lost | Temporary passwords are shown exactly once, on screen, and never stored anywhere retrievable | A Super Admin must use **Reset Password** on that admin to issue a new temporary password |
| A submitted lead doesn't appear in the admin panel | Very rare — would mean the database insert itself failed | Contact the developer — this is a backend issue, not something fixable from the admin UI |
| A page fails to load / shows an error | Could be a real outage, a bad deployment, or an unrelated hosting/DNS issue | Contact the developer |

For anything not resolvable from the admin panel itself: **contact the developer.**

---

## 22. Production / Domain Notes

- The website is hosted on **Vercel**. Two domains point at the same deployment: **apexhomesupport.com** (the public site) and **admin.apexhomesupport.com** (which quietly serves the same admin panel under a dedicated address, without ever changing the URL the visitor sees).
- Signing in on `apexhomesupport.com/admin` and signing in on `admin.apexhomesupport.com` are treated as **separate sessions** — logging in on one does not automatically log you in on the other. This is intentional (a security choice), not a bug.
- Several features (Supabase, Telegram, Resend, Gemini) depend on environment configuration set inside Vercel's project settings, not inside the website's code itself. If Apex ever changes hosting providers or the production domain, **all of these need to be re-verified and reconfigured** — they will not "just work" on a new host without the same environment variables being carried over correctly.
- Changing the production domain itself is possible but should go through the developer, since the admin-subdomain routing described above is specifically wired to `admin.apexhomesupport.com` as a fixed value in the code (not a setting a client can change from a dashboard).

---

## 23. Quick Start for Apex Staff

## Daily Workflow — 1 Minute Version

1. Open `admin.apexhomesupport.com` (or `apexhomesupport.com/admin`) and sign in.
2. Check the **Dashboard** for the "New Requests" count.
3. Go to **Requests**, and work through anything marked **NEW**, newest first.
4. Call each customer using the phone number shown on their request.
5. After the call, update that request's status to **Contacted** (and add a quick note if useful).
6. Once a visit is actually arranged by phone, move it to **Scheduled**; after it happens, mark it **Completed** (or **Cancelled** if it falls through).
7. Once in a while, check the **Reviews** tab for anything **Pending** and approve or reject it.
8. If the Dashboard shows a "Telegram Failed" or "Email Failed" count that keeps growing, flag it to the developer — leads are still safe, but the notification pipeline may need attention.

---

## 24. Feature Summary

| Feature | Status | Note |
|---|---|---|
| Public marketing website (homepage, services, about, brands, service areas, contact) | ✅ Implemented | Multi-page, no gaps found |
| Service directory (categories → sub-services) | ✅ Implemented | Four categories, each with several sub-services |
| Request Service ("Book Now") lead form | ✅ Implemented | This is *not* a scheduling/booking engine — it's a lead-capture form; no calendar or time slots exist |
| Click-to-call | ✅ Implemented | Same real number everywhere; no call tracking/recording exists |
| Click-to-text | ❌ Not implemented | An SMS link exists in the code's configuration but is not placed on any visible button |
| Mobile sticky Call/Book Now bar | ✅ Implemented | Phones/tablets only |
| AI chatbot | ✅ Implemented | Committed to the codebase; production live-deployment status on the real domain was not independently re-verified in this audit (see Developer Verification Notes) |
| Chatbot emergency safety guard | ✅ Implemented | Deterministic, runs before the AI, covers 5 hazard types |
| Chatbot conversion actions (Book/Call buttons) | ✅ Implemented | Deterministic mapping, not AI-generated buttons |
| Instagram/ad-campaign-specific lead flow | ❌ Not implemented | No dedicated route, form, or UTM tracking exists |
| Booking/appointment scheduling engine | ❌ Not implemented | No calendar, no time slots — arranged manually by phone after a request |
| Telegram lead notifications | ✅ Implemented | Fires on every request; fails silently to the customer, visibly to staff |
| Email confirmation to customer | ⚠️ Partially implemented / requires configuration | Code is complete; requires a verified Resend sending domain in production to actually deliver |
| Customer reviews (submission + moderation + public display) | ✅ Implemented | Full pending → approve/reject → public flow, including optional photo upload |
| Admin panel — authentication & authorization | ✅ Implemented | Real Supabase Auth + a separate internal admin-permission table |
| Admin panel — Requests/CRM | ✅ Implemented | Status pipeline, notes, activity timeline, customer linkage |
| Admin panel — Customers | ✅ Implemented | Automatic identity matching by phone/email |
| Admin panel — Reviews moderation | ✅ Implemented | Approve/reject/feature/verify, all reversible |
| Admin panel — Admin account management | ✅ Implemented | Super Admin only; temporary-password provisioning, no email invites |
| Admin panel — Call tracking / call logs | ❌ Not implemented | Explicitly deferred, confirmed by code comments and architecture docs |
| Admin-subdomain routing (`admin.apexhomesupport.com`) | ✅ Implemented | Rewrites transparently to the same admin pages |
| Analytics platform | ❌ Not implemented | No Google Analytics or similar found anywhere in the codebase |

---

## 25. Important Notes / Current Limitations

A few places where the visible website copy doesn't quite match the underlying behavior — worth Apex's attention, not urgent bugs:

1. **The `/contact` page has outdated copy.** It currently reads: *"Online submission is not yet connected, so the flow will not claim Apex received the request — call for the fastest response."* This was accurate at an earlier stage of the project, but **Book Now is now fully connected** (it saves to the database, notifies Telegram, and can send a confirmation email). This sentence should be updated so it doesn't undersell a feature that now works.
2. **"Call or text" hero copy vs. no click-to-text button.** As covered in Section 8, the hero section's phrase "Call or text and we reply right away" implies a texting option that has no corresponding button anywhere on the site today.
3. **"Book Now" naming vs. actual behavior.** The button is named "Book Now" everywhere, which can read to a customer like a real-time booking action. In reality it submits a request that a staff member follows up on by phone — the form's own fine print already clarifies this ("Sending this does not confirm an appointment"), but the button label itself doesn't hint at that distinction.
4. **No call tracking of any kind.** Every phone number on the site is a plain, identical tap-to-call link — there is no way, from the website or admin panel, to see whether or when a customer actually called, since the admin panel does not use a phone/CRM telephony integration. This is a deliberate, documented decision (not an oversight), but worth knowing if Apex wants call analytics later.
5. **Reviews have no notification to staff.** Unlike a new service request (which triggers Telegram), a new pending review generates **no alert anywhere** — staff must check the admin Reviews queue manually.

---

## Developer Verification Notes
*(Internal — not for the client)*

**Method:** This manual was produced by directly reading the live source code, the project's extensive existing `/docs` architecture files (which were unusually thorough and are the primary source for the Book Now, Chat, Reviews, and Admin sections), the actual route tree under `src/app`, the real content data in `src/content`, and `git log`/`git status` (working tree clean, `main` up to date with `origin/main`, HEAD at `eb42934`). No code was changed, and no live network calls (to Supabase, Telegram, Resend, or Gemini) were made during this audit.

**Verified directly from code (high confidence):**
- Book Now field set, validation, submission flow, Telegram/email dual-channel delivery, and their independent failure handling — matches `src/features/booking/*`, `src/app/api/book-now/route.ts`, and `docs/BOOK_NOW_ARCHITECTURE.md` exactly.
- Chat emergency guard patterns, system prompt content/restrictions, structured-output fields, and the deterministic action-mapping rules — read directly from `src/features/chat/safety.ts`, `system-prompt.ts`, `actions.ts`, `types.ts`, and `chat-context.tsx`.
- Full route map for both the public site (`src/app/(marketing)/**`) and the admin area (`src/app/admin/**`), including the `admin.apexhomesupport.com` subdomain rewrite in `src/proxy.ts` / `src/lib/admin-host.ts`.
- Admin permission model, request/customer CRM data model, and status pipeline — read from `src/features/admin/**` and cross-checked against `docs/ADMIN_ARCHITECTURE.md`.
- Reviews submission/moderation/public-display pipeline, including the honeypot and rate-limiting design — read from `src/features/reviews/**`, `src/app/api/reviews/route.ts`, and `docs/REVIEWS_ARCHITECTURE.md`.
- Confirmed the `sms:` link exists in `src/content/company.ts` but is not referenced by any component (`grep` for `smsHref` found only its definition and type declaration) — hence Section 8's finding.
- Confirmed no Instagram/campaign-specific code exists anywhere (`grep` for `instagram|utm_|campaign|fbclid` across `src/` returned nothing).
- Confirmed no analytics library in `package.json` dependencies.

**Requires environment configuration to actually function in production (code is complete, but I could not verify live third-party behavior without credentials, and did not attempt to):**
- Telegram delivery (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`)
- Resend confirmation email (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, verified sending domain)
- Gemini chatbot (`GEMINI_API_KEY`) — `docs/CHAT_ARCHITECTURE.md` records the Gemini tier as confirmed Free Tier in an earlier local test (an actual quota-exceeded error was observed); current billing/tier status was not re-checked here and should be confirmed directly in Google AI Studio before relying on it at real customer volume.
- Chat and review rate limiting (`CHAT_RATE_LIMIT_SALT`, `REVIEW_RATE_LIMIT_SALT`) — both fail open (never block a legitimate submission) if unset or if their Supabase migration hasn't been applied yet; `docs/CHAT_ARCHITECTURE.md` notes the chat rate-limit migration had **not** been applied to the live Supabase project as of that doc's writing — this should be reconfirmed, since a fresh check was not performed in this session.

**Could not be fully verified locally / not independently re-confirmed in this session:**
- **Whether the AI chatbot is actually live on the real production domain right now.** `docs/CHAT_ARCHITECTURE.md` explicitly states that, as of its own writing, the chatbot existed only as uncommitted local work and that the live production domain returned a 404 for `/api/chat`. Since that doc was written, the chatbot **has been committed to `main`** (commit `eb42934`, the current HEAD) — but this audit did not make a live network request to `apexhomesupport.com` to confirm the deployed site actually reflects that commit and that `GEMINI_API_KEY`/`CHAT_RATE_LIMIT_SALT` are set in Vercel's production environment. Recommend Apex/developer do one live smoke test on the real domain before telling customers about the chatbot.
- Real end-to-end delivery of Telegram messages and Resend emails against the live, real-credentialed production project — not triggered during this audit, to avoid creating fabricated test data in a real business's systems.
- Actual current Supabase/Vercel/Gemini plan tiers and any associated cost, beyond what's stated in the docs (Section 18's "may require a paid plan" language is intentionally hedged, not a firm claim).

**Buttons/features whose UI exists but backend behavior is more limited than the label suggests:**
- "Book Now" — see Limitation #3 above; it is a lead form, not a scheduling engine.
- The hero's "Call or text" phrasing — see Limitation #2; no text-message UI element actually exists.
- The header's "Live Now" badge — confirmed to be static marketing copy with a CSS pulse animation, not a real live-status feed of anything.

**Documentation uncertainty worth flagging to the client:** `docs/CHAT_ARCHITECTURE.md`'s own "Production operational status" section is now stale (it predates the chat feature's commit to `main`) — I did not rewrite that internal doc, since the task scope was the client-facing manual only, but a developer should update or remove that stale section the next time `docs/CHAT_ARCHITECTURE.md` is touched, so it doesn't mislead a future reader the way it nearly did here.
