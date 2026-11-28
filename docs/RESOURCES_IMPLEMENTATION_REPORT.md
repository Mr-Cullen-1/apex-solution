> Superseded on 28 November 2026 by the approved 13-article client import and `/blog` migration. See [current completion report](BLOG_IMPLEMENTATION_REPORT.md) and [current system documentation](RESOURCES.md). This file preserves draft-phase evidence only.

> Author update, 26 November 2026: Apex Home Services is now the approved Organization author for all five drafts. Earlier unassigned-author observations below are historical; see [author configuration](editorial/AUTHOR_CONFIGURATION.md).

# Apex Blog / Resources implementation report

> Historical baseline report. Article 1 was subsequently enhanced with images, source links and winter safety guidance. See the [current enhancement and validation report](editorial/ARTICLE_1_ENHANCEMENT_REPORT.md) for its final draft state.


25 November 2026 — implemented and verified in the existing project. Changes are uncommitted and undeployed.

## 1. Functionality delivered

A complete local-content resource foundation now shares the existing marketing shell and design system. It includes the resource landing page, five topic pages, a reusable published-article template, featured/latest cards, category and breadcrumb navigation, related articles/services, native FAQ accordions, table of contents, responsive images, reusable editorial blocks and approved booking CTAs.

The five requested briefs exist as private drafts. Public landing/category pages show a designed empty state. There is no fake newsletter/search integration, public preview endpoint, new CMS, runtime dependency or invented business claim.

## 2. Files created

Application:

```text
src/types/resource.ts
src/content/resources/articles.ts
src/content/resources/categories.ts
src/content/resources/index.ts
src/lib/resource-seo.ts
src/components/resources/resource-article.tsx
src/components/resources/resource-card.tsx
src/components/resources/resource-content.tsx
src/components/resources/resource-cta.tsx
src/components/resources/resource-image.tsx
src/components/resources/resource-listing.tsx
src/components/resources/resource-navigation.tsx
src/app/(marketing)/resources/page.tsx
src/app/(marketing)/resources/not-found.tsx
src/app/(marketing)/resources/[slug]/page.tsx
src/app/(marketing)/resources/category/[category]/page.tsx
```

Tests and documentation:

```text
tests/resource-fixture.cjs
tests/resources.test.cjs
tests/resources-render.test.cjs
tests/resources-browser.cjs
docs/RESOURCES.md
docs/RESOURCE_ASSETS.md
docs/RESOURCES_IMPLEMENTATION_REPORT.md
docs/superpowers/plans/2026-11-25-resources.md
```

Generated evidence: `output/playwright/resources/verification.json`, 20 resource screenshots, and `output/playwright/resources/regression/` containing three viewport reports and nine existing-page screenshots. Synthetic article imagery/copy exists only in the QA fixture; no draft was published to test the template.

## 3. Existing files modified

| File | Change |
| --- | --- |
| `src/content/navigation.ts` | Resources link in the shared desktop/mobile menu data |
| `src/components/layout/footer.tsx` | Homeowner resources link |
| `src/app/sitemap.ts` | Publication-aware resource sitemap entries |
| `src/app/globals.css` | Scoped resource article typography/callouts using existing tokens |
| `docs/ARCHITECTURE.md` | Resource architecture and publishing-boundary reference |
| `docs/DESIGN_SYSTEM.md` | Resource design, images and native disclosure conventions |

No package, lockfile, environment, booking/API, database, admin, service content or homepage content changes were made.

## 4. Final route structure

```text
/resources
/resources/[slug]
/resources/category/hvac-heating
/resources/category/water-heaters
/resources/category/appliance-repair
/resources/category/home-maintenance
/resources/category/energy-efficiency
```

The six listing/category URLs return 200 with `noindex, follow` while empty. Only published articles generate detail-route static params. Draft and unknown article/category URLs return proper HTTP 404 responses. There is no public draft-preview mechanism.

## 5. Five article statuses

| Article | Slug | Status |
| --- | --- | --- |
| Why Is My Furnace Not Heating? 7 Common Problems and When to Call a Professional | `furnace-not-heating-common-problems` | draft; public 404 |
| How to Prevent Frozen Pipes in Winter: 10 Essential Tips for Homeowners | `how-to-prevent-frozen-pipes-in-winter` | draft; public 404 |
| 5 Warning Signs Your Water Heater Is About to Fail | `water-heater-warning-signs` | draft; public 404 |
| Why Are Your Heating Bills So High? 8 Ways to Reduce Energy Costs This Winter | `why-are-heating-bills-so-high` | draft; public 404 |
| Repair or Replace? How to Decide When a Home Appliance Stops Working | `repair-or-replace-home-appliances` | draft; public 404 |

Each contains the exact requested title, slug, editorial category and primary/secondary keywords; unique draft SEO configuration; tags, excerpt, canonical and relationships. Body arrays are empty and a private editorial note explains the remaining work. Author, dates, image and reading time are null until real content is supplied. Frozen-pipes education has no related plumbing service.

## 6. SEO infrastructure

- Unique per-article SEO title/description, canonical, Open Graph article metadata, Twitter large-image card and robots directives. Complete listing/category metadata too. No meta keywords.
- BlogPosting with real editorial dates, author and image once published; existing Organization component/publisher ID reused without new business facts. BreadcrumbList matches visible navigation.
- Drafts excluded from route params, public HTML, metadata, JSON-LD, related cards and sitemap. Exact draft slugs/editorial-note text were also absent from compiled client chunks.
- Empty listing/category pages stay out of the sitemap until populated. Published entries use authored publication/update dates for lastModified.
- Validation rejects missing publication requirements, future update dates, invalid date order, invalid service references, bad canonicals, duplicate IDs/headings and unsafe links. Local heading anchors and known category URLs are supported.
- Asset naming documentation lives in `docs/RESOURCE_ASSETS.md`, outside publicly served assets; `/resources/README.md` is explicitly tested as 404.

## 7. Components

`ResourceListing`, `ResourceArticle`, `ResourceCard`, `ResourceDate`, `ResourceImage`, `ResourceBreadcrumbs`, `ResourceCategories`, `ResourceContent`, `ResourceText` and `ResourceCTA`. New presentation components are server components; the existing narrow booking client boundary is reused. FAQs use native details/summary and require no added JavaScript.

## 8. Verification results

| Check | Result |
| --- | --- |
| `npm.cmd run lint` | passed |
| `npm.cmd run typecheck` | passed |
| `npm.cmd run build` | passed; 41 static pages generated |
| `node --test tests/*.test.cjs` against local production server | 59 passed, 0 failed; includes 10 resource-specific tests |
| Resource HTTP/SEO checks | 15 passed: all six listings, five drafts, unknown article/category, private asset-documentation URL, sitemap |
| Resource browser layouts | 20 passed: empty index/category and synthetic published article/grid at 320, 390, 768, 1280, 1440 px |
| Resource interactions | 13 passed: mobile menu, real booking modal open/close, native FAQ keyboard, TOC anchors; no booking submitted |
| Internal resource-page links | 25 checked, no broken destinations |
| Existing-page browser regression | Homepage, furnace repair and water-heater repair at desktop/tablet/mobile: 9 passed |
| Accessibility/assets/runtime | Zero tested WCAG A/AA axe violations, horizontal overflow, broken images, browser console/page errors or failed assets in checked layouts |
| `git diff --check` | passed |
| Independent code review | Findings fixed and verified; no remaining blockers reported |

Browser: Chrome 158.0.8127.38. Tests exercised the local production build. Published template tests used synthetic in-memory content with the actual components and compiled styles; there is intentionally no real published article URL to test. Native FAQ/TOC rendering was tested without a hydrated article client component. Desktop and narrow/mobile screenshots were visually inspected.

The first broad test run preceded the local server and its five HTTP tests failed with connection refused. After starting the server, the final full run passed all 59. The initial browser fixture had a base-URL error that navigated its TOC to the homepage; the harness was corrected and the full final browser run passed.

## 9. Remaining limitations

- The build logs existing `[reviews_fetch_failed] TypeError: fetch failed` warnings while prerendering review-consuming pages. Build exit status is successful; checked homepage/service layouts render without browser errors. Live review retrieval was not validated, and that integration was not changed.
- Full article bodies, fact-checking, approved author attribution, featured images and actual editorial dates remain intentionally pending for the next phase.
- No deployment or live production verification was performed. No booking submission, notification or external write was used for browser QA.
- Automated accessibility checks cover the specified WCAG tags and interactions, not every assistive-technology scenario.

## 10. Next steps to write and publish

1. Write and review each article separately, retaining the supplied slug/keyword focus and Apex's independent-provider role.
2. Populate typed body blocks, real author, final excerpt/SEO copy, reading time and actual publication date. Add relevant FAQs and verified service/article links.
3. Add approved local images and alt text using [the asset conventions](RESOURCE_ASSETS.md). Confirm files exist and review mobile/desktop crops.
4. Complete editorial review, remove the editorial note, and explicitly change that record from draft to published. Do not publish placeholder copy.
5. Follow [the detailed publishing checklist](RESOURCES.md#exact-writing-and-publication-workflow), update draft-only test expectations to the intended inventory, rerun quality/HTTP/browser checks, and verify the new article/index/category/sitemap behavior.
6. Use the normal authorized release process. Content publication requires a rebuild and deployment; no automatic scheduler or CMS is implied.
