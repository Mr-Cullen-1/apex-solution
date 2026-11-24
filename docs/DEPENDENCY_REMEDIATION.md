# Dependency advisory remediation — November 24, 2026

Baseline: Next 16.3.4. Full npm audit: 1 Critical, 4 High, 7 Moderate vulnerable-package entries. These are dependency advisories, not proof of exploitation.

| Package/advisory class | Reviewed minimum safe path | Selected lockfile | Applicability |
|---|---|---|---|
| Next `next/og` RCE GHSA-vcvr-r3jv-pc5j | 16.3.6 for this advisory | 16.4.6 | Repo OG image uses local static content; attacker-controlled SVG/style precondition not established |
| Next image SSRF GHSA-cjq9-62q9-8jv4 | 16.3.8 | 16.4.6 | Image optimization and remote review images used; broad Supabase pattern reviewed separately |
| Next image RCE GHSA-2464-fhr4-w9xw | 16.4.1 and patched sharp | 16.4.6 / sharp 0.35.5 | Actual deployed image-library/platform preconditions unverified |
| Next Server Actions DoS GHSA-p3m5-59mp-jv5r | 16.4.1 | 16.4.6 | App Router with Server Actions, relevant attack surface |
| Next typed-array cache RCE GHSA-673q-mjm6-r5xr | 16.4.1 | 16.4.6 | Vulnerable package present; specific cached typed-array return precondition not established |
| sharp librsvg GHSA-wq5f-xc86-pv6w | 0.35.5 | 0.35.5 | Transitive image processing dependency |
| source-map-js DoS GHSA-68fv-2mgg-jv7q | 1.2.2 | 1.2.4 | Build/CSS source-map processing; untrusted source-map runtime exposure not established |
| brace-expansion recursion DoS GHSA-qhr7-859c-m2p7 / GHSA-6j4f-fj2g-mc7p | 1.x >=1.1.20; affected 4.x path >=5.0.11 | 1.1.22; new compatible lint dependency tree | Development tooling glob expansion |
| zod collection memory DoS GHSA-mrhx-c7xc-m3w5 | 4.6.6 | 4.6.7 | Transitive React Hooks lint tooling |

Next 16.4.5 is the first release outside all ranges in this scan (later Moderate findings include <=16.4.4); 16.4.6 is the selected current patch in that same minor. eslint-config-next is matched exactly. React, app architecture and Supabase packages are unchanged. Compatible transitive updates also removed the minimatch/TypeScript-ESLint Moderate chain; no forced dependency override or major application migration was used.

Final full `npm audit --json`: **0 vulnerabilities**, November 24. Re-run at independent audit/deployment time. This is a local lockfile result, not evidence that production has been patched. Package manager blocked the pre-existing install scripts for @google/genai, protobufjs and unrs-resolver under its existing policy; none were newly approved.

Sources: npm registry advisory responses and [GitHub Advisory Database](https://github.com/advisories). Detailed advisory IDs above identify each Critical/High source. See remediation report for lint/typecheck/build/regression evidence.
