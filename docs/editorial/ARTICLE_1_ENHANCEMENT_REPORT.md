> Author update, 26 November 2026: Apex Home Services is now the approved Organization author for all five drafts. Earlier unassigned-author observations below are historical; see [author configuration](AUTHOR_CONFIGURATION.md).

# Article 1 — final editorial, visual and SEO enhancement

Completed locally on 26 November 2026. **Status remains `draft`; no publication, commit or deployment.** This report supersedes the earlier 1,777-word draft validation report. Implementation and local QA are complete; publication prerequisites are listed below.

## 1. Editorial improvements

Preserved the exact H1, slug, SEO title, meta description, seven numbered problems, five FAQs, service relationships and independent-provider positioning. Tightened repeated explanations in the introduction, thermostat, power, fuel, airflow, repair/replacement and FAQ copy instead of replacing the article wholesale.

Added **“Winter check: snow and ice around outdoor vents”** as an H3 under the existing safe-checks H2. It explains model-dependent outdoor intake/exhaust arrangements, possible operation/CO risks, ground-level observations, cautious removal of loose surrounding snow only when safely accessible, and professional escalation. It explicitly prohibits roofs, ladders, chipping ice, tools inside vents and vent disassembly. Emergency instructions take priority over troubleshooting.

Expanded the CO paragraph with alarm placement/battery-backup and annual inspection guidance, linked to CPSC. The portable-heater paragraph now explicitly excludes extension cords and power strips. The original danger-first callout, professional repair boundaries and emergency-services-over-booking instructions remain intact.

Added contextual government citations and a concise **Sources and further reading** section near the end. No statistics, dates, credentials, pricing, guarantees or response-time claims were invented. All image captions disclose AI generation; illustrations do not claim to document Apex work.

## 2. Updated word count

**1,795 words**, with a **nine-minute** reading estimate. Count includes body headings, paragraphs, checklist, warning callout, inline image captions, source-list text and FAQ questions/answers. It excludes the H1, excerpt, hero caption, navigation and shared template CTA. The enhancement adds only 18 net words relative to the earlier body count while adding the required winter guidance and sources.

## 3. Generated assets and exact paths

Four original images were generated using the built-in `image_gen` capability and inserted into the article. No image-generation limitation or missing asset remains. Original PNGs are 1672 × 941; all integrated WebPs are **1600 × 900**. Source files were copied into the existing public asset folder, and the installed Sharp dependency performed conversion to WebP. No dependency, storage service or alternate image architecture was added.

All paths below are relative to the project root:

| Image | Original asset | Integrated asset | WebP size |
| --- | --- | --- | --- |
| Featured furnace | `public/resources/furnace-not-heating-common-problems/residential-gas-furnace-hero-original.png` | `public/resources/furnace-not-heating-common-problems/residential-gas-furnace-hero.webp` | 111,066 bytes |
| Filter comparison | `public/resources/furnace-not-heating-common-problems/dirty-and-clean-furnace-air-filters-original.png` | `public/resources/furnace-not-heating-common-problems/dirty-and-clean-furnace-air-filters.webp` | 183,644 bytes |
| Winter vent | `public/resources/furnace-not-heating-common-problems/snow-blocked-furnace-intake-vent-original.png` | `public/resources/furnace-not-heating-common-problems/snow-blocked-furnace-intake-vent.webp` | 156,520 bytes |
| Professional inspection | `public/resources/furnace-not-heating-common-problems/professional-furnace-inspection-original.png` | `public/resources/furnace-not-heating-common-problems/professional-furnace-inspection.webp` | 83,360 bytes |

The four integrated source WebPs total **534,590 bytes**, before responsive Next optimization. PNG originals are preserved but are not requested by the article. Exact prompts, generation method and review notes: [Image prompts and provenance](ARTICLE_1_IMAGE_PROMPTS.md). Dimensions and SHA-256 hashes: `output/article-1/image-manifest.json`.

## 4. Image placement map

| Image | Article placement | Rendering behavior |
| --- | --- | --- |
| Residential furnace | Featured hero after title/excerpt/author metadata; also prepared for future card/Open Graph/Twitter use | Existing `ResourceImage`, responsive `sizes`, 16:9 reserved space, hero preload. |
| Dirty/clean filters | After the safe replacement paragraph in problem 2 | Existing image block with visible caption, responsive sizing and lazy loading. |
| Snow-blocked vent | After the new winter vent safety paragraphs in the safe-checks section | Existing image block; caption identifies a hazard illustration, not an installation guide; lazy loading. |
| Professional inspection | After the service-escalation paragraph under “When should you stop and call a professional?” | Existing image block; caption disclaims an Apex employee/actual service visit; lazy loading. |

An optional `featuredImageCaption` field was added to the existing Resource type and rendered as a semantic figcaption in the existing template. It is assigned only to Article 1. No second content architecture or public preview route was introduced.

## 5. Exact alt text

| Asset | Alt text |
| --- | --- |
| Hero | AI-generated illustration of a residential gas furnace with closed panels and connected ductwork in a clean basement. |
| Filters | AI-generated comparison of a dust-clogged pleated furnace filter beside a clean replacement filter. |
| Winter vent | AI-generated winter scene showing snow partially blocking a downward-facing furnace intake beside a home's exterior wall. |
| Inspection | AI-generated illustration of an HVAC professional using a flashlight and handheld instrument beside a closed furnace. |

The images were visually inspected individually and in the rendered preview. They are illustrative, not technical installation diagrams or evidence of provider qualifications. Final qualified HVAC/editorial image approval is still required.

## 6. External sources and paragraph support

Each source appears once contextually and once in the source list: **eight external anchors across four unique URLs**.

| Source | Contextual support and placement |
| --- | --- |
| [CPSC: Carbon Monoxide Fact Sheet](https://www.cpsc.gov/safety-education/safety-guides/carbon-monoxide/carbon-monoxide-fact-sheet) | CO warning paragraph: invisible/odorless hazard, possible symptoms, fresh-air/emergency response, alarm guidance and annual professional inspection. Also supports the retained early emergency callout. |
| [CPSC: Winter Weather Safety Tips](https://www.cpsc.gov/Newsroom/News-Releases/2025/As-Winter-Weather-Impacts-Millions-CPSC-Issues-Safety-Tips-to-Help-Families-Prevent-Carbon-Monoxide-Poisoning-and-Fires) | Winter vent subsection: snow around exterior fuel-burning appliance vents and preventing CO buildup. Ground-level/no-dismantling limits are conservative editorial boundaries, not a claimed verbatim CPSC procedure. |
| [CPSC: Keep Warm and Safe This Winter](https://www.cpsc.gov/Newsroom/News-Releases/2026/Keep-Warm-and-Safe-This-Winter-Tips-for-Using-Generators-Furnaces-and-Space-Heaters) | Temporary warmth paragraph: three-foot clearance, direct wall outlets, no extension cords/power strips and turning heaters off for sleep. Leaving-the-room advice remains supported by the Red Cross reference in the original brief. |
| [U.S. Department of Energy: HVAC Proper Installation of Filters](https://bsesc.energy.gov/energy-basics/hvac-proper-installation-filters) | First paragraph of problem 2: clogged filters restrict airflow. Filter access/placement context; model-specific replacement/shutdown instructions remain governed by the owner's manual. |

All four exact URLs opened successfully through the web browsing tool with readable relevant content on 26 November 2026; the independent reviewer also checked them. Restricted shell `fetch` attempts returned transport errors, so no shell HTTP-200 result is claimed. Verification methods and failed shell attempts are recorded in `output/article-1/source-verification.json`.

`src/content/resources/sources.ts` is an exact-URL editorial allowlist. The existing inline link type is reused. Publication validation accepts those four HTTPS destinations and continues rejecting arbitrary external URLs, unsafe protocols, misleading hosts, query variants and draft article links. Source anchors are underlined, open in a new tab with `rel="noopener noreferrer"`, and include screen-reader new-tab notice. Internal links retain their existing behavior.

## 7. Internal links and conversion

Both requested service routes exist in the repository's completed service catalog and return **HTTP 200 on the rebuilt local production server**:

- `/services/heating/furnace-repair`
- `/services/heating/heating-maintenance`

The final article paragraph retains those links and explains that Apex connects homeowners with independent local professionals. Coverage and appointment availability need confirmation. Gas/CO emergencies are directed to emergency services, not the booking flow. The existing shared ResourceCTA remains the final booking action; no fake urgency, credential claim or guarantee was added.

The actual shared Book Now button on `/resources` opened its real modal and closed with Escape at each tested viewport. No form was submitted. The standalone draft preview deliberately disables booking. Verification is local; no deployed-site availability claim is made.

## 8. SEO and metadata status

| Field | Final state |
| --- | --- |
| H1 | Why Is My Furnace Not Heating? 7 Common Problems and When to Call a Professional |
| Slug | `furnace-not-heating-common-problems` |
| SEO title | Furnace Not Heating? 7 Problems & Safe Next Steps |
| Meta description | Furnace not heating? Explore seven common causes, safe homeowner checks, urgent warning signs, and when to contact a local professional for furnace repair. |
| Canonical | Existing `siteUrl` derivation preserved. Local configuration resolves to `http://localhost:3000/resources/furnace-not-heating-common-problems`; production environment configuration was not inspected or changed. |
| Open Graph / Twitter | Existing helper uses the new hero's absolute URL, 1600 × 900 dimensions and exact alt text when eligible for publication; verified with an explicit test-only publication fixture. |
| Article schema | Existing BlogPosting helper points to the actual generated hero, matching H1/canonical and centralized publisher. No real author/date assigned. |
| Breadcrumb schema | Existing visible breadcrumb list and generated BreadcrumbList agree for Article 1 in the test-only published fixture. |
| Actual draft route | 404/noindex; no Article schema, draft title or draft body in public output. No public draft metadata endpoint added. |
| Meta keywords | Not added. |

The test-only candidate supplies clearly synthetic author/date prerequisites in memory; it does not mutate the real draft or register a new public route. Production metadata correctness still requires verifying the real production `NEXT_PUBLIC_SITE_URL` at the later release step.

## 9. Responsive, accessibility and visual QA

Chrome 158.0.8127.38, viewports **320, 390, 768 and 1440 px**, using the rebuilt local production app's loaded CSS and fonts and the actual article server components rendered only in browser memory.

| Check | Result |
| --- | --- |
| Image loading | All four images decoded successfully at every viewport through real `/_next/image` URLs. All four WebP source asset URLs also returned 200. |
| Responsive sizes | Hero and inline `sizes`/`srcset` present; browser-selected optimization widths recorded in verification JSON. |
| Layout stability | Image wrapper dimensions identical before/after loading; measured pre-interaction layout shift **0** in each final production-style preview. |
| Lazy loading | All three below-fold image elements use `loading="lazy"`; hero uses existing preload behavior. |
| Overflow | None at any tested width. |
| Headings | One exact H1; 16 uniquely targeted body headings, with seven numbered problem H3s and the winter H3 under the safe-checks H2. |
| Keyboard interaction | All five FAQ disclosures open/close; TOC anchor activates; actual shared booking modal opens/closes without submission. |
| Source anchors | All eight have exact approved destinations, safe new-tab attributes and accessible notice. |
| Accessibility | Zero tested axe WCAG 2 A/AA and 2.1 AA violations. This is automated coverage, not a full assistive-technology certification. |
| Browser errors | None in final article preview checks. |
| Offline artifact | All four embedded images decode at mobile width without network access. Independent cold-load checks at 390, 768 and 1440 px measured CLS **0** with embedded fonts/images and the font preload. |
| Visual inspection | Original generated subjects plus desktop/mobile header and winter-section screenshots reviewed; readable spacing, retained hierarchy and correct image proportions. |

Initial harness failures were investigated and corrected. Lazy image decoding was attempted before the browser completed loading; the harness now waits for completion before decoding. Replacing the entire test document also introduced a synthetic fallback-font swap (0.01396 CLS). The final QA inserts the article into the already loaded production font/CSS environment, preserving the actual site styling, instead of changing font-loading behavior or hiding a production failure. The offline export includes the existing font preload and embeds assets; separate cold-load measurements also returned zero CLS at mobile, tablet and desktop widths (`output/article-1/offline-cold-load.json`).

## 10. Commands and regression checks

| Command / check | Result |
| --- | --- |
| `npm.cmd run lint` | Passed, exit 0. |
| `npm.cmd run typecheck` | Passed, exit 0. |
| `npm.cmd run build` | Passed, exit 0; 41 static pages, no draft article path generated. |
| `node --test tests/*.test.cjs` | **67 passed**, 0 failed, 0 skipped. Existing tests continue passing. |
| `node tests/article-1-preview.cjs` | Passed: **10 HTTP checks**, four responsive layouts, offline image check, FAQ/TOC/source attributes and shared CTA checks. |
| Other four drafts | All four serialized-record SHA-256 baselines match; source text from the frozen-pipes record onward is unchanged. |
| Independent review | No Critical, Important or Minor defects found in reviewed content, source handling, imagery, type/template compatibility and draft gates. Qualified HVAC approval was not claimed. |
| `git diff --check` | Passed. |

The production build still logs pre-existing `[reviews_fetch_failed] TypeError: fetch failed` messages while prerendering review-consuming pages. They do not fail the build and were not introduced by this article. The unrelated review integration was not modified or represented as live-validated.

## 11. Remaining publication prerequisites

1. Assign a real approved author and obtain qualified HVAC/safety and final editorial/image approval. No credential or professional sign-off has been invented.
2. At a separately authorized publication step, supply the real publication date, clear the editorial note and deliberately change status. Author/dates remain null for this task.
3. Verify the production environment's canonical base URL before release; the inspected local environment intentionally uses localhost. Live deployment configuration and live public URLs were not audited here.
4. Recheck metadata/schema/crops on the eventual published route as part of that authorized release. No image assets are missing and no Article 1 code, test or local rendering failure remains.

## 12. Draft privacy and review artifacts

The public article path still returns **404**; its title/content do not appear in public Resources/category output. It is excluded from sitemap, public selectors, related cards and public Article structured data. **All five articles remain drafts.** No commit, deployment or publication occurred.

Original PNGs and optimized WebPs are under `public/` as requested. They are directly addressable assets if deployed; they are not access-private. The internal article HTML/Markdown, prompts, reports and QA files remain outside `public`.

Review files:

- `output/article-1/internal-preview.html` — portable internal preview with embedded fonts/images; no public route and no booking submission capability.
- `output/article-1/article-draft.md` — current readable article, source links, captions and inline images exported from typed content.
- `output/article-1/verification.json` — measured HTTP, image, layout, accessibility and interaction outcomes.
- `output/article-1/image-manifest.json` and `source-verification.json` — asset hashes/dimensions and source-verification evidence.
- `output/article-1/preview-*.png`, `preview-header-*.png`, `preview-winter-*.png` — final full-page and detail screenshots.
- [Updated content brief and outline](ARTICLE_1_CONTENT_BRIEF.md), [exact image prompts](ARTICLE_1_IMAGE_PROMPTS.md), [Resources workflow](../RESOURCES.md).
