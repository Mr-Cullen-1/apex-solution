# Apex Home Services

Apex Home Services is a premium, scalable US home-services website focused on HVAC, plumbing, indoor air quality, appliance service, and high-conversion service booking.

## Product promise

The experience combines technical precision, trustworthy local service, editorial polish, and problem-first navigation. The confirmed tagline is **Reliable Home Services. Local Professionals.**

## Current delivery boundary

Phase 0 established the production foundation. Phase 1 established the responsive homepage, accessible global navigation, temporary media system, and primary visual language. Phase 2A completed the service architecture, and Phase 2B completed the `/book` request experience with an unconnected, server-validated submission boundary. Phase 2C completed the public Service Areas, About, Brands We Service, and Contact pages. Phase 3 (Sep 2026) replaced the visual system with a reference-driven design language (pale-neutral/near-black/natural-green palette, rounded surfaces, phone-first conversion hierarchy) across the whole site, added a real client-confirmed phone number, and introduced First-Time Offer, Apex Results, Credentials, Service Call Pricing, and Reviews sections plus a `/reviews` route (`noindex` until real reviews exist). Remaining resource, commercial, team, proof, career, and legal routes stay `noindex` until their content or required business data is ready.

The client-preview shell exposes only completed destinations. Unsupported projects, Apex Care, financing, offers (in the promotional sense), emergency, and journal content remain modeled for later work but are hidden from the homepage, primary navigation, and footer. `src/components/home/work-care-and-proof.tsx`, `story-and-problems.tsx`'s prior homepage role, and `footerNavigation` in `src/content/navigation.ts` are dormant components from the pre-Phase-3 design, superseded but not deleted — a future pass should decide whether to remove or repurpose them.

## Confirmed versus pending content

Confirmed by the client: the public business name, tagline, five-state county coverage, supported-brand lists, core service taxonomy, the Apex Care concept, the business phone number `(516) 586-0826`, a starting service-call price of $89 with a same-day-conversion diagnostic credit, a first-time 10% maintenance offer, and the credential/experience claims in `src/content/trust.ts`.

Pending business verification: email, street address, hours, licenses beyond the approved credential wording, emergency availability beyond "Emergency Same-Day Service, We arrive ASAP", prices beyond the $89 service call, financing terms, guarantees (explicitly withheld from public copy per client instruction), statistics, real customer reviews, real Before/After photography, projects, team members, warranties, manufacturer authorizations, exact ZIP-level availability, legal copy, and a real Apex logo/favicon asset (none exists in the repository — see `docs/MEDIA.md`). These must not be invented.

## Local commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

Set `NEXT_PUBLIC_SITE_URL` to the canonical production origin before deployment.
