# Workspace cleanup — 17 November 2026

The user authorized removing unnecessary files and committing/pushing the reviewed result. This extends the earlier local-only remediation scope.

## Removed

- `src/components/ui/hero-image-carousel.tsx`: no imports or uses in application/tests; current hero rendering is independent.
- `src/content/index.ts`: unused re-export entry point; consumers import their content modules directly. TypeScript import resolution and source searches were checked before removal.
- `docs/BUSINESS_INPUT_FORM_UZ.md`: rejected Markdown questionnaire; the requested Russian client/developer questions remain in the conversation. `BUSINESS_FACTS.md` remains the project fact register.
- Exact duplicate logo/photo source files: verified with SHA-256 immediately before deletion; the matching retained path is recorded in the JSON manifest. Unique originals, current public images and resized application icons remain.
- Generated 16 November QA screenshots/contact sheets and 13 November downloaded HTML, image and CSS crawl copies. These tracked artifacts remain recoverable from commit `3bb9ed1d8e9141e3c18f2115cac75eb4475cc983`. Structured results and historical reports remain; Markdown evidence links point to that immutable revision where files were removed.

The file-by-file bulk-deletion manifest, byte counts and retained duplicate paths are in `workspace-cleanup-2026-11-17.json`: 380 files totaling 91,032,929 bytes (about 91 MB). The three text/source deletions above are additional, for 383 removed local files. The superseded questionnaire was untracked; 382 deletions are recorded by Git. This is working-tree space removed, not a claim that existing Git history becomes smaller.

## Retained and output rules

- Current runtime code, approved public assets, unique source media, tests, migrations and configuration remain. Unused-file detection does not treat Next route conventions as dead code.
- The user-supplied `apex-audit/` source, current remediation plan, business facts, measurement contract and 17 November evidence remain.
- `qa-runs/` contains local integration fixtures and exact-record cleanup instructions. It is retained locally and ignored, rather than published with request identifiers or discarded without verifying cleanup state. No SQL was executed.
- Fresh browser output now defaults to ignored `docs/qa/current/`; archived results are not overwritten by the default commands. Browser dependencies are local under ignored `node_modules/.qa-tools`; no application dependency was added.
- `.env.local` is unchanged and excluded from Git. No credentials are part of this cleanup.

## Validation and Git delivery

The delivery branch is `fix/audit-remediation-2026-11-17`; no merge to `main` or explicit production deployment is included. A hosting provider may independently create a preview when the branch is pushed. Remote `main` was checked and matched the local base `3bb9ed1` before delivery.

Fresh checks on the cleaned checkout:

| Check | Result |
|---|---|
| `npm.cmd run lint` | Passed |
| `npm.cmd run build` | Passed; 33/33 static outputs |
| `npm.cmd run typecheck` | Passed after the production build |
| Booking model + service search | 7/7 passed |
| Rendered SEO suite | 5/5 passed against local production server on port 3137 |
| HTTP validation | 19 public pages, 12 supporting checks, sitemap and two invalid API requests passed |
| Browser regression | All 5 viewports passed: narrow, mobile, landscape, tablet, desktop; all valid submissions intercepted |
| Asset integrity | All 23 source media/brand path references resolve; 11 retained duplicate counterparts exist |
| File integrity | All 380 manifest targets are absent; unique original photos and public runtime assets remain |
| Credential pattern scan | 316 text files checked; no private key, API-key or JWT pattern matches; `.env.local`, local integration fixtures and fresh QA output are ignored |
| Whitespace | `git diff --check` passed |

The existing review-fetch failure still occurs during the build; the established fallback renders successfully. Live review retrieval, real lead persistence/notification delivery and deployed behavior are not certified by these local checks. No valid lead was sent. Current cleanup regression details are saved in `docs/qa/2026-11-17/cleanup-validation.json`; screenshots from this repeat run stay under ignored `docs/qa/current/`.
