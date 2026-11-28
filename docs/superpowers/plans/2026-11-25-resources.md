# Resources implementation plan

**Goal:** Implement the supplied Blog / Resources brief in the existing checkout, with five private drafts and no full article bodies.
**Architecture:** Server-rendered App Router pages, typed local editorial blocks, a single publication boundary, and existing brand/shell/booking primitives. No CMS, dependencies, public previews, newsletter form, or deployment.
**Spec:** User attachment `Pasted text.txt`, supplied 25 November 2026.

## Audit and decisions

- Clean Git working tree at start. Next 16.4.6, React 19.2.8, Tailwind 4; public pages live in `(marketing)` and share header/footer/booking/chat. Admin and APIs are separate.
- No resource routes existed. Content uses `src/content`, types use `src/types`; service URLs come from `completedServicePaths` and the catalog.
- Existing tokens map legacy copper to brand blue; preserve this rather than introducing new colors. Keep Geist and current responsive shell (desktop navigation starts at xl).
- Reuse Organization and BreadcrumbList components; Article publisher references the existing organization ID. Do not create a second organization definition.
- Empty listing/category pages remain usable but noindex and absent from sitemap. Published content activates indexing automatically. Article routes accept only published entries; unknown/draft paths return 404.
- Prefer typed blocks over MDX/CMS: no dependencies, no executable editorial content, explicit heading/link/image/FAQ/CTA support.

## Tasks

- [x] Add publication-boundary tests, then types, categories, five draft records, validation/selectors, metadata/JSON-LD/sitemap helpers.
- [x] Add shared resource image, cards, category navigation, empty state, breadcrumbs, CTA, block renderer and article template; integrate the three route patterns and scoped styles.
- [x] Integrate header/footer and sitemap; document asset naming and publishing procedure.
- [x] Run resource/regression tests, lint, typecheck and production build. Verify production HTTP responses, metadata, sitemap, draft isolation and links. Check desktop/tablet/mobile layouts and interactions.

## Review focus

- Drafts must not reach HTML, RSC payloads, structured data, related lists, sitemap or static params.
- Published entries need reviewed content, real author/dates and images; no placeholder-only publication.
- Future publication and updates must not index early; authored dates must be valid and ordered.
- Bad category/service/article references and unsafe links must fail validation rather than produce broken public navigation.
- Empty categories, missing slugs, narrow screens, keyboard navigation and native FAQ disclosures must remain usable.
