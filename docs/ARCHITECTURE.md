# Architecture

## Stack

- Next.js 16 App Router
- React 19
- TypeScript in strict mode
- Tailwind CSS 4
- Self-hosted Geist through `next/font/local`, plus `next/image`

The only runtime dependency beyond Next and React is the official `geist` font package. No component kit, icon library, animation runtime, form library, or CMS client is included in Phase 0. Add one only when a concrete feature justifies it.

## Source layout

### Public service workspace (2026-11-16)

`Hero` remains a server component and passes only service identity/description fields to the client `HomeExplorer`. The explorer owns illustration view state. `BookNowContext` owns the home category selection so both the contextual `BookingLink` and the navigation dock open the same service request. Presentation descriptions live in `src/content/service-experience.ts` and icons in `src/components/ui/service-icon.tsx`.

`ServiceFinder` receives a minimal directory projection from the server-rendered services index. Search filters locally using word-prefix matching in `src/lib/service-search.ts`, so "AC repair" cannot match the middle of "furnace" or "diagnostics". It preserves ordinary Next links and category booking actions, with no API endpoint or dependency.

`MobileActionBar` is now the public navigation dock through tablet widths. It derives booking context from the current category/subservice route and uses the existing chat provider for Help. `BookNowContext` exposes `isOpen` so the dock becomes inert and desktop help hides during booking. The marketing wrapper owns dock clearance; `/admin` retains its separate shell. No scheduling, notification, database or account changes accompany this redesign.

```text
src/
  app/                 routes, metadata, and global styles
  components/
    home/              composed homepage sections
    services/          shared category and detail-page sections
    layout/            global site shell
    navigation/        interactive responsive navigation
    ui/                small reusable primitives
  features/
    booking/           request state, validation, presentation, and adapter boundary
  content/             CMS-ready structured business content
  types/               domain types shared across content and UI
docs/                  product, system, architecture, and roadmap decisions
```

Future feature-specific code should live under `src/features`, beginning with `src/features/booking`. Integrations should be isolated in `src/lib/integrations` so UI components do not depend directly on a CRM or scheduling vendor.

## Content boundary

### Resources (25 November 2026)

The Blog / Resources foundation uses `src/content/resources`, `src/types/resource.ts`, server components in `src/components/resources`, and three route patterns under `app/(marketing)/resources`. A single publication selector feeds detail routes, related cards, metadata and sitemap. Five initial records are private drafts; empty resource/category pages are noindex until publication. No CMS or database integration is added. See [Resources architecture and publishing](RESOURCES.md). Article 1 adds reviewed exact HTTPS source URLs through `sources.ts`, reusing existing inline link blocks; optional `featuredImageCaption` provides visible image provenance. The publication gate is unchanged.

The files in `src/content` are the single source of truth during the file-backed phase. They deliberately mirror simple CMS collections. Unknown factual content stays `null` or in an empty collection; UI must handle that state honestly.

`serviceAreas` is organized as typed state groups containing confirmed county lists. `supportedBrands` is organized as typed appliance, premium-appliance, and HVAC categories. `services.ts` is the typed taxonomy for category, service, problem, relationship, FAQ, media, and SEO data. Homepage, navigation, service routes, and footer consume these datasets directly. `cta.ts` and `BookingLink` define the site-wide "Book Now" entry point, which opens the shared modal in `src/features/booking/book-now-modal.tsx` rather than navigating to a page.

### Footer appliance coverage

`src/content/appliance-repair.ts` holds the client-supplied equipment list: nine residential appliance types and four commercial equipment types. The footer renders these as semantic lists under the existing Appliance Repair category link, without creating equipment-specific routes. The catalogue occupies a full row above the other service links; residential items use two columns from `sm`, with commercial equipment beside them. On narrow screens both groups stack. The existing review-flow footer exclusion and mobile booking/call actions remain in place.

## Route strategy

Completed service routes live under `app/services`; core public pages live at `app/about`, `app/brands`, `app/contact`, and `app/service-areas`. `completedPublicPaths` (`src/content/routes.ts`) and `completedServicePaths` feed the sitemap. Do not generate thin location, brand, or article pages solely for SEO.

The old catch-all set of `noindex` "planned" foundation pages (`/emergency`, `/membership`, `/financing`, `/team`, `/faq`, `/privacy`, etc.) was removed — none had real content or an inbound link from the live UI, and the client asked for fewer placeholder pages. `/book` still resolves (as a redirect into the Book Now modal, preserving `?service=`/`?category=` context) so old links never 404.

The Service Areas page consumes the shared approved three-state, 18-county directory and exact 721-ZIP allowlist. The homepage and Service Areas page use the same accessible ZIP checker; no county or ZIP landing pages are generated. ZIP-to-county assignments are deliberately absent because the source crosswalk is blank. See [coverage documentation](SERVICE_COVERAGE.md). The Brands page consumes the single supported-brand dataset and maintains a small explicit mapping from brand group to existing service-category routes.

### Blog migration, 28 November 2026

The existing Resources engine now serves the client's 13 complete articles at `/blog` and 12 populated category routes. Legacy Resources URLs permanently redirect to approved successors; private planned drafts remain excluded. Original Word content is extracted into a provenance-bearing JSON source, then adapted through the shared typed resource renderer. Search receives server-rendered card slots and searchable summaries; article bodies and editorial drafts remain server content. Organization author/publisher identity, metadata, JSON-LD and sitemap derive from existing shared utilities. See [current Resources architecture](RESOURCES.md) and [implementation report](BLOG_IMPLEMENTATION_REPORT.md).

## Booking boundary

The booking flow keeps in-progress contact and address data in component memory and sends it only in a JSON request body. `model.ts` owns normalization, preselection, and shared validation; the API route repeats normalization and validation before calling `submission-adapter.ts`. The current adapter deliberately returns `not_configured` and does not transmit or persist a request. No scheduling backend, CRM, SMS, or email delivery is implied.

`BookingLink` is the only query-string construction boundary. It permits category or service IDs, never personal data. A future provider should replace the adapter implementation and read credentials only from server-side environment variables. Production integration also needs rate limiting, bot protection, monitoring, retention rules, and legally approved communication consent.

## SEO foundation (updated 17 November 2026)

The sitemap includes the 19 completed marketing URLs, including `/reviews`; it omits `/review`, admin, token and utility routes. `lastModified` is omitted until real editorial dates are maintained. A build timestamp is not a content update.

Home and About emit the same Organization ID (`/#organization`), approved logo/phone and county-level coverage with parent states. Service JSON-LD links Apex as `broker`, matching the existing About explanation of independent providers; qualified text coverage avoids claiming every service is offered in every county. No office, LocalBusiness subtype, rating or credentials were invented. See [Schema.org Service](https://schema.org/Service) and [areaServed](https://schema.org/areaServed).

Category/detail pages pass a single breadcrumb array to `ServiceHero`; visible navigation and `BreadcrumbStructuredData` use the same names/URLs. The current item is visible and marked `aria-current`. See [BreadcrumbList](https://schema.org/BreadcrumbList).

`next.config.ts` adds nosniff, strict-origin-when-cross-origin referrer policy and same-origin framing. Cross-origin embedding is intentionally not allowed; no embedding integration was found. CSP enforcement and production-domain redirect changes remain separate staging/hosting work. This batch adds no runtime dependency, route, database migration or analytics script.

### Historical foundation notes (superseded by the current state above)

Root metadata, Open Graph defaults, `robots.ts`, and `sitemap.ts` are present. Production must supply `NEXT_PUBLIC_SITE_URL`. Completed service routes define unique descriptions, canonical URLs, Open Graph data, indexable robots directives, and fact-limited `Service` JSON-LD. The sitemap contains only the homepage and completed service routes.

The homepage and completed booking and service pages are explicitly indexable and own canonical URLs. The catch-all foundation routes retain `noindex, nofollow` metadata.

Former Phoenix city placeholders were removed. County landing pages are intentionally deferred; Phase 1.1 does not create thin regional routes.

## Client boundaries

The footer directory is a Server Component. Its small `FooterVisibility`
client wrapper reads the pathname to preserve hiding on `/review` and
`/review/<token>`; the existing `BookingLink` remains the interactive booking
boundary. Footer labels live in `src/content/footer.ts`, company and contact
details in `company.ts`, and the state badge derives from `site.ts` service areas.
Equipment links share the existing `/services/appliance-repair` route; HVAC
links derive from the existing service catalog. No new routes or dependencies
are added by the November 2026 footer redesign.

The navigation shell is client-side only where needed for mega-menu state, focus management, Escape handling, outside clicks, and mobile scroll locking. The homepage FAQ and focused booking-flow boundary are client components. Booking metadata, query parsing, page shell, service pages, and other homepage sections remain server-rendered.
