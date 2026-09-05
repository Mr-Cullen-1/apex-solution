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
  content/             CMS-ready structured business content
  types/               domain types shared across content and UI
docs/                  product, system, architecture, and roadmap decisions
```

Future feature-specific code should live under `src/features`, beginning with `src/features/booking`. Integrations should be isolated in `src/lib/integrations` so UI components do not depend directly on a CRM or scheduling vendor.

## Content boundary

The files in `src/content` are the single source of truth during the file-backed phase. They deliberately mirror simple CMS collections. Unknown factual content stays `null` or in an empty collection; UI must handle that state honestly.

`serviceAreas` is organized as typed state groups containing confirmed county lists. `supportedBrands` is organized as typed appliance, premium-appliance, and HVAC categories. `services.ts` is the typed taxonomy for category, service, problem, relationship, FAQ, media, and SEO data. Homepage, navigation, service routes, and footer consume these datasets directly. `cta.ts` and `BookingLink` normalize the current booking entry point for replacement in Phase 2B.

## Route strategy

The typed route inventory in `src/content/routes.ts` powers a catch-all set of `noindex` foundation pages, keeping planned navigation destinations functional without presenting them as complete. Completed service routes live under `app/services`, use static params, and own indexable metadata. Dynamic resource pages will later use `app/resources/[slug]`. Do not generate thin location or article pages solely for SEO.

## Booking boundary

The future wizard will separate typed form state, step validation, presentation, and submission adapter. React Hook Form and Zod are deferred until that implementation begins. All primary service CTAs currently resolve through `src/content/cta.ts`; no scheduling backend is implied.

## SEO foundation

Root metadata, Open Graph defaults, `robots.ts`, and `sitemap.ts` are present. Production must supply `NEXT_PUBLIC_SITE_URL`. Completed service routes define unique descriptions, canonical URLs, Open Graph data, indexable robots directives, and fact-limited `Service` JSON-LD. The sitemap contains only the homepage and completed service routes.

The homepage is explicitly indexable and owns a canonical URL. The catch-all foundation routes retain `noindex, nofollow` metadata.

Former Phoenix city placeholders were removed. County landing pages are intentionally deferred; Phase 1.1 does not create thin regional routes.

## Client boundaries

The navigation shell is client-side only where needed for mega-menu state, focus management, Escape handling, outside clicks, and mobile scroll locking. The FAQ accordion is the only homepage client component. All other homepage sections render as Server Components.
