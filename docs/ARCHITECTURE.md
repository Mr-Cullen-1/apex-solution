# Architecture

## Stack

- Next.js 16 App Router
- React 19
- TypeScript in strict mode
- Tailwind CSS 4
- Self-hosted Geist through `next/font/local`, plus `next/image`

The only runtime dependency beyond Next and React is the official `geist` font package. No component kit, icon library, animation runtime, form library, or CMS client is included in Phase 0. Add one only when a concrete feature justifies it.

## Source layout

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

The files in `src/content` are the single source of truth during the file-backed phase. They deliberately mirror simple CMS collections. Unknown factual content stays `null` or in an empty collection; UI must handle that state honestly.

`serviceAreas` is organized as typed state groups containing confirmed county lists. `supportedBrands` is organized as typed appliance, premium-appliance, and HVAC categories. `services.ts` is the typed taxonomy for category, service, problem, relationship, FAQ, media, and SEO data. Homepage, navigation, service routes, and footer consume these datasets directly. `cta.ts` and `BookingLink` define the site-wide "Book Now" entry point, which opens the shared modal in `src/features/booking/book-now-modal.tsx` rather than navigating to a page.

## Route strategy

Completed service routes live under `app/services`; core public pages live at `app/about`, `app/brands`, `app/contact`, and `app/service-areas`. `completedPublicPaths` (`src/content/routes.ts`) and `completedServicePaths` feed the sitemap. Do not generate thin location, brand, or article pages solely for SEO.

The old catch-all set of `noindex` "planned" foundation pages (`/emergency`, `/membership`, `/financing`, `/team`, `/faq`, `/privacy`, etc.) was removed — none had real content or an inbound link from the live UI, and the client asked for fewer placeholder pages. `/book` still resolves (as a redirect into the Book Now modal, preserving `?service=`/`?category=` context) so old links never 404.

The Service Areas page consumes the single state-and-county dataset and uses anchors rather than generating 29 county routes. The Brands page consumes the single supported-brand dataset and maintains a small explicit mapping from brand group to existing service-category routes.

## Booking boundary

The booking flow keeps in-progress contact and address data in component memory and sends it only in a JSON request body. `model.ts` owns normalization, preselection, and shared validation; the API route repeats normalization and validation before calling `submission-adapter.ts`. The current adapter deliberately returns `not_configured` and does not transmit or persist a request. No scheduling backend, CRM, SMS, or email delivery is implied.

`BookingLink` is the only query-string construction boundary. It permits category or service IDs, never personal data. A future provider should replace the adapter implementation and read credentials only from server-side environment variables. Production integration also needs rate limiting, bot protection, monitoring, retention rules, and legally approved communication consent.

## SEO foundation

Root metadata, Open Graph defaults, `robots.ts`, and `sitemap.ts` are present. Production must supply `NEXT_PUBLIC_SITE_URL`. Completed service routes define unique descriptions, canonical URLs, Open Graph data, indexable robots directives, and fact-limited `Service` JSON-LD. The sitemap contains only the homepage and completed service routes.

The homepage and completed booking and service pages are explicitly indexable and own canonical URLs. The catch-all foundation routes retain `noindex, nofollow` metadata.

Former Phoenix city placeholders were removed. County landing pages are intentionally deferred; Phase 1.1 does not create thin regional routes.

## Client boundaries

The navigation shell is client-side only where needed for mega-menu state, focus management, Escape handling, outside clicks, and mobile scroll locking. The homepage FAQ and focused booking-flow boundary are client components. Booking metadata, query parsing, page shell, service pages, and other homepage sections remain server-rendered.
