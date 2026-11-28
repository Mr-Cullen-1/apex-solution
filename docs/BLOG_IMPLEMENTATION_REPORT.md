# Apex Blog and ZIP Coverage — Completion Report

Prepared locally on **28 November 2026**. No commit, push or deployment was performed. The latest client request explicitly approves all 13 supplied articles for public `/blog` routes, superseding the earlier draft-only Article 1 request. Unrelated planned drafts stay private.

## 1. Implementation

The existing Resources infrastructure now serves a complete Blog landing page, 13 full articles and 12 populated category pages. The Apex shell, tokens, booking modal, service catalog and author identity are reused. No CMS, runtime dependency, database migration or new booking backend was introduced.

The landing page includes a furnace featured article, optimized imagery, dates/read times, responsive cards, title/keyword search, grouped category filters, result counts, reset and empty states. A one-article category shows its featured article without a contradictory empty-result message.

Article pages include breadcrumbs, one H1, **By Apex Home Services**, date, reading time, featured image, table of contents, complete copy, H2/H3 structure, emphasis, nested/numbered/bullet lists, accessible tables, original FAQs/references, related articles, verified service links, phone and real booking actions. No invented commercial service URL is linked.

Source prose was not shortened or rewritten. Extraction and content tests cover **11,456 body words, 55 FAQs, 9 body tables, 143 list items and 6 original source hyperlinks**. Word metadata tables become metadata, not duplicate body tables. Document labels and `@Cameron` remain provenance, not a personal website author. Minor web formatting and verified links preserve the original wording.

## 2. Publication status and routes

All entries below have `status: published` in the **local build**, `publishedAt: 2026-11-28`, `updatedAt: null`, Organization author Apex Home Services and their original SEO title/description. This does not establish remote publication or indexing.

| Article route | Category ID |
| --- | --- |
| `/blog/furnace-not-heating` | `heating` |
| `/blog/refrigerator-not-cooling` | `refrigerators` |
| `/blog/commercial-refrigerator-not-cooling` | `commercial-refrigeration` |
| `/blog/washer-not-draining` | `washers-dryers` |
| `/blog/dryer-not-heating` | `washers-dryers` |
| `/blog/dishwasher-not-draining` | `dishwashers` |
| `/blog/oven-not-heating` | `ovens` |
| `/blog/ice-maker-not-working` | `ice-makers` |
| `/blog/walk-in-cooler-not-cooling` | `walk-in-coolers-freezers` |
| `/blog/commercial-ice-machine-cleaning` | `preventive-maintenance` |
| `/blog/commercial-oven-not-heating` | `commercial-ovens` |
| `/blog/commercial-freezer-not-freezing` | `commercial-freezers` |
| `/blog/ice-machine-not-making-ice` | `commercial-ice-machines` |

Landing: `/blog`. Category routes: `/blog/category/<category-id>` for the 12 distinct IDs above. There are no thin ZIP/county pages or duplicate canonical articles.

Four other planned drafts retain private status and unchanged body copy. The previous furnace draft remains archived in `planned-drafts.ts`/`furnace-not-heating.ts`, outside the active collection. Its old `/resources/furnace-not-heating-common-problems` URL permanently redirects to the new approved furnace article; its original draft body is never exposed. Direct `/blog` draft URLs return 404.

`/resources` redirects permanently to `/blog`. Approved article aliases redirect to their exact Blog canonical. Legacy HVAC category redirects to `/blog/category/heating`; four other legacy category URLs redirect to `/blog`. Unknown articles/categories remain 404.

## 3. SEO and author

- Exact original SEO titles/descriptions; absolute title metadata prevents an extra brand suffix. H1 uses the client's article title.
- Canonical, Open Graph and Twitter metadata have absolute image URLs, relevant descriptions and dates. All 13 public articles are indexable.
- BlogPosting and BreadcrumbList agree with visible content. Organization author Apex Home Services and publisher reference the existing `/#organization` entity. Full Organization coverage uses the approved three-state directory. No fabricated author biography, credential, address, rating or review schema is added.
- Sitemap includes `/blog`, 12 populated categories and each of 13 article canonicals once. Only articles receive authored date values; general pages still omit artificial build timestamps. Drafts and legacy redirect URLs are excluded.
- Original FAQs remain visible. No FAQPage markup or FAQ-rich-result promise is added: Google retired that search feature in 2026. References: [official Search updates](https://developers.google.com/search/updates), [Article guidance](https://developers.google.com/search/docs/appearance/structured-data/article).
- Residential links use verified appliance/heating service routes. Commercial articles link relevant published guides and the existing booking flow because dedicated commercial service pages are absent.

Full metadata/image/author inventory: [publication-manifest.json](../output/blog-source/publication-manifest.json). Canonical origins use existing `NEXT_PUBLIC_SITE_URL` configuration; production must supply its actual origin before release.

## 4. Sources and ZIP coverage

Both mandatory inputs were accessible and read without modification:

| Source | SHA-256 |
| --- | --- |
| `Downloads/Telegram Desktop/Untitled.docx` | `694104eaf150b49f1a798e4c1d3ac387c7fc398a32086fc6ef095784484be2c4` |
| `Downloads/Apex_Home_Services_ZIP_Coverage_and_Search_Demand.xlsx` | `e914f2d04fb64d45685c6ebed09049f1caea4629a826e9e45e1361d749b33364` |

At final handoff, the workbook was rehashed and still matched. The original Word path no longer resolved; a narrow search in its original Downloads location found no replacement Word file. Its previously verified extracted Open XML parts, transcript, exact source JSON and extraction-validation evidence remain in the workspace. No article was reconstructed from assumptions. Restore the original supplied DOCX before attempting a fresh extraction; the recorded hash identifies the expected input.

Coverage contains **721 unique five-character ZIP strings: NY 363, NJ 236, CT 122**. Leading zeros are preserved; matching uses exact membership, not ranges/prefixes. County display contains the approved **18 counties**; MA and RI are excluded. Homepage and Service Areas reuse the accessible checker with supported/unsupported/invalid results, live announcements and contact/booking actions.

Workbook discrepancy: Summary retains a legacy 29-county/five-state total and missing MA/RI ZIP lists. Implementation follows the user's explicit three-state scope and imports the corresponding 18 county rows. The ZIP county column is blank and labeled as needing a crosswalk; no individual ZIP is assigned a county. Demand/lead fields are blank and not measured; modeled estimates are not represented as actual demand or leads. See [SERVICE_COVERAGE.md](SERVICE_COVERAGE.md).

Shared approved phone: `(516) 586-0826` / `tel:+15165860826`; hours Monday-Friday 9 AM-6 PM. Shared article CTAs include $89 starting service-call and same-day diagnostic-fee credit terms. About and Services coverage copy is aligned with the same three-state scope.

## 5. Images

All referenced assets exist. Ten 1600 x 900 optimized WebPs cover 13 articles, intentionally sharing related equipment imagery; sizes are approximately 70–202 KB before Next optimization.

Six new AI editorial illustrations cover laundry, dishwasher, commercial refrigeration, walk-in cooling, commercial ice and commercial oven. The existing AI furnace illustration and three existing client-site photographs (refrigerator, oven, refrigerator ice maker) are reused. AI article figures carry visible disclosure and descriptive alt text, without claiming an Apex service visit. Original PNGs and processing manifest are retained. The Word file contained no images; no missing asset blocks implementation.

See [asset manifest](../output/blog-assets/manifest.json) and `scripts/prepare-blog-images.cjs` for mappings.

## 6. Files

New production/data files:

```text
src/app/(marketing)/blog/page.tsx
src/app/(marketing)/blog/[slug]/page.tsx
src/app/(marketing)/blog/category/[category]/page.tsx
src/components/resources/resource-search.tsx
src/components/service-areas/zip-coverage-checker.tsx
src/content/resources/client-articles-source.json
src/content/resources/client-articles.ts
src/content/resources/planned-drafts.ts
src/content/service-coverage-data.json
src/content/service-coverage.ts
public/resources/client-articles/furnace.webp
public/resources/client-articles/refrigerator.webp
public/resources/client-articles/laundry.webp
public/resources/client-articles/dishwasher.webp
public/resources/client-articles/oven.webp
public/resources/client-articles/ice-maker.webp
public/resources/client-articles/commercial-refrigeration.webp
public/resources/client-articles/walk-in.webp
public/resources/client-articles/commercial-ice.webp
public/resources/client-articles/commercial-oven.webp
```

Updated integration files:

```text
next.config.ts
src/types/resource.ts
src/content/resources/articles.ts
src/content/resources/categories.ts
src/content/resources/index.ts
src/content/resources/sources.ts
src/lib/resource-seo.ts
src/components/resources/resource-article.tsx
src/components/resources/resource-content.tsx
src/components/resources/resource-cta.tsx
src/components/resources/resource-listing.tsx
src/components/resources/resource-navigation.tsx
src/app/(marketing)/resources/page.tsx
src/app/(marketing)/resources/[slug]/page.tsx
src/app/(marketing)/resources/category/[category]/page.tsx
src/app/(marketing)/service-areas/page.tsx
src/app/(marketing)/about/page.tsx
src/app/(marketing)/services/page.tsx
src/app/globals.css
src/components/home/service-area-explorer.tsx
src/components/layout/footer.tsx
src/content/company.ts
src/content/navigation.ts
src/content/site.ts
```

Existing `src/app/sitemap.ts`, `organization-structured-data.tsx`, `src/content/organization.ts`, `author.ts`, `resource-author.tsx`, `resource-card.tsx` and `resource-image.tsx` remain shared infrastructure from earlier uncommitted Resources work. They are reused. The working tree includes that earlier phase; Git's untracked status alone does not distinguish the new import from existing work.

New scripts/tests/docs:

```text
scripts/extract-client-articles.ps1
scripts/extract-zip-coverage.ps1
scripts/prepare-blog-images.cjs
tests/client-blog.test.cjs
tests/service-coverage.test.cjs
tests/blog-browser.cjs
docs/BLOG_IMPLEMENTATION_REPORT.md
docs/SERVICE_COVERAGE.md
```

Updated tests/docs:

```text
tests/load-ts.cjs
tests/resource-fixture.cjs
tests/resources.test.cjs
tests/resources-render.test.cjs
tests/article-1.test.cjs
tests/audit-seo.test.cjs
docs/RESOURCES.md
docs/RESOURCES_IMPLEMENTATION_REPORT.md
docs/ARCHITECTURE.md
docs/DESIGN_SYSTEM.md
```

Generated evidence: `output/blog-source/` (source XML, transcript, extraction validation and publication manifest), `output/blog-assets/` (six original PNGs and manifest), `output/blog-qa/` (browser reports, routing evidence, test output and screenshots). Existing historical Article 1 assets/reports remain. No uploaded source, environment file, dependency manifest, database configuration or booking backend was changed.

## 7. Validation

| Check | Result |
| --- | --- |
| `npm.cmd run lint` | PASS, exit 0 |
| `npm.cmd run typecheck` | PASS, exit 0 |
| `npm.cmd run build` | PASS, 62 pages generated, exit 0 |
| `node --test tests/*.test.cjs` | PASS, 115 tests, 0 failed/skipped |
| Source extraction/completeness | PASS, original paragraph/run/table comparisons and 13 adapter outputs |
| Exact coverage | PASS, exhaustive 721 lookups plus leading-zero, invalid, unsupported, MA/RI cases |
| Migration | PASS, 20 expected 308 redirects and 12 draft/unknown 404 responses |
| Stale coverage copy | PASS, About/Services do not advertise five states or MA/RI |
| Article browser content/SEO | PASS, all 13 articles at 320/390/768/1440 px; 27 raw HTML/SEO/sitemap checks |
| Internal links | PASS, 48 GET destinations in the broad run; 47 in the focused run |
| Category/filter/booking | PASS, 48 category/viewport states plus four filter and four booking-dialog suites |
| ZIP responsive browser checks | PASS, homepage and Service Areas at four widths (8 suites) |
| Accessibility/layout | PASS, 63 broad and 20 focused audits, no axe violations or horizontal page overflow |
| Final focused browser run | PASS, 0 failures and 0 warnings |

Evidence: [unit-tests.txt](../output/blog-qa/unit-tests.txt), [routing-verification.json](../output/blog-qa/routing-verification.json), [broad browser report](../output/blog-qa/verification.json), [final focused report](../output/blog-qa/verification-focused.json), [file inventory](../output/blog-qa/file-inventory.json).

Two old audit expectations were deliberately migrated: 29 counties became the approved 18/three states, and the blanket prohibition of sitemap dates now allows exactly 13 authored article dates. The final broad report retains one homepage-320 image-wait timeout from the earlier QA scrolling helper; all article checks, ZIP interactions and other layouts passed. The corrected helper uses explicit instant scrolling and excludes intentionally offscreen lazy carousel images while still requiring visible image pixels. The final focused run retested the homepage and Service Areas at all four widths and resolved that timeout with zero failures/warnings. Reports are preserved rather than erasing the initial failure. The real one-article category empty-state bug was also fixed and verified across all 48 category/viewport combinations.

Desktop and mobile screenshots were visually inspected for the Blog, furnace article, Heating category and ZIP checker. Browser QA uses local Chrome, blocks external and non-GET requests, and never submits the booking form. No Lighthouse/Core Web Vitals or Google-hosted schema-tool score is claimed.

## 8. Remaining issues and manual configuration

1. **Production origin/date:** confirm `NEXT_PUBLIC_SITE_URL` in the real hosting project and use the actual first publication date if release occurs after November 28. Hosting configuration was not inspected or changed.
2. **Reviews connection:** build succeeded but logged `reviews_fetch_failed: TypeError: fetch failed` twice. Live review-provider connectivity is unverified in this environment; the existing fallback remains.
3. **Source editorial observations:** approved Word copy includes technician experience/certification claims and different gas-emergency instructions in furnace/oven articles. These were preserved as requested, not independently validated or silently rewritten. [Source notes](../output/blog-source/README.md) identify exact provenance and passages for any subsequent editorial review.
4. **Hosted integrations:** browser QA opens/closes booking without submitting customer requests. Delivery, CRM, analytics, phone connectivity, live robots/canonical responses, indexing and Google's hosted validation tools were not tested. Existing automated booking/Quo tests pass but do not prove hosted delivery.
5. **Catalog scope:** dedicated commercial service pages do not exist. No broken placeholder destinations were added; their future creation is separate work.
6. **Source re-extraction:** the original Word file was accessible during extraction but absent from its original path at final verification. Retained source XML/JSON evidence supports this implementation; the original upload is needed again only for fresh re-extraction or revision comparison.

## 9. Readiness

The local Blog/Resources and ZIP implementation is complete and passes local UI acceptance with original content, real assets, source fidelity and tested publication guards. It is ready for release review. Deployment is separate and unperformed; production origin/date configuration and a hosted smoke test remain necessary before claiming the live website is ready or published.

See [RESOURCES.md](RESOURCES.md) for maintenance/release steps. Historical draft reports do not describe the new approved article inventory.
