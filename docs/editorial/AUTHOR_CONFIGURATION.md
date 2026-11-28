# Apex Blog organization author

Updated 26 November 2026. All five articles remain drafts; no publication dates were assigned.

- Approved author: **Apex Home Services**, type **Organization**.
- Shared configuration: src/content/resources/author.ts, derived from the existing company name and Organization identity in src/content/organization.ts.
- Reusable display: src/components/resources/resource-author.tsx, used by the shared article template to display **By Apex Home Services**.
- BlogPosting author includes type, name and the same canonical /#organization ID as publisher. OrganizationStructuredData uses that centralized identity too. No personal bio, credentials, certifications or additional business claims were added.
- Article 1 preview uses its actual approved author. Date remains not scheduled, booking remains disabled, and draft schema remains suppressed.
- Other four records are unchanged apart from the author field, verified against their previous serialized hashes with only author and environment host normalized.

## Verification

- npm run lint: passed.
- npm run typecheck: passed.
- npm run build: passed; 41 static pages. Existing reviews_fetch_failed network warnings remain unrelated to author configuration.
- All 68 regression tests passed across the complete suite and targeted HTTP rerun: the first run had 63 passes and five connection-refused failures because the local server was stopped for rebuilding; all five audit-seo tests passed after restart.
- Author/schema regression: all five drafts share the approved author; rendered Article 1 BlogPosting author and publisher resolve to the same existing Organization entity. Publication-shape tests use in-memory fixtures only; source records remain drafts.
- node tests/article-1-preview.cjs: passed 10 HTTP checks and four layouts (320, 390, 768 and 1440 pixels). The actual approved byline appears exactly once at every width, with no unassigned author label, overflow, accessibility violations or browser errors. Reserved image space and zero image layout shift verified.
- Public Article 1 URL: HTTP 404, noindex, no draft content or BlogPosting; excluded from sitemap and resource listing.
- Internal preview: output/article-1/internal-preview.html; screenshots and verification.json in the same directory. Mobile header visually inspected; all four images also load in the offline HTML.
- git diff --check: passed.

Checks used the local production build at http://127.0.0.1:3127. The Organization ID uses the existing configured site URL (locally http://localhost:3000/#organization); no environment values or deployment settings changed. No hosted rich-results tool or live production check was performed.

## Remaining publication requirements

Qualified HVAC/safety editorial approval, final image approval and an actual authorized publication date are still required for Article 1. The other articles still need their content and assets. Author approval is complete. No publication, commit or deployment is part of this change.
