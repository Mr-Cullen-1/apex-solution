# Article 1 implementation and validation report

> Historical baseline report. Article 1 was subsequently enhanced with images, source links and winter safety guidance. See the [current enhancement and validation report](ARTICLE_1_ENHANCEMENT_REPORT.md) for its final draft state.


Validated locally on 26 November 2026. **Article 1 remains `draft`. No commit, deployment or publication was performed.**

## Delivered content

- [Content brief, full H2/H3 outline, SEO specification, research sources and asset checklist](ARTICLE_1_CONTENT_BRIEF.md).
- Typed implementation: `src/content/resources/furnace-not-heating.ts`, imported only into the first record in `src/content/resources/articles.ts`.
- 1,777 words across body headings, paragraphs, warning callout, checklist and FAQ questions/answers; excludes H1, excerpt, navigation and shared template CTA. Nine-minute estimate at 200 words/minute, rounded up.
- 42 body blocks, including 14 headings (seven numbered problem H3s), and five FAQs. Exact requested H1 and slug preserved.
- Prepared SEO title: **Furnace Not Heating? 7 Problems & Safe Next Steps** (49 characters).
- Prepared meta description: **Furnace not heating? Explore seven common causes, safe homeowner checks, urgent warning signs, and when to contact a local professional for furnace repair.** (155 characters).
- Existing canonical derivation, category, related-service URLs and related-article relationship preserved. All five requested secondary keywords included.
- Draft status and private editorial note retained; author, dates and featured image remain null. Featured-image alt text remains empty until an actual image is approved.

## Scope preservation

The other four draft records match their pre-task SHA-256 serialized-record baselines. Their source substring beginning at the frozen-pipes record also matches its baseline exactly. The existing broad resource test was adjusted only to allow Article 1 to have content while remaining private.

Application changes are confined to Article 1's content module and first registry entry. Supporting changes are article tests, the local preview generator, this editorial documentation and updated current-state notes in `docs/RESOURCES.md`. No production component, route, schema, metadata utility, sitemap implementation, dependency or environment setting changed for this task. Earlier uncommitted Resources infrastructure remains in the working tree.

## Verification results

| Check | Result |
| --- | --- |
| `npm.cmd run lint` | Passed, exit 0; final run includes the new preview generator. |
| `npm.cmd run typecheck` | Passed, exit 0. |
| `npm.cmd run build` | Passed, exit 0; 41 static pages generated. No article draft path generated. |
| `node --test tests/*.test.cjs` | 63 passed, 0 failed, 0 skipped. Includes existing booking, Quo, analytics, legal, SEO, resource and service-search tests plus four Article 1 tests. |
| `node tests/article-1-preview.cjs` | Passed: six HTTP checks and four responsive browser layouts. |
| Public article URL on rebuilt local production server | `/resources/furnace-not-heating-common-problems` returns **404**, has noindex, and contains neither draft title/body nor BlogPosting markup. |
| Sitemap | HTTP 200; Article 1 absent. Existing tests also confirm all draft resource entries remain excluded. |
| Listing/category | `/resources` and `/resources/category/hvac-heating` return 200 without Article 1. |
| Internal service links | Furnace repair and heating maintenance routes both return 200. |
| Metadata and schema | Actual draft helper remains noindex and produces no Article schema; route rejects draft metadata. Test-only candidate with explicit fixture author/date/image passes existing publication validation and preserves prepared title, description, canonical and BlogPosting headline. No fixture prerequisites are saved in content. |
| Draft isolation | All five entries still draft; public selector and related-article filtering exclude them. Other four hashes and source text unchanged. |
| Internal preview | Actual Article 1 content rendered in real ResourceArticle/ResourceContent/ResourceImage/ResourceCTA components using compiled site CSS. Explicit preview-only author/date labels; booking disabled; no JSON-LD. |
| Responsive checks | Chrome 158.0.8127.38 at 320, 390, 768 and 1440 px; one exact H1, all 14 content heading targets, all five FAQs keyboard-operable, contents link activates correctly. |
| Layout/accessibility | No horizontal overflow or browser errors; no axe WCAG 2 A/AA or 2.1 AA violations in tested preview states. Automated checks do not establish complete accessibility conformance. |
| Image behavior | No article assets were supplied or invented. Existing decorative placeholder renders. Actual photography, crops and image loading cannot be validated until assets exist. |
| Independent editorial/code review | No Critical/Important findings. Addressed two minor findings: explicitly switch a portable heater off when leaving the room, and assert all five records exist before checking four unchanged hashes. Reviewed all 12 linked primary sources. This does not substitute for qualified HVAC approval. |

Local production server command: `npm.cmd run start -- --hostname 127.0.0.1 --port 3127`. Tests default to that address or accept `QA_BASE_URL`. This report describes local verification, not a deployed-site check.

## Review artifacts

Generated outside `public`, under `output/article-1/`:

- `internal-preview.html`: self-contained styling/font and rendered draft; no public route or server-side preview endpoint.
- `article-draft.md`: readable article exported directly from the typed content, including FAQs.
- `verification.json`: machine-readable HTTP/layout outcomes, browser version and word count.
- `preview-320.png`, `preview-390.png`, `preview-768.png`, `preview-1440.png`: full-page screenshots.
- `preview-header-*.png`: header/detail crops for visual inspection.
- `baseline.json`: pre-edit other-draft hashes.

The local component preview uses test-only labels to satisfy the published template's author/date display. It keeps the real draft status, omits all structured data and disables booking; it is not a production publishing preview. Public navigation links in the standalone file are not a substitute for browsing the locally running application. Do not place these artifacts in the public asset directory.

## Remaining editorial and technical issues

1. Obtain a qualified HVAC/safety review and approved author before publication. Research and independent editorial review have been performed, but no technician credential or sign-off is claimed.
2. Supply a licensed, accurate featured image and verify its actual dimensions, alt text and crop. Optional furnace-airflow diagram and accessible-filter photo are specified in the brief; no missing files are referenced in production content.
3. Keep publication/update dates unset and retain `draft` until a separately authorized publishing step. The existing gate intentionally blocks accidental publication with missing prerequisites and an editorial note.
4. Source citations live in the editorial brief because the existing public body validator accepts only verified internal links. No validator expansion was introduced.
5. The build emitted existing `[reviews_fetch_failed] TypeError: fetch failed` warnings while prerendering review-dependent pages. The build still succeeded. This unrelated external-review fetch was not repaired or represented as validated.

No unresolved Article 1 lint, TypeScript, automated-test or local-render failure remains.
