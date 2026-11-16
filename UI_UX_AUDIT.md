# UI/UX audit

16 November 2026. Findings began with source inspection. Local production-build HTTP checks and domain regression tests subsequently passed. Browser interaction, viewport and assistive-technology testing are outstanding because browser control is unavailable. See IMPLEMENTATION_PROGRESS.md for actual verification results and implementation status.

| ID | Page / component | Problem and user impact | Priority | Proposed fix | Validation criterion |
| --- | --- | --- | --- | --- | --- |
| U01 | Home / ServicesGrid | Autoplay hides one of four categories even on desktop; harder to compare | High | Static responsive grid | All four service links present without carousel interaction |
| U02 | All / mobile navigation | Cooling/heating overview and all-services links missing from expanded menu | High | Explicit overview links | Every service hub reachable from mobile menu |
| U03 | All / booking modal | Short-height rules shrink controls and hide appointment disclaimer | High | Scrollable panel, 48px controls, 16px input text | At 320x568 and landscape, every field and disclaimer reachable |
| U04 | All / booking model | Seven punctuation characters pass phone validation | High | Validate US digit count and allowed punctuation | Regression rejects punctuation-only and malformed numbers |
| U05 | All / booking form | No visible service selector | High | Optional category/detail selector, retain incoming context | Selection reaches normalized payload; no selection still permitted |
| U06 | All / booking feedback | Validation errors not linked to inputs; focus stays on submit | High | aria-invalid, described errors, first-error focus; announce outcomes | Keyboard/screen-reader validation and server error flows |
| U07 | Contact / final CTA | Says online submission is disconnected despite request adapter | Medium | Explain request vs confirmed appointment; runtime failures remain explicit | No static disconnected claim; actual failure never claims receipt |
| U08 | Home / hero | Generic Northeast positioning and distracting perpetual badges | Medium | NY-first copy with county coverage qualification; interactive house | Calls and booking precede scene on mobile; no inferred live availability |
| U09 | Shared / focus and buttons | Blue focus outline disappears against blue panels; header controls small | Medium | Two-tone focus indicator; 44px+ compact controls | Visible focus on light/dark surfaces; 320px header fit |
| U10 | Service categories / directory | Placeholder about future pages replaces useful guidance | Medium | Request-preparation content and relevant category booking | Appliance/water-heater pages have concrete next steps |
| U11 | Service templates | Repeated generic headings and dominant photos | Medium | Clear titles, stronger hierarchy, more balanced hero | All 12 category/detail pages retain H1, content, context and CTAs |
| U12 | Home, About, Contact / metadata | Brand repeated in browser title; inherited social titles | Medium | Absolute homepage title, concise route titles, OG-derived Twitter metadata | Local rendered head checked across 19 indexable URLs |
| U13 | Reviews / sitemap | Reviews absent from sitemap | Medium | Include existing public review route | Sitemap includes /reviews once |
| U14 | Home / results | Future-tense introduction despite existing examples | Low | Describe visible work accurately | No invented results/statistics |
| U15 | Authenticated admin and review workflows | Runtime behavior requires authenticated sessions and test data | Open validation | Preserve operational components; inspect source and run checks | Owner/test-session browser pass before release |
| U16 | Admin auth pages / AdminShell | Global skip link points to an absent main-content ID | Medium | Add target IDs to existing main landmarks | Auth HTML contains target; protected shell source has target |

## Route coverage

Public routes covered by page/template inspection: `/`, `/about`, `/brands`, `/contact`, `/service-areas`, `/services`, `/reviews`; categories `/services/appliance-repair`, `/services/cooling`, `/services/heating`, `/services/water-heater-repair`; details `/services/cooling/ac-repair`, `/ac-installation`, `/ac-maintenance`, `/ac-replacement` under that category; `/services/heating/furnace-repair`, `/heat-pumps`, `/heating-maintenance`, `/boiler-repair` under that category.

Supporting route inventory: `/book`, `/review`, `/review/[token]`, `/l/[token]`; `/admin`, `/admin/login`, `/admin/forgot-password`, `/admin/reset-password`, `/admin/change-password`, `/admin/admins`, `/admin/campaign-links`, `/admin/create-request`, `/admin/customers`, `/admin/customers/[id]`, `/admin/requests`, `/admin/requests/[id]`, `/admin/reviews`; APIs `/api/book-now`, `/api/chat`, `/api/reviews`; metadata routes robots, sitemap, manifest and generated social images. These are preserved, not converted into marketing pages. Inventory does not imply successful authenticated interaction testing.

The [route source inventory](docs/audits/ui-ux-2026-11-16/route-inventory.md) maps every page/request-handler source to its route and static behavior markers. Dynamic detail IDs, invitation tokens, authenticated data, chat responses and successful submissions were not exercised. HTTP evidence covers all 19 indexable pages plus the supporting routes listed in the progress report.

## Existing strengths and release checks

Keep centralized phone, county coverage, actual photos, existing request persistence, optional SMS consent, server validation, focus restoration, mobile action bar, route-specific content and noindex treatment of private workflows. Do not infer county eligibility from a valid ZIP. Confirm real appointment availability separately.

Before release: Chrome/Firefox/Safari at 320,390,768,1280,1440 widths; short landscape; keyboard navigation including dynamic submenu items; modal Escape/backdrop/focus return; invalid/network/success booking states using test backend; review submission and admin operations; reduced motion; 200% zoom; no horizontal overflow; Lighthouse/Core Web Vitals. None of these browser checks is claimed as completed by source review.
