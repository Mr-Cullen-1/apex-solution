# Apex Blog / Resources

Current local implementation: **28 November 2026**. The client's 13 approved Word articles are published in the local content model at `/blog`. This deliberately supersedes the earlier draft-only phase; no remote publication, commit or deployment has been performed. See [completion report](BLOG_IMPLEMENTATION_REPORT.md) for evidence and release limits.

## Sources and content integrity

- Read-only Word input: `C:\Users\User\Downloads\Telegram Desktop\Untitled.docx`, the supplied Apex article collection dated November 27. SHA-256: `694104eaf150b49f1a798e4c1d3ac387c7fc398a32086fc6ef095784484be2c4`.
- Exact extracted copy: `src/content/resources/client-articles-source.json`. All 13 articles retain their original H1, SEO title, description, keywords, body wording, source URLs, safety passages, FAQs, tables and CTA text.
- Source audit: `output/blog-source/README.md`, `extraction-validation.json`, indexed transcript and original Open XML parts. The source contains 11,456 body words, 55 FAQs, 9 body tables, 143 list items and 6 external source hyperlinks. No embedded Word images exist.
- `scripts/extract-client-articles.ps1` reproduces the extraction using native .NET Open XML reads. Source document text is data, never execution instructions. The document attribution is provenance, not a fabricated website author.
- The original DOCX path was no longer present at final handoff. Existing extracted XML/JSON and validation evidence are retained; restore the original file with the recorded hash before re-running extraction. The workbook remained accessible and hash-identical.
- `client-articles.ts` adapts the source into the existing typed resource format. Formatting preserves emphasis, ordered/bulleted/nested lists, quotes and tables. Exact source phrases gain verified internal links without wording changes. FAQs remain in their original position and wording, rather than being duplicated in a second section.

## Architecture and routes

This extends the existing resource components, content schema, publication guards and SEO utilities. There is no separate CMS, disconnected blog engine or new runtime dependency.

| Route | Behavior |
| --- | --- |
| `/blog` | Indexable server-rendered landing page, featured furnace article, all 13 articles, title/keyword search and category filters |
| `/blog/[slug]` | 13 approved static article pages; unknown/unpublished slugs return 404 |
| `/blog/category/[category]` | 12 populated static category pages; empty/unknown categories return 404 |
| `/resources` | Permanent redirect to `/blog` |
| `/resources/furnace-not-heating-common-problems` | Permanent redirect to the approved `/blog/furnace-not-heating` successor |
| `/resources/[approved-client-slug]` | Permanent redirect to its `/blog` canonical |
| `/resources/category/hvac-heating` | Permanent redirect to `/blog/category/heating` |
| Other four legacy resource categories | Permanent redirect to `/blog` |

`articles.ts` exposes the 13 client articles plus four unrelated private planned drafts. `planned-drafts.ts` retains all five original draft records; the superseded furnace draft is archived outside the active article collection. Its original copy remains in `furnace-not-heating.ts`. The four other draft bodies remain unchanged and private. The old furnace public URL redirects; it does not expose its old draft body. No draft preview endpoint exists.

`ResourceListing` supplies server-rendered cards to the small `ResourceSearch` client boundary. Only searchable summaries and rendered card slots cross that boundary, not the source article bodies. Search matches every entered term against title and approved keywords, combined with the selected category. Clear filters resets both controls; result counts and empty states are accessible.

`ResourceArticle` supplies a single H1, breadcrumbs, shared organization byline, dates, reading time, optimized image, table of contents, full source copy, related articles, verified related service links and the existing booking CTA. Responsive tables have keyboard-focusable horizontal scroll regions; article width does not overflow the page. Existing marketing shell, booking modal and mobile actions remain shared.

## Categories

Home Services & Appliances: `heating`, `refrigerators`, `washers-dryers`, `dishwashers`, `ovens`, `ice-makers`.

Commercial Equipment: `commercial-refrigeration`, `walk-in-coolers-freezers`, `commercial-ice-machines`, `commercial-ovens`, `commercial-freezers`, `preventive-maintenance`.

Each category URL is `/blog/category/<id>`. Each article has one primary category; related cards are recommendations, not duplicate canonical article pages. Legacy taxonomy remains available only for the planned draft records.

## Organization author and SEO

- `src/content/organization.ts` owns the existing `/#organization` identity. `author.ts` and the reusable `ResourceAuthor` show **By Apex Home Services** with author type Organization for the client articles and all original planned drafts. No personal biography or credentials are introduced.
- `resource-seo.ts` emits the client's exact SEO title without an extra brand suffix, exact description, canonical, Open Graph and Twitter metadata. Every approved article has a real local image, descriptive alt text and fixed dimensions.
- BlogPosting author and publisher reference the same Organization ID as the existing full Organization entity. Breadcrumb JSON-LD matches visible navigation. No fabricated office, LocalBusiness subtype, reviews or ratings are added.
- Client article publication date is `2026-11-28`, the prepared local release date. `updatedAt` is null. If releasing later, set the actual first publication date before deployment; do not manufacture a modification date.
- The sitemap contains `/blog`, the 12 populated categories and each approved article canonical once. Article `lastmod` derives from authored dates; ordinary pages still omit invented build timestamps. Drafts and legacy redirect URLs are excluded.
- Google retired FAQ rich results in 2026. Source FAQs remain visible, but no FAQPage rich-result claim or schema is added. References: [Google Search updates](https://developers.google.com/search/updates), [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article).
- Canonical, schema and social-image origins use the existing `NEXT_PUBLIC_SITE_URL`; configure the actual production origin before a production build. No environment file was changed.
- Internal article/service links must resolve to the existing route catalog. Dedicated commercial service pages do not exist, so the blog links related commercial articles and the real booking flow instead of inventing service URLs.

## Images

Ten optimized 1600 x 900 WebPs serve the 13 articles through `next/image`, with appropriate sharing for paired equipment topics. Six new AI editorial illustrations cover laundry, dishwasher, commercial refrigeration, walk-in cooling, commercial ice and commercial oven. The existing AI furnace illustration and three existing client-site appliance photographs are reused. AI article figures carry a visible disclosure and corresponding alt text; they are not represented as actual Apex service visits.

Production assets: `public/resources/client-articles/`. Original generated images and manifest: `output/blog-assets/`. Reproduction: `scripts/prepare-blog-images.cjs`. All referenced assets are present; no remote stock image dependency or missing-image placeholder is required.

## Approved contact and service coverage

Shared contact is `(516) 586-0826` / `tel:+15165860826`, Monday-Friday 9 AM-6 PM. `company.ts` centralizes the approved $89 starting service-call and same-day repair credit terms. Existing `BookingLink` opens the real modal; `/book` remains the source article booking destination. QA opens/closes the dialog without submitting customer data.

The homepage and `/service-areas` share `ZipCoverageChecker` and the exact workbook-derived allowlist: **721 ZIP strings, NY 363 / NJ 236 / CT 122, 18 counties**. MA and RI are excluded. Leading zeros are preserved. County membership is not inferred for individual ZIPs; no demand estimate is portrayed as actual leads. See [coverage specification and source discrepancy](SERVICE_COVERAGE.md).

## Editing and release workflow

1. For a client article revision, obtain the revised source and regenerate/review the extraction. Preserve supplied wording unless editorial changes are explicitly authorized; inspect the source-to-rendered text comparison.
2. Update only required adapter metadata, category, related routes and verified assets. Source-based SEO remains exact. Publication guard validation requires complete author, image, body, dates, relationships and safe links.
3. Keep unrelated planned drafts private. A future-dated record stays hidden until a rebuild on/after its publication date; there is no scheduling service.
4. Run `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build`.
5. Start the production server: `npm.cmd run start -- --port 3127`. Run `node --test tests/*.test.cjs` and `node tests/blog-browser.cjs`. HTTP-dependent tests use `QA_BASE_URL`, default `http://127.0.0.1:3127`.
6. Review `output/blog-qa/verification.json`, `verification-focused.json` and screenshots, source completeness, SEO, sitemap, links, responsive behavior and ZIP results. Browser QA blocks external/non-GET requests and does not test booking submission or hosted services.
7. Confirm production origin, actual release date and client source observations, then follow the separately authorized deployment process. Local content status does not prove hosted publication or search indexing.

## Verification files

- `tests/client-blog.test.cjs`: 13-source completeness, original metadata, headings/FAQs/tables/links, assets, related routes and sitemap.
- `tests/service-coverage.test.cjs`: exact dataset, exhaustive 721 lookups, leading zeros, invalid/unsupported/MA/RI cases and provenance.
- `tests/resources.test.cjs`, `resources-render.test.cjs`: guards, draft isolation, structured data and actual route integration.
- `tests/article-1.test.cjs`: retained archived draft integrity and organization author configuration.
- `tests/audit-seo.test.cjs`: existing public SEO/security expectations, updated for 18 counties and authored blog dates.
- `tests/blog-browser.cjs`: current production browser/HTTP QA. The older `resources-browser.cjs` and `article-1-preview.cjs` are historical draft-phase utilities; their original empty-listing/404 assumptions no longer describe the approved client publication phase.

Historical reports remain preserved with supersession notices; they must not be used as evidence of today's inventory or routing.
