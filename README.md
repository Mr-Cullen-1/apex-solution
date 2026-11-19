# Apex Home Services

Production-oriented Next.js application for the Apex Home Services website. The internal repository name remains `apex-solution`.

## Start locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validate

```bash
npm run lint
npm run typecheck
npm run build
```

Project decisions and scope live in [`docs/PROJECT.md`](docs/PROJECT.md), [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), and [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Tests and evidence

Run the dependency-free domain suites with `node --test tests/booking-model.test.cjs tests/service-search.test.cjs`. Against a running local production build, set `QA_BASE_URL` and run `node --test tests/audit-seo.test.cjs`.

Browser scripts use an isolated local tool installation, not application dependencies:

```powershell
npm.cmd install --prefix node_modules/.qa-tools --no-package-lock --ignore-scripts playwright-core axe-core
$env:QA_BROWSER = 'C:\path\to\chromium\chrome.exe'
$env:QA_BASE_URL = 'http://127.0.0.1:3127'
$env:QA_AXE = (Resolve-Path 'node_modules/.qa-tools/node_modules/axe-core/axe.min.js').Path
node tests/browser-qa.cjs
node tests/browser-links.cjs
node tests/browser-interactions.cjs
node tests/audit-browser.cjs
```

Use an installed Chromium executable for `QA_BROWSER`. New generated output defaults to ignored `docs/qa/current/`; `QA_OUTPUT` overrides the output folder for page, link, interaction and audit-browser scripts. Run page QA before link QA with the same output folder. Performance uses `QA_PERFORMANCE_OUTPUT`. The Python HTTP checker accepts an output **directory** as its second argument.

For focused page/performance runs, `QA_ROUTES` accepts comma-separated paths. Performance also accepts `QA_PROFILES` (`desktop,mobile-throttled`) and `QA_SAMPLES` (default `3`), and records LCP candidates plus resource timings.

Run `node tests/reviews-health.cjs` separately for a read-only check of the configured Supabase review feed and signed media access. It prints only counts/statuses and needs network access; `EACCES` in a restricted runner is not proof of a broken database. See the [19 November investigation](docs/audits/reviews-performance-2026-11-19.md).

The 17 November audit source and latest QA evidence are retained. Older generated screenshots and crawl copies can be recovered from commit `3bb9ed1`; their reports remain in the working tree. Cleanup decisions are recorded in [`docs/audits/workspace-cleanup-2026-11-17.md`](docs/audits/workspace-cleanup-2026-11-17.md).
