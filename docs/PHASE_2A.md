# Phase 2A — Premium services architecture

## Resulting taxonomy

The published category taxonomy is Appliance Repair, Cooling, Heating, Plumbing, and Indoor Air Quality. The individual catalog contains AC Repair, AC Installation, AC Maintenance, AC Replacement, Furnace Repair, Heat Pumps, Heating Maintenance, Water Heaters, Drain Cleaning, and Leak Detection.

Appliance Repair and Indoor Air Quality remain complete category experiences without speculative child services. Plumbing is retained because it was already part of the confirmed repository service catalog; no electrical, roofing, water-treatment, or invented emergency offering was added.

## Route inventory

- `/services`
- `/services/appliance-repair`
- `/services/cooling`
- `/services/cooling/ac-repair`
- `/services/cooling/ac-installation`
- `/services/cooling/ac-maintenance`
- `/services/cooling/ac-replacement`
- `/services/heating`
- `/services/heating/furnace-repair`
- `/services/heating/heat-pumps`
- `/services/heating/heating-maintenance`
- `/services/plumbing`
- `/services/plumbing/water-heaters`
- `/services/plumbing/drain-cleaning`
- `/services/plumbing/leak-detection`
- `/services/air-quality`

Unfinished conversion, company, location, resource, and legal routes continue through the `noindex, nofollow` catch-all foundation.

## Page architecture

The services index combines an editorial hero, numbered category directory, customer-language problem discovery, centralized brand reassurance, compact regional coverage, and a final request CTA. Category pages support hero, introduction, child-service directory or honest category-only explanation, situations, visit process, relevant brands, service region, FAQs, and final CTA. Individual pages add contextual category navigation, service overview, non-diagnostic signs, data-defined related services, and the same reusable trust modules.

## Component architecture

Reusable server components live in `src/components/services`. `service-sections.tsx` contains the hero, directory, problem module, visit process, brand groups, region module, FAQs, related links, and final CTA. Category and individual compositions are separate wrappers. `service-structured-data.tsx` owns safe JSON-LD output. No new runtime dependency or global client state was added.

## Service-content model

`src/content/services.ts` is the single typed source for categories, individual services, problem labels, summaries, signs, overview content, related IDs, FAQ data, applicable brand-group IDs, media references, route paths, SEO, and publication status. Navigation, homepage discovery, generated routes, sitemap, and service pages consume this source.

## Related-service logic

Each individual service declares explicit `relatedServiceIds`. Rendering resolves only those IDs against the central catalog, preventing random or mechanically generated cross-links. Category directories provide the primary parent-to-child relationships.

## CTA architecture

`src/content/cta.ts` owns booking and contact destinations. `BookingLink` is the primary-action boundary used by the header, homepage, service pages, and placeholder routes. Phase 2B can replace `/book` at this boundary without revising every service component.

## SEO strategy

Every completed route has an indexable robots directive, canonical URL, unique title and description, and route-specific Open Graph fields. Static params constrain the published route set. The sitemap includes the homepage and completed service routes. Unfinished catch-all pages remain excluded through `noindex`. Service JSON-LD includes only name, description, service type, organization name, known five-state areas, and URL.

## Accessibility decisions

Pages preserve a single H1, semantic sections and lists, labelled section headings, meaningful image alternatives, visible global focus styles, and 48px primary targets. FAQ disclosures use keyboard-accessible native `details` and `summary`. Motion remains CSS-only and is suppressed by the global reduced-motion rule.

## Structured-data decisions

The shared `Service` schema intentionally omits telephone, address, hours, coordinates, price, offers, aggregate rating, reviews, credentials, and authorization claims. The production origin must be supplied with `NEXT_PUBLIC_SITE_URL`.

## Media status

Phase 2A adds temporary Northeast-appropriate appliance and outdoor HVAC concepts. Neutral diagnostic media is reused where a specific image is unnecessary. Older Southwest/desert concepts remain temporary homepage assets with mandatory replacement notes and are not used as service-page regional evidence. The real client logo is still unavailable, so the text brand treatment remains.

## Unresolved business data

Phone, email, street address, hours, licenses, credentials, emergency availability, prices, financing terms, guarantees, warranties, response times, reviews, project facts, team details, manufacturer authorization, and exact ZIP-level availability remain unverified and are not claimed.

## Known visual QA limitations

The in-app browser was unavailable during final validation, so rendered checks at 375px, 768px, 1024px, and 1440px could not be performed. The build and live HTTP checks verify structure and output, but do not substitute for a manual responsive visual review. This remains a pre-release requirement.

## Phase 2B handoff

Implement the `/book` experience as a focused, accessible request flow with typed state, progressive validation, service/category preselection, symptom details, location eligibility capture, contact details, consent, confirmation, and an adapter boundary for a future scheduling or CRM provider. Preserve the current CTA contract and do not imply confirmed appointment availability before backend integration.
