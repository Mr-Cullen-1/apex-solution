# Apex Home Services — On-Page SEO Audit

**Website:** https://apexhomesupport.com/  
**Audit date:** 13 November 2026 (Asia/Tashkent)  
**Mode:** Audit only. No website source, content, metadata, configuration, schemas or deployment changed.

Evidence: [production crawl](docs/audits/on-page-seo-2026-11-13/pages.json), [HTML captures](https://github.com/Mr-Cullen-1/apex-solution/tree/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html), [link checks](docs/audits/on-page-seo-2026-11-13/links.json), [image checks](docs/audits/on-page-seo-2026-11-13/images.json), [production CSS](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/production.css). Temporary publicly embedded review-media tokens are redacted in archived HTML/JSON; downloaded images preserve the observed evidence.

## Executive summary

The site has a usable crawlable on-page foundation, but service depth and credibility consistency need work before it can be considered fully ready for competitive local search. All 19 audited pages returned HTTP 200, have unique nonempty titles and descriptions, self-referencing canonicals, `index, follow`, one H1, and complete Open Graph and Twitter-card tag sets. The main weaknesses are contradictory booking copy, service placeholders, generic service detail content and inconsistent description of Apex's role as a coordinator versus a direct provider.

**30 grouped issues/opportunities: 0 Critical, 4 High, 17 Medium, 9 Low.** Each ID is counted once even when it affects multiple URLs. All statuses are Pending. Medium/Low includes explicitly identified editorial enhancements and source-derived usability concerns; this is not a claim of 30 technical errors or measured ranking losses.

Strongest foundations: **/service-areas** (county inventory and scope limitations), **/brands** (organized compatibility directory and authorization disclaimer), and **/services/cooling** (service taxonomy and useful paths). Cooling still inherits shared content/schema issues. **/contact, /services/appliance-repair, /services/water-heater-repair, /about and the eight detail pages** require the most attention. The homepage and review archive also need trust, image-context and discovery improvements.

## Scope, baseline and limitations

The requested completed Technical SEO Audit was **not available** in the current project files, audit/SEO filename searches, documentation text searches or relevant commit-history search. Its 19-URL list and previous conclusions could not be verified or used as the baseline. Its location was requested during this audit. This report reconstructs a **provisional inventory of 18 current production sitemap URLs plus indexable /reviews**; it does not claim these are proven identical to the previous audit's 19 URLs. Reconcile them when that report is supplied.

The scope is 19 indexable marketing URLs, not every publicly reachable endpoint. `/review` (noindex submission page) and `/?book=1` were fetched only as linked auxiliary targets. `/book` is a source-verified redirect into the booking modal. Token review/invitation routes, admin routes, API endpoints and assets are not marketing landing pages. No private CRM records or credentials were accessed. No forms, calls, texts or chat requests were submitted.

Production HTTP retrieval captured actual server-rendered HTML, metadata, headings, anchors, image markup and JSON-LD. **Client-hydrated DOM and desktop/mobile visual inspection were not completed:** browser-tab access was unavailable, and native Computer Use ended because it could not determine the current browser URL confidently enough to enforce its policy. No further UI actions were made. This report therefore does not certify mobile layout, modal behavior, viewport image selection or browser accessibility. Three downloaded image assets were visually inspected independently of page layout.

No Search Console, analytics, rankings, search-volume data, Google Rich Results Test, Schema Markup Validator, Googlebot rendering, Google Business Profile or business records were available. Keywords and intent are editorial assignments derived from the site, not measured demand. Cannibalization is a risk assessment, not proof of alternating ranking URLs. JSON syntax and property consistency were checked locally; eligibility was reviewed against current primary documentation, not an external validator result. No performance audit was repeated.

## Architecture and methodology

Source inspected at initial commit `6f9660d`: Next.js 16.3.4 App Router, React 19.2.8, strict TypeScript and Tailwind 4. Root layout supplies metadata defaults and the brand suffix; `(marketing)` supplies header, footer, mobile actions, booking and chat. File-backed service data drives four category and eight detail routes through shared templates. Company, media, brand and coverage data live in `src/content`. Public reviews come through a server repository and were observed in production HTML. Admin/API implementation details were outside this on-page scope.

The installed Next.js metadata guide was read before audit scripting. Inherited Twitter metadata was verified in production output. Some architecture documentation describes older phases and was not treated as evidence of current behavior; actual source and production output take precedence.

Method: inspect architecture and route catalog; retrieve sitemap and all pages; structurally parse HTML, excluding React transport scripts; inspect headings, image attributes and anchors; read main content alongside source templates; compare exact metadata; construct inbound links by distinct source page; parse all JSON-LD; GET newly discovered public targets and distinct captured image responses; inspect relevant source/CSS for mobile concerns. Recommendations were checked against current primary documentation.

Main word counts are whitespace counts including CTAs, lists, closed FAQ answers and CSS-hidden responsive variants, excluding shared header/footer. They are not visible-screen word counts or quality thresholds. Inbound counts include server-rendered menu/footer links and exclude self-links. They do not represent PageRank, backlinks or link visibility at every breakpoint.

## All 19 audited URLs

| # | URL | Type | HTTP | Main words | Inbound / contextual sources |
|---|---|---|---|---|---|
| 1 | [/](https://apexhomesupport.com/) | Homepage | 200 | 764 | 18 / 1 |
| 2 | [/about](https://apexhomesupport.com/about) | Company | 200 | 304 | 18 / 0 |
| 3 | [/brands](https://apexhomesupport.com/brands) | Brand directory | 200 | 202 | 4 / 4 |
| 4 | [/contact](https://apexhomesupport.com/contact) | Contact | 200 | 145 | 18 / 3 |
| 5 | [/service-areas](https://apexhomesupport.com/service-areas) | Coverage directory | 200 | 334 | 18 / 14 |
| 6 | [/services](https://apexhomesupport.com/services) | Service hub | 200 | 441 | 1 / 1 |
| 7 | [/services/appliance-repair](https://apexhomesupport.com/services/appliance-repair) | Service category | 200 | 460 | 18 / 4 |
| 8 | [/services/cooling](https://apexhomesupport.com/services/cooling) | Service category | 200 | 443 | 18 / 8 |
| 9 | [/services/heating](https://apexhomesupport.com/services/heating) | Service category | 200 | 415 | 18 / 8 |
| 10 | [/services/water-heater-repair](https://apexhomesupport.com/services/water-heater-repair) | Service category | 200 | 380 | 18 / 3 |
| 11 | [/services/cooling/ac-repair](https://apexhomesupport.com/services/cooling/ac-repair) | Service detail | 200 | 411 | 18 / 4 |
| 12 | [/services/cooling/ac-installation](https://apexhomesupport.com/services/cooling/ac-installation) | Service detail | 200 | 409 | 18 / 4 |
| 13 | [/services/cooling/ac-maintenance](https://apexhomesupport.com/services/cooling/ac-maintenance) | Service detail | 200 | 423 | 18 / 5 |
| 14 | [/services/cooling/ac-replacement](https://apexhomesupport.com/services/cooling/ac-replacement) | Service detail | 200 | 408 | 18 / 4 |
| 15 | [/services/heating/furnace-repair](https://apexhomesupport.com/services/heating/furnace-repair) | Service detail | 200 | 402 | 18 / 5 |
| 16 | [/services/heating/heat-pumps](https://apexhomesupport.com/services/heating/heat-pumps) | Service detail | 200 | 396 | 18 / 5 |
| 17 | [/services/heating/heating-maintenance](https://apexhomesupport.com/services/heating/heating-maintenance) | Service detail | 200 | 414 | 18 / 7 |
| 18 | [/services/heating/boiler-repair](https://apexhomesupport.com/services/heating/boiler-repair) | Service detail | 200 | 418 | 18 / 1 |
| 19 | [/reviews](https://apexhomesupport.com/reviews) | Review archive | 200 | 63 | 1 / 1 |

## Findings by audit category

### Metadata and URL structure

All 19 titles and descriptions exist and are unique across URLs. Titles range from 34–63 characters; descriptions from 84–160. Counts are diagnostic context: Google does not set fixed character limits and may truncate or rewrite display text. The homepage's 63-character title is flagged for repeated branding, not solely for length. See [title guidance](https://developers.google.com/search/docs/appearance/title-link) and [snippet guidance](https://developers.google.com/search/docs/appearance/snippet).

All canonicals point to the matching production HTTPS path. The homepage canonical omits the terminal slash, which is equivalent to the root URL and is not flagged. Every page has `index, follow`; no `X-Robots-Tag` restriction appeared in captured headers. URLs are lowercase, readable and hyphenated, with coherent service hierarchy. No wrong-domain canonical, missing title/description or cross-page title/description duplication was found.

Open Graph title, description, URL and image exist on all pages; subpage OG content is route-specific. Shared brand artwork is not an error. Twitter card/title/description/image also exist, but all 18 subpages inherit the homepage title/description. Social image responses succeeded at 1200×630 PNG; platform share-card rendering was not tested. Many descriptions have browse/explore/learn/request verbs. A harder booking CTA is an editorial option, not a universal requirement. No keyword stuffing was detected. See OP-01–03 and OP-30.

### Headings and search intent

Each URL has exactly one nonempty H1. No empty headings or downward jumps of more than one level were found in the captured sequence. Footer H2 groups are navigation headings, not duplicate primary headings. The homepage has two New York H3 nodes because desktop and mobile coverage variants coexist in HTML; source uses mutually exclusive responsive classes. This is not treated as stuffing or a visible duplicate-heading defect.

The main issue is specificity: several H1s are slogans and service H2s repeat generic process headings. Category/detail H1s generally align with their services. Service FAQs use native `details/summary`; questions need not be forced into H3 solely for SEO. The page appendix records every main heading and keyword/intent assessment. See OP-04–05.

Potential overlaps: homepage versus service hub (broad home services); category versus detail pages (normal parent-child overlap); installation versus replacement (greater intent-overlap risk); furnace versus boiler (similar template prose but distinct equipment intent). Preserve the hub-to-detail model. OP-09 is the explicit cannibalization risk; do not consolidate URLs without query-level evidence. Appliance-specific terms exist in the footer but are underdeveloped in the appliance page's main content. Boiler repair exists but is absent from the heating summary/description. Heat-pump service and equipment planning need clearer explanation. No unsupported service/location expansion is proposed.

### Content, local relevance and trust

The visible footprint is 29 counties across NY, NJ, CT, MA and RI, with ZIP confirmation. Shared state references help establish context but provide little page-specific local detail. No office, address, license number, service history or equipment capability was inferred. A review mentioning Queens does not add Queens to the confirmed coverage list. Source comments describe trust/price/offer claims as client-approved; this audit did not independently substantiate those claims.

The county directory is the strongest local content. Existing service pages need concrete approved scope and project evidence. Contact contradicts itself. About explains independent providers, while first-person diagnosis and schema provider wording create ambiguity. Homepage results language, dryer-work labeling and offer shorthand need correction. Reviews have a duplicate-image/context concern. Unknown email/address/hours must remain unknown until supplied, with an appropriate visible explanation where useful. See OP-06–16.

### Image SEO

Across the 19 pages: **72 img elements, zero missing ALT attributes, 19 empty ALT values** on the decorative footer logo, and **four generic review-photo ALT occurrences**. Empty footer ALT is appropriate because its link has an accessible name and adjacent company text. Do not add keywords to it. Most informative photos have descriptive ALT and meaningful filenames.

All **24 distinct captured image/social response URLs returned 200**: 21 underlying content/logo/review sources plus three social-image URL variants. Next image optimization returned WebP for the 21 sources with the tested Accept header; social images returned PNG. Decoded dimensions are in the appendix. Photos use `srcset`/`sizes`; heroes are eager/preloaded while most secondary/result images are lazy. Logos have width/height. `fill` photos omit HTML dimensions but have positioned containers with min-height, fixed-height or aspect-ratio layout; this alone is not a missing-dimension defect.

Requests used captured `src` fallbacks, often `w=3840`. This does not prove mobile browsers download that size when `srcset` is supported. Transfer size is not used to claim a performance failure. The furnace/boiler hero mismatch was visually confirmed, as were duplicate review-photo bytes and visual subject. Temporary signed review URLs worked at audit time but do not guarantee long-lived image indexing. Do not make private storage public merely for SEO. See OP-15 and OP-25–27. [Google image guidance](https://developers.google.com/search/docs/appearance/google-images) supports useful context, descriptive names and factual ALT.

### Internal linking

All **21 unique linked public HTTP targets returned 200** (19 audited pages, `/review`, `/?book=1`). All **37 fragment-link occurrences** matched an ID in captured target HTML. This is no observed broken target within the bounded crawl, not an exhaustive token/parameter-route scan.

No audited page is orphaned in this graph. Shared category/detail links are strong, but `/services` and `/reviews` each have one inbound source. Boiler has one contextual source despite global links. Service brand lists lack a directory link. Most anchors are descriptive service labels or full cards. Book Now buttons open a modal; they are conversion controls, not missing SEO links. The service menu's missing actual hub link is a specific discovery issue. The review sitemap omission is counted once as a discovery dependency, without repeating a full technical audit. See OP-17–20.

### Structured data

All **13 JSON-LD blocks parse successfully**: one Organization on About and 12 Service objects on category/detail pages. Each uses `https://schema.org`, a type, name, description and absolute URL; Service objects also have serviceType, provider and areaServed. No malformed JSON, fabricated aggregate rating or irrelevant FAQ markup was observed. Schema.org does not impose universal required fields on every Service object; lack of a dedicated Google Service rich result does not make the markup invalid.

| Type | Observed state | Assessment |
|---|---|---|
| Organization | About only | Parseable; role, identity connections and county scope need attention |
| Service | 12 category/detail pages | Parseable and page-relevant; provider role and geographic precision need attention |
| WebSite | Absent | Homepage site-name/entity enhancement opportunity |
| LocalBusiness/subtype | Absent | Conditional only: actual business model/address unverified |
| BreadcrumbList | Absent | Hierarchy enhancement opportunity on service routes |
| FAQPage | Absent | Not a defect; no current Google FAQ rich-result opportunity |

Google's LocalBusiness feature requires name and address; `contact.address` is null and Apex describes independent-provider coordination. Do not invent an address or choose HVACBusiness simply from service keywords. Use truthful Organization/Service markup while eligibility is resolved. See [LocalBusiness requirements](https://developers.google.com/search/docs/appearance/structured-data/local-business).

Google's current changelog says FAQ rich results stopped appearing from **7 May 2026**, and the feature documentation was removed. Older government/health-only eligibility advice is no longer current. Do not recommend FAQPage for a Google rich-result gain; useful visible FAQs still help users. See [Google documentation updates](https://developers.google.com/search/updates). WebSite can support site-name understanding, without guaranteeing appearance or rankings ([site-name guidance](https://developers.google.com/search/docs/appearance/site-names)). See OP-10 and OP-21–24.

### Mobile, usability and accessibility

Source/HTML show responsive layouts, viewport metadata, main/header/footer/nav landmarks, a skip link with a real target, labeled controls, call/booking actions, mobile bottom actions with safe-area padding, footer clearance, a chat-launcher offset, native FAQ disclosures, focus-handling code and reduced-motion rules. Type uses responsive sizing. These are source observations, not browser interaction passes.

Two actionable concerns are small hero-selector targets and low-contrast global focus outlines on dark panels. A 6px dot with 6px spacing is difficult to target; enlarge its hit area without enlarging the visual dot. The focus ratio calculated from production colors is **1.419:1**. W3C explains [24px minimum target size and exceptions](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) and [3:1 non-text/state contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). These concern access to content, not a claimed direct ranking penalty. See OP-28–29.

Visual clearance, overflow at 320/375/390px, 200% text zoom, keyboard traversal, focus restoration, touch scrolling, intrusive-overlay behavior and actual CTA visibility remain unverified. Initial HTML/source did not establish an automatic interstitial, but this is not a rendered-behavior pass. A follow-up browser review should cover all templates and interactive states without submitting real requests.

## Verified site-stated geography

These are statements verified as present on the site, not independently validated business facts. Confirm continued accuracy with the owner. Identical county names in different states are not duplicates to remove.

| State | Listed counties |
|---|---|
| New York | Kings, Bronx, Nassau, Suffolk, Westchester, Rockland |
| New Jersey | Middlesex, Monmouth, Ocean, Union, Essex, Morris, Passaic, Bergen, Somerset |
| Connecticut | Fairfield, New Haven, Litchfield |
| Massachusetts | Suffolk, Middlesex, Worcester, Norfolk, Plymouth, Bristol |
| Rhode Island | Providence, Kent, Bristol, Newport, Washington |

## Readiness and top 10 actions

**Usable technical on-page foundation; substantial editorial work remains.** No critical on-page crawl blocker was found in this inventory. Preserve the multi-page architecture. The main corrections fit existing routes without creating new services, location pages or integrations.

1. Reconcile Contact's contradictory online-booking statements (OP-06).
2. Replace appliance/water-heater placeholders with verified service scope (OP-07).
3. Deepen eight service pages and differentiate installation/replacement (OP-08–09).
4. Resolve coordinator-versus-provider wording and schema (OP-10).
5. Confirm hours/response claims and correct stale or imprecise homepage copy (OP-11–14).
6. Verify review-photo associations and service labels; explain review context (OP-15–16).
7. Correct inherited Twitter data and repeated branding; clarify metadata/headings (OP-01–05, OP-30).
8. Improve hub/review/boiler/brand discovery and review sitemap inclusion (OP-17–20).
9. Align entities and county coverage with verified facts; consider homepage identity and breadcrumbs (OP-21–24).
10. Improve equipment imagery, ALT and mobile target/focus usability (OP-25–29).

## Validation and handoff

Project-required checks passed: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build`. Initial `npm` calls hit PowerShell script policy; using installed `npm.cmd` avoided changing policy. The first sandboxed build compiled but its TypeScript worker failed with `spawn EPERM`; the same build succeeded with approved elevated execution. These checks establish local compilation, not production booking, browser layout, indexing or ranking.

The four requested deliverables are at the project root. Supporting evidence is under `docs/audits/on-page-seo-2026-11-13/`. Counts and CSV fields are validated separately. Missing technical-baseline reconciliation and incomplete browser/mobile coverage remain explicit limitations; those portions of the original requested scope need a follow-up.



## Detailed issue register

Same 30 IDs as ON_PAGE_SEO_ISSUES.csv. Multiple affected URLs use semicolons in the CSV. Every proposal remains Pending. Source paths are project-relative; production evidence is the matching URL record in pages.json and its referenced HTML file.

### OP-01 ? Brand repeated within the page title (Low)

**Category:** Metadata. **Status:** Pending.

**Affected URLs:** [/](https://apexhomesupport.com/), [/about](https://apexhomesupport.com/about), [/contact](https://apexhomesupport.com/contact).

**Evidence:** Live titles: homepage = Apex Home Services | Premium Home Services | Apex Home Services (63 characters); About = About Apex Home Services | Apex Home Services (45); Contact = Contact Apex Home Services | Apex Home Services (47). Root title template appends the brand to already branded page titles. src/app/layout.tsx:18; src/app/(marketing)/page.tsx:14.

**Recommended correction:** Use one brand occurrence per title; preserve route intent. Recheck actual emitted titles after an authorized change.

### OP-02 ? All 18 subpages inherit homepage Twitter title and description (Medium)

**Category:** Metadata. **Status:** Pending.

**Affected URLs:** [/about](https://apexhomesupport.com/about), [/brands](https://apexhomesupport.com/brands), [/contact](https://apexhomesupport.com/contact), [/service-areas](https://apexhomesupport.com/service-areas), [/services](https://apexhomesupport.com/services), [/services/appliance-repair](https://apexhomesupport.com/services/appliance-repair), [/services/cooling](https://apexhomesupport.com/services/cooling), [/services/heating](https://apexhomesupport.com/services/heating), [/services/water-heater-repair](https://apexhomesupport.com/services/water-heater-repair), [/services/cooling/ac-repair](https://apexhomesupport.com/services/cooling/ac-repair), [/services/cooling/ac-installation](https://apexhomesupport.com/services/cooling/ac-installation), [/services/cooling/ac-maintenance](https://apexhomesupport.com/services/cooling/ac-maintenance), [/services/cooling/ac-replacement](https://apexhomesupport.com/services/cooling/ac-replacement), [/services/heating/furnace-repair](https://apexhomesupport.com/services/heating/furnace-repair), [/services/heating/heat-pumps](https://apexhomesupport.com/services/heating/heat-pumps), [/services/heating/heating-maintenance](https://apexhomesupport.com/services/heating/heating-maintenance), [/services/heating/boiler-repair](https://apexhomesupport.com/services/heating/boiler-repair), [/reviews](https://apexhomesupport.com/reviews).

**Evidence:** Every subpage emits twitter:title = Apex Home Services | Premium Home Services and twitter:description = Reliable heating, cooling, appliance, and water-heater service from local Northeast professionals. Open Graph is route-specific. src/app/layout.tsx:29-32; pages.json meta fields.

**Recommended correction:** Give subpages route-specific Twitter title/description, or use a verified fallback that derives from each route. Keep the working image and large-image card.

### OP-03 ? Commercial metadata underuses the stated service area and useful service detail (Medium)

**Category:** Metadata. **Status:** Pending.

**Affected URLs:** [/](https://apexhomesupport.com/), [/services](https://apexhomesupport.com/services), [/services/appliance-repair](https://apexhomesupport.com/services/appliance-repair), [/services/cooling](https://apexhomesupport.com/services/cooling), [/services/heating](https://apexhomesupport.com/services/heating), [/services/water-heater-repair](https://apexhomesupport.com/services/water-heater-repair), [/services/cooling/ac-repair](https://apexhomesupport.com/services/cooling/ac-repair), [/services/cooling/ac-installation](https://apexhomesupport.com/services/cooling/ac-installation), [/services/cooling/ac-maintenance](https://apexhomesupport.com/services/cooling/ac-maintenance), [/services/cooling/ac-replacement](https://apexhomesupport.com/services/cooling/ac-replacement), [/services/heating/furnace-repair](https://apexhomesupport.com/services/heating/furnace-repair), [/services/heating/heat-pumps](https://apexhomesupport.com/services/heating/heat-pumps), [/services/heating/heating-maintenance](https://apexhomesupport.com/services/heating/heating-maintenance), [/services/heating/boiler-repair](https://apexhomesupport.com/services/heating/boiler-repair).

**Evidence:** Service titles identify services but no commercial title names the stated region; homepage title uses Premium Home Services. Cooling description is 94 characters, heating 91, heat pumps 91; these describe browsing rather than concrete service scope or location. No character-count violation is alleged.

**Recommended correction:** Prioritize accurate service intent and a natural, owner-confirmed region qualifier; make descriptions explain useful scope and a next step. Do not imply statewide coverage or insert all 29 counties into titles.

### OP-04 ? Several H1s favor slogans or broad labels over page purpose (Medium)

**Category:** Headings. **Status:** Pending.

**Affected URLs:** [/](https://apexhomesupport.com/), [/about](https://apexhomesupport.com/about), [/brands](https://apexhomesupport.com/brands), [/contact](https://apexhomesupport.com/contact), [/service-areas](https://apexhomesupport.com/service-areas), [/services](https://apexhomesupport.com/services), [/services/cooling](https://apexhomesupport.com/services/cooling), [/services/heating](https://apexhomesupport.com/services/heating).

**Evidence:** Examples: /brands H1 Familiar equipment. Thoughtful service.; /contact Start with the right path forward.; /services The right care for the systems behind your home.; category H1s Cooling and Heating. The adjacent copy supplies context, and every page has exactly one H1.

**Recommended correction:** Use a clear primary heading identifying each page purpose or service; retain editorial slogans as supporting copy. This is relevance and scanning improvement, not a missing-H1 or multiple-H1 defect.

### OP-05 ? Shared H2s contribute little service-specific context (Low)

**Category:** Headings. **Status:** Pending.

**Affected URLs:** [/services/appliance-repair](https://apexhomesupport.com/services/appliance-repair), [/services/cooling](https://apexhomesupport.com/services/cooling), [/services/heating](https://apexhomesupport.com/services/heating), [/services/water-heater-repair](https://apexhomesupport.com/services/water-heater-repair), [/services/cooling/ac-repair](https://apexhomesupport.com/services/cooling/ac-repair), [/services/cooling/ac-installation](https://apexhomesupport.com/services/cooling/ac-installation), [/services/cooling/ac-maintenance](https://apexhomesupport.com/services/cooling/ac-maintenance), [/services/cooling/ac-replacement](https://apexhomesupport.com/services/cooling/ac-replacement), [/services/heating/furnace-repair](https://apexhomesupport.com/services/heating/furnace-repair), [/services/heating/heat-pumps](https://apexhomesupport.com/services/heating/heat-pumps), [/services/heating/heating-maintenance](https://apexhomesupport.com/services/heating/heating-maintenance), [/services/heating/boiler-repair](https://apexhomesupport.com/services/heating/boiler-repair).

**Evidence:** All eight detail pages use Start with the full picture., Clarity at every step., Keep exploring., Broad equipment familiarity., and Useful context before you book. Category pages reuse most of the same headings. src/components/services/service-detail-page.tsx:20 and service-sections.tsx.

**Recommended correction:** Use meaningful service-specific overview and FAQ section headings where content supports them; keep useful reusable process headings. Avoid mechanically repeating keywords in every heading.

### OP-06 ? Contact page contradicts itself about online requests (High)

**Category:** Content quality. **Status:** Pending.

**Affected URLs:** [/contact](https://apexhomesupport.com/contact).

**Evidence:** Live hero says Book Now takes a minute and our team will follow up to confirm details. Final CTA says Online submission is not yet connected, so the flow will not claim Apex received the request. Both appear in the same main element. src/app/(marketing)/contact/page.tsx.

**Recommended correction:** Verify the production request workflow with the owner, then reconcile both statements to its actual behavior. Do not claim delivery was tested in this audit; no form was submitted.

### OP-07 ? Primary service pages still contain planning placeholders (High)

**Category:** Content quality. **Status:** Pending.

**Affected URLs:** [/services/appliance-repair](https://apexhomesupport.com/services/appliance-repair), [/services/water-heater-repair](https://apexhomesupport.com/services/water-heater-repair).

**Evidence:** Both pages show: This category is available as a direct service conversation. More specific service pages will be added only when the offering is confirmed. Appliance main content does not explain the nine residential and four commercial equipment groups already listed in the footer/source. src/components/services/service-sections.tsx:69; src/content/appliance-repair.ts.

**Recommended correction:** Replace planning language with confirmed service scope on the existing pages. Describe supplied appliance equipment types, relevant symptoms, process and limits; verify water-heater equipment coverage before naming types. New routes are unnecessary.

### OP-08 ? Service detail pages rely heavily on generic shared copy (High)

**Category:** Content quality. **Status:** Pending.

**Affected URLs:** [/services/cooling/ac-repair](https://apexhomesupport.com/services/cooling/ac-repair), [/services/cooling/ac-installation](https://apexhomesupport.com/services/cooling/ac-installation), [/services/cooling/ac-maintenance](https://apexhomesupport.com/services/cooling/ac-maintenance), [/services/cooling/ac-replacement](https://apexhomesupport.com/services/cooling/ac-replacement), [/services/heating/furnace-repair](https://apexhomesupport.com/services/heating/furnace-repair), [/services/heating/heat-pumps](https://apexhomesupport.com/services/heating/heat-pumps), [/services/heating/heating-maintenance](https://apexhomesupport.com/services/heating/heating-maintenance), [/services/heating/boiler-repair](https://apexhomesupport.com/services/heating/boiler-repair).

**Evidence:** Eight main sections contain 396-423 whitespace-delimited words, including brands, related services, five-state boilerplate and the same five-step process. Each service overview adds two short generic paragraphs. AC maintenance says a visit can focus on observable system condition without an actual approved maintenance scope. Furnace and boiler descriptions closely mirror each other. src/content/services.ts; service-detail-page.tsx.

**Recommended correction:** Have a qualified service stakeholder supply distinct inspection scope, included/excluded work, customer preparation, decision factors and service-specific FAQs for each existing page. Use approved examples and photos; avoid invented prices, credentials, equipment support or guarantees. Word count is context, not a target.

### OP-09 ? Installation and replacement have overlapping intent and insufficient differentiation (Medium)

**Category:** Keywords and intent. **Status:** Pending.

**Affected URLs:** [/services/cooling/ac-installation](https://apexhomesupport.com/services/cooling/ac-installation), [/services/cooling/ac-replacement](https://apexhomesupport.com/services/cooling/ac-replacement).

**Evidence:** Installation summary discusses a new cooling system and existing equipment; replacement discusses current system and available equipment. Both use the same image, process, brands and region blocks, and link to each other. Their summaries differ, so these are not identical pages.

**Recommended correction:** Differentiate new-system planning from replacing existing equipment with confirmed deliverables and decision information. Use Search Console query-to-page data before considering consolidation. Cannibalization is a content-based risk, not a proven ranking problem.

### OP-10 ? Provider identity is ambiguous between coordination and direct service (High)

**Category:** Content and schema consistency. **Status:** Pending.

**Affected URLs:** [/about](https://apexhomesupport.com/about), [/services/appliance-repair](https://apexhomesupport.com/services/appliance-repair), [/services/cooling](https://apexhomesupport.com/services/cooling), [/services/heating](https://apexhomesupport.com/services/heating), [/services/water-heater-repair](https://apexhomesupport.com/services/water-heater-repair), [/services/cooling/ac-repair](https://apexhomesupport.com/services/cooling/ac-repair), [/services/cooling/ac-installation](https://apexhomesupport.com/services/cooling/ac-installation), [/services/cooling/ac-maintenance](https://apexhomesupport.com/services/cooling/ac-maintenance), [/services/cooling/ac-replacement](https://apexhomesupport.com/services/cooling/ac-replacement), [/services/heating/furnace-repair](https://apexhomesupport.com/services/heating/furnace-repair), [/services/heating/heat-pumps](https://apexhomesupport.com/services/heating/heat-pumps), [/services/heating/heating-maintenance](https://apexhomesupport.com/services/heating/heating-maintenance), [/services/heating/boiler-repair](https://apexhomesupport.com/services/heating/boiler-repair).

**Evidence:** About explicitly says services are performed by independent service providers, yet the same page states We diagnose before we recommend. All 12 Service schemas name Apex Home Services as provider. src/content/homepage.ts:2; src/components/services/service-structured-data.tsx:12; about mainText.

**Recommended correction:** Confirm Apex?s actual role and align About, service copy and provider/broker relationships in schema. Keep claims about independent technicians and responsibility consistent. This audit does not determine the legal business model.

### OP-11 ? Static Live Now promise lacks visible hours; contact hours are unset (Medium)

**Category:** Trust and contact information. **Status:** Pending.

**Affected URLs:** [/](https://apexhomesupport.com/), [/about](https://apexhomesupport.com/about), [/brands](https://apexhomesupport.com/brands), [/contact](https://apexhomesupport.com/contact), [/service-areas](https://apexhomesupport.com/service-areas), [/services](https://apexhomesupport.com/services), [/services/appliance-repair](https://apexhomesupport.com/services/appliance-repair), [/services/cooling](https://apexhomesupport.com/services/cooling), [/services/heating](https://apexhomesupport.com/services/heating), [/services/water-heater-repair](https://apexhomesupport.com/services/water-heater-repair), [/services/cooling/ac-repair](https://apexhomesupport.com/services/cooling/ac-repair), [/services/cooling/ac-installation](https://apexhomesupport.com/services/cooling/ac-installation), [/services/cooling/ac-maintenance](https://apexhomesupport.com/services/cooling/ac-maintenance), [/services/cooling/ac-replacement](https://apexhomesupport.com/services/cooling/ac-replacement), [/services/heating/furnace-repair](https://apexhomesupport.com/services/heating/furnace-repair), [/services/heating/heat-pumps](https://apexhomesupport.com/services/heating/heat-pumps), [/services/heating/heating-maintenance](https://apexhomesupport.com/services/heating/heating-maintenance), [/services/heating/boiler-repair](https://apexhomesupport.com/services/heating/boiler-repair), [/reviews](https://apexhomesupport.com/reviews).

**Evidence:** SiteHeader always renders Live Now, while homepage adds Instant response. Call or text and we reply right away. contact.hours is null; trust.ts contains Phone Hours: 9 AM ? Midnight, but that string does not appear in any of the 19 HTML pages. Contact lists only a phone. src/content/company.ts:9; src/content/trust.ts:10-21.

**Recommended correction:** Obtain approved operating days, time zone and response expectations; centralize and display them. Qualify or condition Live Now appropriately. Do not publish the unused hours string as verified fact.

### OP-12 ? Results introduction says published examples will appear in the future (Medium)

**Category:** Content quality. **Status:** Pending.

**Affected URLs:** [/](https://apexhomesupport.com/).

**Evidence:** Homepage says Customer-approved before-and-after results will appear here as real projects are cleared for publication, directly above four before/after examples. Source describes four approved pairs. src/components/home/apex-results.tsx:22; src/content/results.ts.

**Recommended correction:** Reconcile the introduction with the current approved examples and explain their context. Confirm publication permission instead of assuming the source comment proves consent.

### OP-13 ? Dryer Vent Cleaning label describes a lint-trap cleaning example (Medium)

**Category:** Content and image context. **Status:** Pending.

**Affected URLs:** [/](https://apexhomesupport.com/).

**Evidence:** The result title is Dryer Vent Cleaning, but the caption says A dryer lint trap clogged with compacted lint and both ALT descriptions identify a lint trap housing. src/content/results.ts:24; media.ts; homepage mainText and images.

**Recommended correction:** Confirm the work pictured and use the precise service label and caption. Do not imply whole-vent cleaning when the evidence only documents a lint-trap housing.

### OP-14 ? Offer shorthand is broader than the stated eligibility (Low)

**Category:** Content quality. **Status:** Pending.

**Affected URLs:** [/](https://apexhomesupport.com/).

**Evidence:** Offer headline says first maintenance service and lists five eligible maintenance services; adjacent large-discount block says Off your first visit. src/components/home/first-time-offer.tsx:26; src/content/offers.ts.

**Recommended correction:** Keep all offer text consistently limited to the owner-approved eligible maintenance services and terms. Do not expand the offer to general repair visits.

### OP-15 ? Two review photos are identical and do not match their displayed service labels (Medium)

**Category:** Trust and image context. **Status:** Pending.

**Affected URLs:** [/](https://apexhomesupport.com/), [/reviews](https://apexhomesupport.com/reviews).

**Evidence:** Two distinct media filenames ending 17aff1e9-4516-4274-95a8-a3f7e8d1eb07.jpg and 8a881e6c-1441-4b84-a2dc-6ec1616752c9.jpg return identical WebP bytes (SHA-256 beffa029dfda359312c48d15e3e84ce3b316fb9bcb482ab54eb715f5ef173004). Visual inspection shows an outdoor AC condenser; review cards are labeled Appliance Repair. images.json and saved assets.

**Recommended correction:** Verify each image?s relationship to its review and the selected service category. Correct misassociation if confirmed, or add accurate context. Duplicate photos do not establish that the reviews are fabricated; do not rewrite customer statements.

### OP-16 ? Review archive has little independent context beyond three short testimonials (Low)

**Category:** Content quality. **Status:** Pending.

**Affected URLs:** [/reviews](https://apexhomesupport.com/reviews).

**Evidence:** Main text has 63 whitespace-delimited words including names, labels and dates. It contains three testimonials also shown on the homepage, one H1, a short introduction and a Leave a review link; no explanation of Verified Customer appears.

**Recommended correction:** Explain review moderation and verification accurately, and collect more genuine, consented detail over time. Keep the archive indexable if useful; do not manufacture testimonials or impose a minimum word count.

### OP-17 ? Service hub is weakly linked and absent as a navigation destination (Medium)

**Category:** Internal linking. **Status:** Pending.

**Affected URLs:** [/services](https://apexhomesupport.com/services).

**Evidence:** Only /contact links to /services in the 19-page HTML graph. Header Services is a menu button, not an anchor to the hub; footer goes directly to category/detail pages. Mobile Heating and Cooling labels toggle submenus rather than linking to category hubs. site-header.tsx:107-124, 209-223.

**Recommended correction:** Add an actual Browse all services link to the shared navigation and useful hub links from relevant pages. Make category overview destinations reachable inside the mobile menu while retaining submenu controls.

### OP-18 ? Reviews has only one inbound source and is omitted from the sitemap (Medium)

**Category:** Internal linking and discovery. **Status:** Pending.

**Affected URLs:** [/reviews](https://apexhomesupport.com/reviews).

**Evidence:** Only the homepage links to /reviews; there is no shared navigation/footer link. Production sitemap.xml has 18 entries and omits /reviews despite its index, follow and self canonical. pages.json links; sitemap.xml; src/app/sitemap.ts.

**Recommended correction:** Add relevant review links from About and service content and a suitable shared navigation location; include /reviews in the sitemap if intentionally indexable. This is a discovery finding, not proof that Google has failed to index it.

### OP-19 ? Boiler page has only one contextual inbound source (Medium)

**Category:** Internal linking. **Status:** Pending.

**Affected URLs:** [/services/heating/boiler-repair](https://apexhomesupport.com/services/heating/boiler-repair).

**Evidence:** Boiler repair is linked globally but only /services/heating links to it inside main content. Furnace and heating-maintenance related-service lists do not link back to boiler repair, while boiler links to both. pages.json graph; src/content/services.ts.

**Recommended correction:** Add relevant contextual boiler links from furnace/heating-maintenance content where useful, keeping distinct equipment scope clear. The page is not orphaned.

### OP-20 ? Brand lists on service pages do not link to the full brand directory (Low)

**Category:** Internal linking. **Status:** Pending.

**Affected URLs:** [/services/appliance-repair](https://apexhomesupport.com/services/appliance-repair), [/services/cooling](https://apexhomesupport.com/services/cooling), [/services/heating](https://apexhomesupport.com/services/heating), [/services/cooling/ac-repair](https://apexhomesupport.com/services/cooling/ac-repair), [/services/cooling/ac-installation](https://apexhomesupport.com/services/cooling/ac-installation), [/services/cooling/ac-maintenance](https://apexhomesupport.com/services/cooling/ac-maintenance), [/services/cooling/ac-replacement](https://apexhomesupport.com/services/cooling/ac-replacement), [/services/heating/furnace-repair](https://apexhomesupport.com/services/heating/furnace-repair), [/services/heating/heat-pumps](https://apexhomesupport.com/services/heating/heat-pumps), [/services/heating/heating-maintenance](https://apexhomesupport.com/services/heating/heating-maintenance), [/services/heating/boiler-repair](https://apexhomesupport.com/services/heating/boiler-repair).

**Evidence:** RelevantBrands renders brand names as list items with no /brands anchor. The Brands directory has four inbound source pages overall, but none of the 12 service landing pages links to it within main content. service-sections.tsx RelevantBrands. Water-heater page has no brand list.

**Recommended correction:** Link to the existing brand directory from relevant service brand sections; add only where a supported-brand relationship exists. Do not create thin brand pages or claim manufacturer authorization.

### OP-21 ? Homepage lacks WebSite and organization identity markup (Medium)

**Category:** Structured data. **Status:** Pending.

**Affected URLs:** [/](https://apexhomesupport.com/).

**Evidence:** Homepage contains zero application/ld+json blocks. Organization is present only on /about; no WebSite node exists on any of the 19 pages. This is an enhancement gap, not invalid existing schema.

**Recommended correction:** After business identity review, describe the site and confirmed organization on the homepage with stable identifiers and visible matching facts. WebSite supports site-name understanding; no ranking or rich-result guarantee is implied.

### OP-22 ? Structured coverage loses the county-level restrictions (Medium)

**Category:** Structured data. **Status:** Pending.

**Affected URLs:** [/about](https://apexhomesupport.com/about), [/services/appliance-repair](https://apexhomesupport.com/services/appliance-repair), [/services/cooling](https://apexhomesupport.com/services/cooling), [/services/heating](https://apexhomesupport.com/services/heating), [/services/water-heater-repair](https://apexhomesupport.com/services/water-heater-repair), [/services/cooling/ac-repair](https://apexhomesupport.com/services/cooling/ac-repair), [/services/cooling/ac-installation](https://apexhomesupport.com/services/cooling/ac-installation), [/services/cooling/ac-maintenance](https://apexhomesupport.com/services/cooling/ac-maintenance), [/services/cooling/ac-replacement](https://apexhomesupport.com/services/cooling/ac-replacement), [/services/heating/furnace-repair](https://apexhomesupport.com/services/heating/furnace-repair), [/services/heating/heat-pumps](https://apexhomesupport.com/services/heating/heat-pumps), [/services/heating/heating-maintenance](https://apexhomesupport.com/services/heating/heating-maintenance), [/services/heating/boiler-repair](https://apexhomesupport.com/services/heating/boiler-repair).

**Evidence:** All 13 JSON-LD blocks declare areaServed as five state-level AdministrativeArea objects. Visible /service-areas copy says Coverage is not statewide and lists 29 selected counties. The broad schema omits that restriction. organization-structured-data.tsx:12; service-structured-data.tsx:13.

**Recommended correction:** Represent the confirmed counties and their parent states consistently, preserving the explicit ZIP confirmation condition in visible content. Do not add Queens or any other place solely because a testimonial mentions it.

### OP-23 ? Organization identity is minimally connected across schema nodes (Low)

**Category:** Structured data. **Status:** Pending.

**Affected URLs:** [/about](https://apexhomesupport.com/about), [/services/appliance-repair](https://apexhomesupport.com/services/appliance-repair), [/services/cooling](https://apexhomesupport.com/services/cooling), [/services/heating](https://apexhomesupport.com/services/heating), [/services/water-heater-repair](https://apexhomesupport.com/services/water-heater-repair), [/services/cooling/ac-repair](https://apexhomesupport.com/services/cooling/ac-repair), [/services/cooling/ac-installation](https://apexhomesupport.com/services/cooling/ac-installation), [/services/cooling/ac-maintenance](https://apexhomesupport.com/services/cooling/ac-maintenance), [/services/cooling/ac-replacement](https://apexhomesupport.com/services/cooling/ac-replacement), [/services/heating/furnace-repair](https://apexhomesupport.com/services/heating/furnace-repair), [/services/heating/heat-pumps](https://apexhomesupport.com/services/heating/heat-pumps), [/services/heating/heating-maintenance](https://apexhomesupport.com/services/heating/heating-maintenance), [/services/heating/boiler-repair](https://apexhomesupport.com/services/heating/boiler-repair).

**Evidence:** About Organization url points to /about, has no @id, logo or telephone; each Service repeats only provider @type Organization and name. These are valid JSON structures, but weak entity connections. organization-structured-data.tsx:7-13; service-structured-data.tsx:12.

**Recommended correction:** Use a stable organization identifier and connect service entities to it; include only confirmed public identity fields. Resolve the provider-role ambiguity first. Missing recommended fields are not labeled syntax failures.

### OP-24 ? Service hierarchy lacks BreadcrumbList markup (Low)

**Category:** Structured data. **Status:** Pending.

**Affected URLs:** [/services/appliance-repair](https://apexhomesupport.com/services/appliance-repair), [/services/cooling](https://apexhomesupport.com/services/cooling), [/services/heating](https://apexhomesupport.com/services/heating), [/services/water-heater-repair](https://apexhomesupport.com/services/water-heater-repair), [/services/cooling/ac-repair](https://apexhomesupport.com/services/cooling/ac-repair), [/services/cooling/ac-installation](https://apexhomesupport.com/services/cooling/ac-installation), [/services/cooling/ac-maintenance](https://apexhomesupport.com/services/cooling/ac-maintenance), [/services/cooling/ac-replacement](https://apexhomesupport.com/services/cooling/ac-replacement), [/services/heating/furnace-repair](https://apexhomesupport.com/services/heating/furnace-repair), [/services/heating/heat-pumps](https://apexhomesupport.com/services/heating/heat-pumps), [/services/heating/heating-maintenance](https://apexhomesupport.com/services/heating/heating-maintenance), [/services/heating/boiler-repair](https://apexhomesupport.com/services/heating/boiler-repair).

**Evidence:** No BreadcrumbList appears on any audited page. Eight details have a visible All cooling/heating services parent link; category/detail URL paths clearly encode a hierarchy.

**Recommended correction:** If approved later, provide consistent visible breadcrumbs and matching valid BreadcrumbList on service routes. No schema needs to be injected during this audit.

### OP-25 ? Primary images show outdoor heat-pump work on furnace and boiler pages (Medium)

**Category:** Image SEO. **Status:** Pending.

**Affected URLs:** [/services/heating/furnace-repair](https://apexhomesupport.com/services/heating/furnace-repair), [/services/heating/boiler-repair](https://apexhomesupport.com/services/heating/boiler-repair).

**Evidence:** Furnace uses /images/real/heating-card.png and boiler uses /images/real/heating-2-card.jpg. ALT describes outdoor HVAC/heat-pump equipment. Both downloaded assets were visually inspected and show outdoor refrigerant equipment, not a furnace or boiler.

**Recommended correction:** Use approved images of the actual relevant equipment, or label the image clearly as general HVAC illustration. Do not alter truthful ALT to call a heat pump a boiler.

### OP-26 ? Informative review photos have generic ALT (Low)

**Category:** Image SEO. **Status:** Pending.

**Affected URLs:** [/](https://apexhomesupport.com/), [/reviews](https://apexhomesupport.com/reviews).

**Evidence:** All four review-photo image occurrences across the two pages use alt="Customer review photo". The inspected image shows an outdoor AC condenser, which the ALT does not convey. src/components/reviews/review-media.tsx:19.

**Recommended correction:** After verifying image association, use concise factual visual descriptions when the image adds information. If an image is redundant decoration, empty ALT may be appropriate. Never add service-area keywords just for SEO.

### OP-27 ? Some source filenames are vague or numbered (Low)

**Category:** Image SEO. **Status:** Pending.

**Affected URLs:** [/](https://apexhomesupport.com/), [/services](https://apexhomesupport.com/services), [/services/heating](https://apexhomesupport.com/services/heating), [/services/heating/furnace-repair](https://apexhomesupport.com/services/heating/furnace-repair), [/services/heating/heat-pumps](https://apexhomesupport.com/services/heating/heat-pumps), [/services/heating/heating-maintenance](https://apexhomesupport.com/services/heating/heating-maintenance), [/services/heating/boiler-repair](https://apexhomesupport.com/services/heating/boiler-repair).

**Evidence:** Observed heating filenames include heating-card.png, heating-2-card.jpg and heating-2-card-wide.jpg. Most other assets already use descriptive filenames, such as ice-maker-replacement-after.jpg.

**Recommended correction:** Use accurate subject-based filenames when replacing or adding assets. Avoid disruptive renaming solely for marginal SEO value; keep decorative assets and private review-storage identifiers out of keyword campaigns.

### OP-28 ? Hero photo selector hit targets are very small (Medium)

**Category:** Mobile and usability. **Status:** Pending.

**Affected URLs:** [/](https://apexhomesupport.com/).

**Evidence:** Production HTML and CSS show buttons with h-1.5, inactive w-1.5, gap-1.5 and --spacing:.25rem: about 6x6 CSS pixels with 6px spacing at a 16px root size; active target is about 24x6. No padding enlarges them. hero-image-carousel.tsx:49; production.css.

**Recommended correction:** Increase hit areas and spacing while preserving small visual dots; verify with touch, keyboard and zoom. WCAG target size minimum is 24x24 or a qualifying exception. Browser measurements were unavailable, so this is a source-and-CSS finding.

### OP-29 ? Global focus outline has low contrast on dark CTA panels (Medium)

**Category:** Mobile and usability. **Status:** Pending.

**Affected URLs:** [/about](https://apexhomesupport.com/about), [/brands](https://apexhomesupport.com/brands), [/contact](https://apexhomesupport.com/contact), [/services/appliance-repair](https://apexhomesupport.com/services/appliance-repair), [/services/cooling](https://apexhomesupport.com/services/cooling), [/services/heating](https://apexhomesupport.com/services/heating), [/services/water-heater-repair](https://apexhomesupport.com/services/water-heater-repair), [/services/cooling/ac-repair](https://apexhomesupport.com/services/cooling/ac-repair), [/services/cooling/ac-installation](https://apexhomesupport.com/services/cooling/ac-installation), [/services/cooling/ac-maintenance](https://apexhomesupport.com/services/cooling/ac-maintenance), [/services/cooling/ac-replacement](https://apexhomesupport.com/services/cooling/ac-replacement), [/services/heating/furnace-repair](https://apexhomesupport.com/services/heating/furnace-repair), [/services/heating/heat-pumps](https://apexhomesupport.com/services/heating/heat-pumps), [/services/heating/heating-maintenance](https://apexhomesupport.com/services/heating/heating-maintenance), [/services/heating/boiler-repair](https://apexhomesupport.com/services/heating/boiler-repair).

**Evidence:** Production CSS uses #005098 for :focus-visible outline and #003973 for bg-brand-dark. Calculated contrast is 1.419:1, below 3:1, on controls in those panels. Footer has a separate brighter focus outline and is excluded. globals.css:125 and service-sections.tsx FinalServiceCta; relevant page CTA markup.

**Recommended correction:** Provide an appropriate contrasting focus treatment for dark surfaces and verify all keyboard states in a browser. This is a calculated CSS concern, not a claim that a full accessibility audit passed or failed.

### OP-30 ? Heating summary and description omit the existing boiler offering (Medium)

**Category:** Metadata and content relevance. **Status:** Pending.

**Affected URLs:** [/services/heating](https://apexhomesupport.com/services/heating).

**Evidence:** Heating meta description: Browse furnace repair, heat-pump, and heating-maintenance services from Apex Home Services. Its shortDescription likewise names only furnace, heat-pump and seasonal heating, while the same page lists Boiler Repair as a fourth child. src/content/services.ts.

**Recommended correction:** Include the existing boiler-repair offering naturally in the heating overview and metadata where space allows; keep it distinct from furnace repair.

## Per-page metadata, headings and intent

Full titles, descriptions, lengths, canonicals and statuses also appear in [PAGE_SEO_MATRIX.csv](PAGE_SEO_MATRIX.csv). Secondary keywords are content-derived targets, not volume-validated terms. Every page has index, follow and summary_large_image; all subpages have the homepage Twitter title/description pair quoted in OP-02. All OG/Twitter images returned 1200?630 PNG brand artwork. All main heading sequences below were checked; source includes hidden responsive variants.

### 1. https://apexhomesupport.com/

**Type:** Homepage. **Primary keyword:** Apex Home Services. **Intent:** Branded navigation + local service discovery.

**Secondary keywords:** heating and cooling service; appliance repair; water-heater repair; Northeast home services.

**Title (63 characters):** Apex Home Services | Premium Home Services | Apex Home Services

**Description (98 characters):** Reliable heating, cooling, appliance, and water-heater service from local Northeast professionals.

**Canonical:** https://apexhomesupport.com

**OG title / description:** Apex Home Services | Premium Home Services / Reliable heating, cooling, appliance, and water-heater service from local Northeast professionals.

**OG URL:** https://apexhomesupport.com. **OG image:** https://apexhomesupport.com/opengraph-image?ba0a4ac7c10e07d1. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Clear categories, imagery and CTAs. Generic H1/title, repeated branding and inconsistent proof/offer copy weaken relevance. Keep the homepage as the branded entry point, with /services organizing the catalog.

**Main words:** 764. **ALT:** 21 images; 0 missing ALT; 1 appropriate decorative logo ALT; 2 generic review ALT. **Linking:** 18 inbound source pages; 1 main-content sources; 0 observed broken targets; not orphaned. **Schema:** None; absence is not invalid syntax.

**Main heading sequence:** H1: Home repairs fast and reliable. ? H2: What customers say ? H2: One home. Every system covered. ? H3: Appliance Repair ? H3: Cooling ? H3: Heating ? H3: Water Heater Repair ? H2: Save 10% on your first maintenance service. ? H2: See the difference Apex makes. ? H3: Outdoor AC Unit Cleaning ? H3: Dryer Vent Cleaning ? H3: Ice Maker Replacement ? H3: Refrigerator Control Board Replacement ? H2: Familiar systems. Careful service. ? H3: Appliances ? H3: Premium Appliances ? H3: HVAC ? H2: Local professionals, across five states. ? H3: New York ? H3: New York ? H3: New Jersey ? H3: Connecticut ? H3: Massachusetts ? H3: Rhode Island ? H2: A clearer way forward. ? H3: How do I know which service to book? + ? H3: Does Apex Home Services serve my area? + ? H3: What should I include when I book? +

**Main images:** appliance-refrigerator-card.jpg ? eager/default; ALT: Apex technician working inside an open refrigerator freezer compartment / ac-cleaning-card.jpg ? lazy; ALT: Technician on a ladder using a multimeter to service an outdoor AC condenser unit / heating-2-card.jpg ? lazy; ALT: Apex technician connecting refrigerant gauges to an outdoor heat pump unit / water-heating.jpg ? lazy; ALT: Technician inspecting a residential gas water heater / appliance-oven-card.jpg ? lazy; ALT: Technician using a diagnostic tool to inspect an open range oven / 17aff1e9-4516-4274-95a8-a3f7e8d1eb07.jpg ? lazy; ALT: Customer review photo / 8a881e6c-1441-4b84-a2dc-6ec1616752c9.jpg ? lazy; ALT: Customer review photo / appliance-oven-card-wide.jpg ? lazy; ALT: Technician using a diagnostic tool to inspect an open range oven / ac-cleaning-card.jpg ? lazy; ALT: Technician on a ladder using a multimeter to service an outdoor AC condenser unit / heating-2-card-wide.jpg ? lazy; ALT: Apex technician connecting refrigerant gauges to an outdoor heat pump unit, head and shoulders fully visible / water-heating-wide.jpg ? lazy; ALT: Technician inspecting the label on a residential gas water heater / before-hvac-maintenance.jpg ? lazy; ALT: A dusty, dirt-caked outdoor AC condenser coil before cleaning / after-hvac-maintenance.jpg ? lazy; ALT: The outdoor AC condenser coil visibly cleaner after maintenance / before-appliances.jpg ? lazy; ALT: A dryer lint trap housing heavily clogged with compacted lint before cleaning / after-appliances.jpg ? lazy; ALT: The same dryer lint trap housing fully cleaned after service / ice-maker-replacement-before.jpg ? lazy; ALT: An ice maker assembly removed from a refrigerator freezer door, held in hand / ice-maker-replacement-after.jpg ? lazy; ALT: The new ice maker assembly installed in the refrigerator freezer door / refrigerator-control-board-before.jpg ? lazy; ALT: A replacement refrigerator control board held in hand before installation / refrigerator-control-board-after.jpg ? lazy; ALT: The new refrigerator control board wired and installed in place

**Overall:** Usable foundation; targeted improvements pending. **Issues:** OP-01, OP-03, OP-04, OP-11, OP-12, OP-13, OP-14, OP-15, OP-21, OP-26, OP-27, OP-28.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/home.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 2. https://apexhomesupport.com/about

**Type:** Company. **Primary keyword:** About Apex Home Services. **Intent:** Branded informational / credibility investigation.

**Secondary keywords:** independent local service professionals; home-service coordination; Apex service process.

**Title (45 characters):** About Apex Home Services | Apex Home Services

**Description (160 characters):** Learn how Apex Home Services connects homeowners with experienced independent local service professionals through clear communication and thoughtful next steps.

**Canonical:** https://apexhomesupport.com/about

**OG title / description:** About Apex Home Services / Reliable Home Services. Local Professionals.

**OG URL:** https://apexhomesupport.com/about. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Explains the independent-provider model and has the only standalone Organization object. We diagnose conflicts with that framing. Obtain approved company identity and verification-process details; do not invent history, certifications or staff biographies.

**Main words:** 304. **ALT:** 2 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 18 inbound source pages; 0 main-content sources; 0 observed broken targets; not orphaned. **Schema:** Organization; JSON parsed; county scope/provider identity need review.

**Main heading sequence:** H1: Reliable home service starts with clarity. ? H2: Make the next home-service decision easier to understand. ? H2: Precision in the work. Respect in the experience. ? H3: Precision ? H3: Transparency ? H3: Craftsmanship ? H2: Help for the systems behind daily life. ? H3: Appliance Repair ? H3: Cooling ? H3: Heating ? H3: Water Heater Repair ? H2: Select counties across five states. ? H2: Brands we service. ? H2: Start with what your home needs.

**Main images:** None. Shared logos do not create a requirement for a page-specific image.

**Overall:** Needs high-priority content/identity work; technical tags present. **Issues:** OP-01, OP-02, OP-04, OP-10, OP-11, OP-22, OP-23, OP-29.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/about.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 3. https://apexhomesupport.com/brands

**Type:** Brand directory. **Primary keyword:** appliance and HVAC brands serviced by Apex. **Intent:** Commercial compatibility / brand navigation.

**Secondary keywords:** Samsung appliance service; Sub-Zero appliance service; Carrier HVAC service; supported appliance brands.

**Title (38 characters):** Brands We Service | Apex Home Services

**Description (84 characters):** Browse appliance, premium-appliance, and HVAC brands serviced by Apex Home Services.

**Canonical:** https://apexhomesupport.com/brands

**OG title / description:** Brands We Service / A directory of appliance and HVAC brands serviced by Apex Home Services.

**OG URL:** https://apexhomesupport.com/brands. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Lists 27 brands in three groups with category links and an authorization disclaimer. Clarify H1 and how to supply equipment model details. Expand service scope only after confirmation; do not create thin brand pages.

**Main words:** 202. **ALT:** 2 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 4 inbound source pages; 4 main-content sources; 0 observed broken targets; not orphaned. **Schema:** None; absence is not invalid syntax.

**Main heading sequence:** H1: Familiar equipment. Thoughtful service. ? H2: Find the category behind your equipment. ? H2: Appliances ? H2: Premium Appliances ? H2: HVAC ? H2: Don’t see your brand?

**Main images:** None. Shared logos do not create a requirement for a page-specific image.

**Overall:** Usable foundation; targeted improvements pending. **Issues:** OP-02, OP-04, OP-11, OP-29.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/brands.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 4. https://apexhomesupport.com/contact

**Type:** Contact. **Primary keyword:** contact Apex Home Services. **Intent:** Branded navigation / request service.

**Secondary keywords:** Apex phone number; book home service; service coverage questions.

**Title (47 characters):** Contact Apex Home Services | Apex Home Services

**Description (116 characters):** Find the right path to request service, explore Apex services, check listed coverage, or ask about supported brands.

**Canonical:** https://apexhomesupport.com/contact

**OG title / description:** Contact Apex Home Services / Choose the right path for service, coverage, or equipment-brand questions.

**OG URL:** https://apexhomesupport.com/contact. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Direct phone and information paths match intent. Contradictory online-submission statements need urgent correction. Hours are absent; email/address remain unknown. Do not infer location from the phone area code.

**Main words:** 145. **ALT:** 2 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 18 inbound source pages; 3 main-content sources; 0 observed broken targets; not orphaned. **Schema:** None; absence is not invalid syntax.

**Main heading sequence:** H1: Start with the right path forward. ? H2: Find information without starting over. ? H3: Need help choosing a service? ? H3: Checking coverage? ? H3: Have a brand question? ? H2: Business contact information ? H2: Tell us what you’re noticing.

**Main images:** None. Shared logos do not create a requirement for a page-specific image.

**Overall:** Needs high-priority content/identity work; technical tags present. **Issues:** OP-01, OP-02, OP-04, OP-06, OP-11, OP-29.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/contact.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 5. https://apexhomesupport.com/service-areas

**Type:** Coverage directory. **Primary keyword:** Apex Home Services service areas. **Intent:** Local eligibility / coverage lookup.

**Secondary keywords:** Nassau County home services; Bergen County home services; Fairfield County home services; county coverage.

**Title (34 characters):** Service Areas | Apex Home Services

**Description (131 characters):** Explore the select counties Apex Home Services serves across five Northeast states and prepare a request for location confirmation.

**Canonical:** https://apexhomesupport.com/service-areas

**OG title / description:** Service Areas / Serving communities across select counties in five Northeast states.

**OG URL:** https://apexhomesupport.com/service-areas. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Strong local intent: five state headings, 29 counties, working anchor links and ZIP confirmation. This is site-stated coverage, not independently verified. Add useful service links when relevant; avoid statewide claims and doorway pages.

**Main words:** 334. **ALT:** 2 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 18 inbound source pages; 14 main-content sources; 0 observed broken targets; not orphaned. **Schema:** None; absence is not invalid syntax.

**Main heading sequence:** H1: Local service across select Northeast communities. ? H2: Five states. Twenty-nine counties. ? H2: New York ? H2: New Jersey ? H2: Connecticut ? H2: Massachusetts ? H2: Rhode Island ? H2: Not sure if we service your area?

**Main images:** None. Shared logos do not create a requirement for a page-specific image.

**Overall:** Usable foundation; targeted improvements pending. **Issues:** OP-02, OP-04, OP-11.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/service-areas.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 6. https://apexhomesupport.com/services

**Type:** Service hub. **Primary keyword:** Apex home services. **Intent:** Commercial service selection.

**Secondary keywords:** appliance repair; cooling services; heating services; water-heater repair.

**Title (34 characters):** Home Services | Apex Home Services

**Description (101 characters):** Explore appliance repair, cooling, heating, and water-heater repair services from Apex Home Services.

**Canonical:** https://apexhomesupport.com/services

**OG title / description:** Home Services / Explore appliance repair, cooling, heating, and water-heater repair services from Apex Home Services.

**OG URL:** https://apexhomesupport.com/services. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Four categories and symptom links give useful pathways. Only one inbound source and a slogan H1 weaken the hub. Let this page organize the catalog and the homepage introduce the company.

**Main words:** 441. **ALT:** 3 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 1 inbound source pages; 1 main-content sources; 0 observed broken targets; not orphaned. **Schema:** None; absence is not invalid syntax.

**Main heading sequence:** H1: The right care for the systems behind your home. ? H2: One home. Four service categories. ? H2: Appliance Repair ? H2: Cooling ? H2: Heating ? H2: Water Heater Repair ? H2: Start with what changed. ? H2: Local service across the Northeast. ? H2: Brands we service ? H2: Tell us what your home needs.

**Main images:** heating-2-card.jpg ? eager/default; ALT: Apex technician connecting refrigerant gauges to an outdoor heat pump unit

**Overall:** Usable foundation; targeted improvements pending. **Issues:** OP-02, OP-03, OP-04, OP-11, OP-17, OP-27.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/services.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 7. https://apexhomesupport.com/services/appliance-repair

**Type:** Service category. **Primary keyword:** appliance repair. **Intent:** Transactional repair / equipment compatibility.

**Secondary keywords:** refrigerator repair; washer and dryer repair; dishwasher repair; oven repair; commercial appliance service.

**Title (46 characters):** Appliance Repair Services | Apex Home Services

**Description (146 characters):** Explore appliance repair service from Apex Home Services, supported brand categories, common service situations, and how to request an inspection.

**Canonical:** https://apexhomesupport.com/services/appliance-repair

**OG title / description:** Appliance Repair Services / Explore appliance repair service from Apex Home Services, supported brand categories, common service situations, and how to request an inspection.

**OG URL:** https://apexhomesupport.com/services/appliance-repair. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Broad repair intent is appropriate, but main content omits explanations of the supplied residential/commercial equipment inventory in the footer. Replace planning text with confirmed equipment scope and symptoms; clarify the maintenance offer on this existing page.

**Main words:** 460. **ALT:** 3 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 18 inbound source pages; 4 main-content sources; 0 observed broken targets; not orphaned. **Schema:** Service; JSON parsed; county scope/provider identity need review.

**Main heading sequence:** H1: Appliance Repair ? H2: A careful place to begin. ? H2: You do not need to diagnose it first. ? H2: Clarity at every step. ? H3: Understand the issue ? H3: Inspect the relevant system ? H3: Explain the findings ? H3: Review service options ? H3: Perform approved work ? H2: Broad equipment familiarity. ? H3: Appliances ? H3: Premium Appliances ? H2: Across five Northeast states. ? H2: Useful context before you book. ? H2: Let’s talk about your appliance repair needs.

**Main images:** appliance-oven-card.jpg ? eager/default; ALT: Technician using a diagnostic tool to inspect an open range oven

**Overall:** Needs high-priority content/identity work; technical tags present. **Issues:** OP-02, OP-03, OP-05, OP-07, OP-10, OP-11, OP-20, OP-22, OP-23, OP-24, OP-29.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/services__appliance-repair.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 8. https://apexhomesupport.com/services/cooling

**Type:** Service category. **Primary keyword:** residential cooling services. **Intent:** Commercial comparison / service selection.

**Secondary keywords:** AC repair; AC installation; AC maintenance; AC replacement.

**Title (49 characters):** Residential Cooling Services | Apex Home Services

**Description (94 characters):** Browse AC repair, installation, maintenance, and replacement services from Apex Home Services.

**Canonical:** https://apexhomesupport.com/services/cooling

**OG title / description:** Residential Cooling Services / Browse AC repair, installation, maintenance, and replacement services from Apex Home Services.

**OG URL:** https://apexhomesupport.com/services/cooling. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Four child services and symptom paths support intent. Strengthen the H1 and briefly distinguish options; send visitors to specific detail pages rather than duplicating their answers.

**Main words:** 443. **ALT:** 3 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 18 inbound source pages; 8 main-content sources; 0 observed broken targets; not orphaned. **Schema:** Service; JSON parsed; county scope/provider identity need review.

**Main heading sequence:** H1: Cooling ? H2: Focused help for the system in front of you. ? H2: You do not need to diagnose it first. ? H2: Clarity at every step. ? H3: Understand the issue ? H3: Inspect the relevant system ? H3: Explain the findings ? H3: Review service options ? H3: Perform approved work ? H2: Broad equipment familiarity. ? H3: HVAC ? H2: Across five Northeast states. ? H2: Useful context before you book. ? H2: Let’s talk about your cooling needs.

**Main images:** ac-cleaning-card.jpg ? eager/default; ALT: Technician on a ladder using a multimeter to service an outdoor AC condenser unit

**Overall:** Needs high-priority content/identity work; technical tags present. **Issues:** OP-02, OP-03, OP-04, OP-05, OP-10, OP-11, OP-20, OP-22, OP-23, OP-24, OP-29.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/services__cooling.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 9. https://apexhomesupport.com/services/heating

**Type:** Service category. **Primary keyword:** residential heating services. **Intent:** Commercial comparison / service selection.

**Secondary keywords:** furnace repair; boiler repair; heat-pump service; heating maintenance.

**Title (49 characters):** Residential Heating Services | Apex Home Services

**Description (91 characters):** Browse furnace repair, heat-pump, and heating-maintenance services from Apex Home Services.

**Canonical:** https://apexhomesupport.com/services/heating

**OG title / description:** Residential Heating Services / Browse furnace repair, heat-pump, and heating-maintenance services from Apex Home Services.

**OG URL:** https://apexhomesupport.com/services/heating. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Four child services appear in HTML. Boiler repair is omitted from short description and metadata. Explain equipment distinctions and align the overview with all existing offerings.

**Main words:** 415. **ALT:** 3 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 18 inbound source pages; 8 main-content sources; 0 observed broken targets; not orphaned. **Schema:** Service; JSON parsed; county scope/provider identity need review.

**Main heading sequence:** H1: Heating ? H2: Focused help for the system in front of you. ? H2: You do not need to diagnose it first. ? H2: Clarity at every step. ? H3: Understand the issue ? H3: Inspect the relevant system ? H3: Explain the findings ? H3: Review service options ? H3: Perform approved work ? H2: Broad equipment familiarity. ? H3: HVAC ? H2: Across five Northeast states. ? H2: Useful context before you book. ? H2: Let’s talk about your heating needs.

**Main images:** heating-2-card.jpg ? eager/default; ALT: Apex technician connecting refrigerant gauges to an outdoor heat pump unit

**Overall:** Needs high-priority content/identity work; technical tags present. **Issues:** OP-02, OP-03, OP-04, OP-05, OP-10, OP-11, OP-20, OP-22, OP-23, OP-24, OP-27, OP-29, OP-30.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/services__heating.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 10. https://apexhomesupport.com/services/water-heater-repair

**Type:** Service category. **Primary keyword:** water heater repair. **Intent:** Transactional troubleshooting / request repair.

**Secondary keywords:** inconsistent hot water; water-heater noise; moisture near water heater; water-heater inspection.

**Title (49 characters):** Water Heater Repair Services | Apex Home Services

**Description (144 characters):** Explore residential water-heater repair from Apex Home Services for inconsistent hot water, equipment concerns, and informed next-step planning.

**Canonical:** https://apexhomesupport.com/services/water-heater-repair

**OG title / description:** Water Heater Repair Services / Explore residential water-heater repair from Apex Home Services for inconsistent hot water, equipment concerns, and informed next-step planning.

**OG URL:** https://apexhomesupport.com/services/water-heater-repair. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Correct keyword, symptoms and CTA, but planning text replaces useful scope. Confirm supported equipment and explain inspection, exclusions and preparation. A gas-water-heater photo does not establish all gas/electric service capabilities.

**Main words:** 380. **ALT:** 3 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 18 inbound source pages; 3 main-content sources; 0 observed broken targets; not orphaned. **Schema:** Service; JSON parsed; county scope/provider identity need review.

**Main heading sequence:** H1: Water Heater Repair ? H2: A careful place to begin. ? H2: You do not need to diagnose it first. ? H2: Clarity at every step. ? H3: Understand the issue ? H3: Inspect the relevant system ? H3: Explain the findings ? H3: Review service options ? H3: Perform approved work ? H2: Across five Northeast states. ? H2: Useful context before you book. ? H2: Let’s talk about your water heater repair needs.

**Main images:** water-heating.jpg ? eager/default; ALT: Technician inspecting a residential gas water heater

**Overall:** Needs high-priority content/identity work; technical tags present. **Issues:** OP-02, OP-03, OP-05, OP-07, OP-10, OP-11, OP-22, OP-23, OP-24, OP-29.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/services__water-heater-repair.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 11. https://apexhomesupport.com/services/cooling/ac-repair

**Type:** Service detail. **Primary keyword:** AC repair. **Intent:** Transactional repair / symptom investigation.

**Secondary keywords:** AC not cooling; weak airflow; unusual AC noise; cooling-system inspection.

**Title (39 characters):** AC Repair Services | Apex Home Services

**Description (153 characters):** Explore AC repair service from Apex Home Services, including common cooling concerns, what to expect, related services, and how to request an inspection.

**Canonical:** https://apexhomesupport.com/services/cooling/ac-repair

**OG title / description:** AC Repair Services / Explore AC repair service from Apex Home Services, including common cooling concerns, what to expect, related services, and how to request an inspection.

**OG URL:** https://apexhomesupport.com/services/cooling/ac-repair. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Clear repair intent, symptoms, FAQs and related links. Add approved diagnostic scope, preparation and examples. Do not promise remote diagnosis.

**Main words:** 411. **ALT:** 3 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 18 inbound source pages; 4 main-content sources; 0 observed broken targets; not orphaned. **Schema:** Service; JSON parsed; county scope/provider identity need review.

**Main heading sequence:** H1: AC Repair ? H2: Start with the full picture. ? H3: Reasons to request service ? H2: Clarity at every step. ? H3: Understand the issue ? H3: Inspect the relevant system ? H3: Explain the findings ? H3: Review service options ? H3: Perform approved work ? H2: Keep exploring. ? H3: AC Maintenance ? H3: AC Replacement ? H2: Broad equipment familiarity. ? H3: HVAC ? H2: Across five Northeast states. ? H2: Useful context before you book. ? H2: Book ac repair service.

**Main images:** ac-cleaning-card.jpg ? eager/default; ALT: Technician on a ladder using a multimeter to service an outdoor AC condenser unit

**Overall:** Needs high-priority content/identity work; technical tags present. **Issues:** OP-02, OP-03, OP-05, OP-08, OP-10, OP-11, OP-20, OP-22, OP-23, OP-24, OP-29.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/services__cooling__ac-repair.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 12. https://apexhomesupport.com/services/cooling/ac-installation

**Type:** Service detail. **Primary keyword:** AC installation. **Intent:** Commercial investigation / installation request.

**Secondary keywords:** new cooling system; residential AC installation; equipment selection; renovated-space cooling.

**Title (45 characters):** AC Installation Services | Apex Home Services

**Description (132 characters):** Learn how Apex Home Services approaches residential AC installation planning, equipment discussions, and next-step service requests.

**Canonical:** https://apexhomesupport.com/services/cooling/ac-installation

**OG title / description:** AC Installation Services / Learn how Apex Home Services approaches residential AC installation planning, equipment discussions, and next-step service requests.

**OG URL:** https://apexhomesupport.com/services/cooling/ac-installation. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Recognizes new/renovated spaces but offers generic planning copy. Explain verified planning inputs and installation deliverables; distinguish new-system projects from replacement without inventing supported equipment types.

**Main words:** 409. **ALT:** 3 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 18 inbound source pages; 4 main-content sources; 0 observed broken targets; not orphaned. **Schema:** Service; JSON parsed; county scope/provider identity need review.

**Main heading sequence:** H1: AC Installation ? H2: Start with the full picture. ? H3: Reasons to request service ? H2: Clarity at every step. ? H3: Understand the issue ? H3: Inspect the relevant system ? H3: Explain the findings ? H3: Review service options ? H3: Perform approved work ? H2: Keep exploring. ? H3: AC Replacement ? H3: Heat Pumps ? H2: Broad equipment familiarity. ? H3: HVAC ? H2: Across five Northeast states. ? H2: Useful context before you book. ? H2: Book ac installation service.

**Main images:** ac-cleaning-card.jpg ? eager/default; ALT: Technician on a ladder using a multimeter to service an outdoor AC condenser unit

**Overall:** Needs high-priority content/identity work; technical tags present. **Issues:** OP-02, OP-03, OP-05, OP-08, OP-09, OP-10, OP-11, OP-20, OP-22, OP-23, OP-24, OP-29.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/services__cooling__ac-installation.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 13. https://apexhomesupport.com/services/cooling/ac-maintenance

**Type:** Service detail. **Primary keyword:** AC maintenance. **Intent:** Preventive service / maintenance request.

**Secondary keywords:** outdoor AC unit cleaning; seasonal cooling service; cooling-system inspection.

**Title (44 characters):** AC Maintenance Services | Apex Home Services

**Description (122 characters):** Review residential AC maintenance from Apex Home Services, including common reasons to schedule seasonal system attention.

**Canonical:** https://apexhomesupport.com/services/cooling/ac-maintenance

**OG title / description:** AC Maintenance Services / Review residential AC maintenance from Apex Home Services, including common reasons to schedule seasonal system attention.

**OG URL:** https://apexhomesupport.com/services/cooling/ac-maintenance. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Seasonal intent and offer align. Homepage offers outdoor AC unit cleaning, but this page lacks concrete included/excluded tasks. Add approved scope and relevant existing results.

**Main words:** 423. **ALT:** 3 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 18 inbound source pages; 5 main-content sources; 0 observed broken targets; not orphaned. **Schema:** Service; JSON parsed; county scope/provider identity need review.

**Main heading sequence:** H1: AC Maintenance ? H2: Start with the full picture. ? H3: Reasons to request service ? H2: Clarity at every step. ? H3: Understand the issue ? H3: Inspect the relevant system ? H3: Explain the findings ? H3: Review service options ? H3: Perform approved work ? H2: Keep exploring. ? H3: AC Repair ? H3: Heating Maintenance ? H3: AC Replacement ? H2: Broad equipment familiarity. ? H3: HVAC ? H2: Across five Northeast states. ? H2: Useful context before you book. ? H2: Book ac maintenance service.

**Main images:** ac-cleaning-card.jpg ? eager/default; ALT: Technician on a ladder using a multimeter to service an outdoor AC condenser unit

**Overall:** Needs high-priority content/identity work; technical tags present. **Issues:** OP-02, OP-03, OP-05, OP-08, OP-10, OP-11, OP-20, OP-22, OP-23, OP-24, OP-29.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/services__cooling__ac-maintenance.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 14. https://apexhomesupport.com/services/cooling/ac-replacement

**Type:** Service detail. **Primary keyword:** AC replacement. **Intent:** Commercial repair-versus-replace investigation.

**Secondary keywords:** cooling-system replacement; repair or replace AC; recurring AC problems.

**Title (44 characters):** AC Replacement Services | Apex Home Services

**Description (118 characters):** Consider residential AC replacement with a clear review of system concerns, household goals, and available next steps.

**Canonical:** https://apexhomesupport.com/services/cooling/ac-replacement

**OG title / description:** AC Replacement Services / Consider residential AC replacement with a clear review of system concerns, household goals, and available next steps.

**OG URL:** https://apexhomesupport.com/services/cooling/ac-replacement. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Differentiation rests on brief summaries and recurring-attention symptoms. Add verified decision factors and replacement process; avoid invented age thresholds, savings or guarantees.

**Main words:** 408. **ALT:** 3 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 18 inbound source pages; 4 main-content sources; 0 observed broken targets; not orphaned. **Schema:** Service; JSON parsed; county scope/provider identity need review.

**Main heading sequence:** H1: AC Replacement ? H2: Start with the full picture. ? H3: Reasons to request service ? H2: Clarity at every step. ? H3: Understand the issue ? H3: Inspect the relevant system ? H3: Explain the findings ? H3: Review service options ? H3: Perform approved work ? H2: Keep exploring. ? H3: AC Repair ? H3: AC Installation ? H3: Heat Pumps ? H2: Broad equipment familiarity. ? H3: HVAC ? H2: Across five Northeast states. ? H2: Useful context before you book. ? H2: Book ac replacement service.

**Main images:** ac-cleaning-card.jpg ? eager/default; ALT: Technician on a ladder using a multimeter to service an outdoor AC condenser unit

**Overall:** Needs high-priority content/identity work; technical tags present. **Issues:** OP-02, OP-03, OP-05, OP-08, OP-09, OP-10, OP-11, OP-20, OP-22, OP-23, OP-24, OP-29.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/services__cooling__ac-replacement.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 15. https://apexhomesupport.com/services/heating/furnace-repair

**Type:** Service detail. **Primary keyword:** furnace repair. **Intent:** Transactional repair / no-heat investigation.

**Secondary keywords:** furnace not heating; inconsistent heating cycles; furnace noise; heating inspection.

**Title (44 characters):** Furnace Repair Services | Apex Home Services

**Description (127 characters):** Explore furnace repair service from Apex Home Services, including common heating concerns and what a service visit may involve.

**Canonical:** https://apexhomesupport.com/services/heating/furnace-repair

**OG title / description:** Furnace Repair Services / Explore furnace repair service from Apex Home Services, including common heating concerns and what a service visit may involve.

**OG URL:** https://apexhomesupport.com/services/heating/furnace-repair. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Relevant symptoms and safety FAQ. Copy resembles boiler repair and hero shows outdoor HVAC equipment. Explain furnace-specific scope and use approved relevant imagery.

**Main words:** 402. **ALT:** 3 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 18 inbound source pages; 5 main-content sources; 0 observed broken targets; not orphaned. **Schema:** Service; JSON parsed; county scope/provider identity need review.

**Main heading sequence:** H1: Furnace Repair ? H2: Start with the full picture. ? H3: Reasons to request service ? H2: Clarity at every step. ? H3: Understand the issue ? H3: Inspect the relevant system ? H3: Explain the findings ? H3: Review service options ? H3: Perform approved work ? H2: Keep exploring. ? H3: Heating Maintenance ? H3: Heat Pumps ? H2: Broad equipment familiarity. ? H3: HVAC ? H2: Across five Northeast states. ? H2: Useful context before you book. ? H2: Book furnace repair service.

**Main images:** heating-2-card.jpg ? eager/default; ALT: Apex technician connecting refrigerant gauges to an outdoor heat pump unit

**Overall:** Needs high-priority content/identity work; technical tags present. **Issues:** OP-02, OP-03, OP-05, OP-08, OP-10, OP-11, OP-20, OP-22, OP-23, OP-24, OP-25, OP-27, OP-29.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/services__heating__furnace-repair.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 16. https://apexhomesupport.com/services/heating/heat-pumps

**Type:** Service detail. **Primary keyword:** heat pump service. **Intent:** Commercial investigation / existing-system service.

**Secondary keywords:** heat-pump heating and cooling; heat-pump performance; heat-pump equipment options.

**Title (39 characters):** Heat Pump Services | Apex Home Services

**Description (91 characters):** Explore residential heat-pump service and equipment considerations with Apex Home Services.

**Canonical:** https://apexhomesupport.com/services/heating/heat-pumps

**OG title / description:** Heat Pump Services / Explore residential heat-pump service and equipment considerations with Apex Home Services.

**OG URL:** https://apexhomesupport.com/services/heating/heat-pumps. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Correct year-round heating/cooling explanation and relevant image. Service and new-equipment planning are mixed. Clarify confirmed tasks and planning assistance within this page before considering new routes.

**Main words:** 396. **ALT:** 3 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 18 inbound source pages; 5 main-content sources; 0 observed broken targets; not orphaned. **Schema:** Service; JSON parsed; county scope/provider identity need review.

**Main heading sequence:** H1: Heat Pumps ? H2: Start with the full picture. ? H3: Reasons to request service ? H2: Clarity at every step. ? H3: Understand the issue ? H3: Inspect the relevant system ? H3: Explain the findings ? H3: Review service options ? H3: Perform approved work ? H2: Keep exploring. ? H3: Furnace Repair ? H3: AC Installation ? H3: Heating Maintenance ? H2: Broad equipment familiarity. ? H3: HVAC ? H2: Across five Northeast states. ? H2: Useful context before you book. ? H2: Book heat pumps service.

**Main images:** heating-card.png ? eager/default; ALT: Apex technician servicing an outdoor HVAC heating unit with the access panel open

**Overall:** Needs high-priority content/identity work; technical tags present. **Issues:** OP-02, OP-03, OP-05, OP-08, OP-10, OP-11, OP-20, OP-22, OP-23, OP-24, OP-27, OP-29.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/services__heating__heat-pumps.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 17. https://apexhomesupport.com/services/heating/heating-maintenance

**Type:** Service detail. **Primary keyword:** heating maintenance. **Intent:** Preventive service / seasonal request.

**Secondary keywords:** furnace maintenance; seasonal heating inspection; preventive heating service.

**Title (49 characters):** Heating Maintenance Services | Apex Home Services

**Description (112 characters):** Learn about seasonal residential heating maintenance and how to request a system review from Apex Home Services.

**Canonical:** https://apexhomesupport.com/services/heating/heating-maintenance

**OG title / description:** Heating Maintenance Services / Learn about seasonal residential heating maintenance and how to request a system review from Apex Home Services.

**OG URL:** https://apexhomesupport.com/services/heating/heating-maintenance. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Useful maintenance-versus-repair distinction and offer. Explain confirmed systems and included tasks. Add boiler context/link only if applicable; do not expand scope by assumption.

**Main words:** 414. **ALT:** 3 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 18 inbound source pages; 7 main-content sources; 0 observed broken targets; not orphaned. **Schema:** Service; JSON parsed; county scope/provider identity need review.

**Main heading sequence:** H1: Heating Maintenance ? H2: Start with the full picture. ? H3: Reasons to request service ? H2: Clarity at every step. ? H3: Understand the issue ? H3: Inspect the relevant system ? H3: Explain the findings ? H3: Review service options ? H3: Perform approved work ? H2: Keep exploring. ? H3: Furnace Repair ? H3: AC Maintenance ? H3: Heat Pumps ? H2: Broad equipment familiarity. ? H3: HVAC ? H2: Across five Northeast states. ? H2: Useful context before you book. ? H2: Book heating maintenance service.

**Main images:** heating-2-card.jpg ? eager/default; ALT: Apex technician connecting refrigerant gauges to an outdoor heat pump unit

**Overall:** Needs high-priority content/identity work; technical tags present. **Issues:** OP-02, OP-03, OP-05, OP-08, OP-10, OP-11, OP-20, OP-22, OP-23, OP-24, OP-27, OP-29.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/services__heating__heating-maintenance.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 18. https://apexhomesupport.com/services/heating/boiler-repair

**Type:** Service detail. **Primary keyword:** boiler repair. **Intent:** Transactional repair / symptom investigation.

**Secondary keywords:** boiler not heating; boiler cycling; boiler leak; boiler inspection.

**Title (43 characters):** Boiler Repair Services | Apex Home Services

**Description (133 characters):** Explore boiler repair service from Apex Home Services, including common boiler heating concerns and what a service visit may involve.

**Canonical:** https://apexhomesupport.com/services/heating/boiler-repair

**OG title / description:** Boiler Repair Services / Explore boiler repair service from Apex Home Services, including common boiler heating concerns and what a service visit may involve.

**OG URL:** https://apexhomesupport.com/services/heating/boiler-repair. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Explicit boiler intent and symptoms. Copy resembles furnace repair, image is a heat pump and only heating hub links contextually. Add verified boiler-specific scope, imagery and relevant inbound links.

**Main words:** 418. **ALT:** 3 images; 0 missing ALT; 1 appropriate decorative logo ALT; remaining ALT descriptive. **Linking:** 18 inbound source pages; 1 main-content sources; 0 observed broken targets; not orphaned. **Schema:** Service; JSON parsed; county scope/provider identity need review.

**Main heading sequence:** H1: Boiler Repair ? H2: Start with the full picture. ? H3: Reasons to request service ? H2: Clarity at every step. ? H3: Understand the issue ? H3: Inspect the relevant system ? H3: Explain the findings ? H3: Review service options ? H3: Perform approved work ? H2: Keep exploring. ? H3: Furnace Repair ? H3: Heating Maintenance ? H2: Broad equipment familiarity. ? H3: HVAC ? H2: Across five Northeast states. ? H2: Useful context before you book. ? H2: Book boiler repair service.

**Main images:** heating-card.png ? eager/default; ALT: Apex technician servicing an outdoor HVAC heating unit with the access panel open

**Overall:** Needs high-priority content/identity work; technical tags present. **Issues:** OP-02, OP-03, OP-05, OP-08, OP-10, OP-11, OP-19, OP-20, OP-22, OP-23, OP-24, OP-25, OP-27, OP-29.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/services__heating__boiler-repair.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

### 19. https://apexhomesupport.com/reviews

**Type:** Review archive. **Primary keyword:** Apex Home Services reviews. **Intent:** Branded commercial trust investigation.

**Secondary keywords:** customer experiences; verified customer reviews; Apex appliance repair feedback.

**Title (37 characters):** Customer Reviews | Apex Home Services

**Description (97 characters):** Read approved customer feedback about service experiences coordinated through Apex Home Services.

**Canonical:** https://apexhomesupport.com/reviews

**OG title / description:** Customer Reviews / Read approved customer feedback about service experiences coordinated through Apex Home Services.

**OG URL:** https://apexhomesupport.com/reviews. **OG image:** https://apexhomesupport.com/opengraph-image. **Twitter image:** https://apexhomesupport.com/twitter-image?1de2661a8bf35528.

**Content/intent assessment:** Three published entries; authenticity not independently verified. Archive adds dates/full text but little context. Explain verification, check duplicate photos and improve discovery. Do not fabricate testimonials or assume aggregate-rating eligibility.

**Main words:** 63. **ALT:** 4 images; 0 missing ALT; 1 appropriate decorative logo ALT; 2 generic review ALT. **Linking:** 1 inbound source pages; 1 main-content sources; 0 observed broken targets; not orphaned; omitted from sitemap. **Schema:** None; absence is not invalid syntax.

**Main heading sequence:** H1: What customers say

**Main images:** 17aff1e9-4516-4274-95a8-a3f7e8d1eb07.jpg ? lazy; ALT: Customer review photo / 8a881e6c-1441-4b84-a2dc-6ec1616752c9.jpg ? lazy; ALT: Customer review photo

**Overall:** Usable foundation; targeted improvements pending. **Issues:** OP-02, OP-11, OP-15, OP-16, OP-18, OP-26.

**Evidence:** [HTML](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/html/reviews.html) and matching URL in [pages.json](docs/audits/on-page-seo-2026-11-13/pages.json).

## Decoded image response inventory

These are downloaded response dimensions, not CSS display sizes or declared original sizes. Per-page loading/sizing/ALT appears above and in pages.json. All returned 200. Two OG entries differ by a cache query string.

| Source | Actual pixels | Format | Response bytes | Evidence |
|---|---|---|---|---|
| /brand/apex-mark-colored.png | 96?96 | webp | 2828 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/28-ad8939466723.webp) |
| /images/real/appliance-refrigerator-card.jpg | 1121?1403 | webp | 73996 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/44-2f865c8ac74f.webp) |
| /images/real/ac-cleaning-card.jpg | 1200?1800 | webp | 122142 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/33-de53cba084f9.webp) |
| /images/real/heating-2-card.jpg | 1086?1448 | webp | 324252 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/31-b93ceb3cc9a9.webp) |
| /images/real/water-heating.jpg | 1086?1448 | webp | 85774 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/30-3efba7b266ac.webp) |
| /images/real/appliance-oven-card.jpg | 1200?1600 | webp | 184778 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/36-862ac75667ff.webp) |
| review-media/17aff1e9-4516-4274-95a8-a3f7e8d1eb07.jpg | 2560?1920 | webp | 592312 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/125-22ee6be36198.webp) |
| review-media/8a881e6c-1441-4b84-a2dc-6ec1616752c9.jpg | 2560?1920 | webp | 592312 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/125-01c7933c42e9.webp) |
| /images/real/appliance-oven-card-wide.jpg | 1200?545 | webp | 87616 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/41-1cc424358824.webp) |
| /images/real/heating-2-card-wide.jpg | 1086?494 | webp | 67218 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/36-dba9db1aeaeb.webp) |
| /images/real/water-heating-wide.jpg | 1086?494 | webp | 28306 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/35-417619a50750.webp) |
| /images/real/before-hvac-maintenance.jpg | 960?1280 | webp | 127536 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/40-46251bc407bf.webp) |
| /images/real/after-hvac-maintenance.jpg | 1920?2560 | webp | 593934 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/39-dc2090d04ec1.webp) |
| /images/real/before-appliances.jpg | 960?1280 | webp | 77988 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/34-a4e19f975286.webp) |
| /images/real/after-appliances.jpg | 960?1280 | webp | 76586 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/33-df055e9c7509.webp) |
| /images/real/ice-maker-replacement-before.jpg | 960?1280 | webp | 57658 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/45-407368f8b4a1.webp) |
| /images/real/ice-maker-replacement-after.jpg | 960?1280 | webp | 52512 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/44-f04d7f1bc75e.webp) |
| /images/real/refrigerator-control-board-before.jpg | 960?1280 | webp | 95770 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/50-e4d11a2ba595.webp) |
| /images/real/refrigerator-control-board-after.jpg | 960?1280 | webp | 93906 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/49-773f0c785fce.webp) |
| /brand/apex-mark-white.png | 96?96 | webp | 1894 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/26-cf8e2db66e9f.webp) |
| /images/real/heating-card.png | 1086?1448 | webp | 266574 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/29-e23e0fa8e1c3.webp) |
| https://apexhomesupport.com/opengraph-image?ba0a4ac7c10e07d1 | 1200?630 | png | 73958 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/60-a97fb5e3ace7.png) |
| https://apexhomesupport.com/twitter-image?1de2661a8bf35528 | 1200?630 | png | 73958 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/58-c076cabbe2c4.png) |
| https://apexhomesupport.com/opengraph-image | 1200?630 | png | 73958 | [asset](https://github.com/Mr-Cullen-1/apex-solution/blob/3bb9ed1d8e9141e3c18f2115cac75eb4475cc983/docs/audits/on-page-seo-2026-11-13/assets/43-7fffb49e2b29.png) |
