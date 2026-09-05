# Phase 2C — Core public pages

## Routes completed

- `/service-areas`
- `/about`
- `/brands`
- `/contact`

The existing `/service-areas`, `/about`, and `/contact` conventions were retained. `/brands` is the single new canonical route. No aliases or duplicate indexable URLs were created.

## Content architecture

All public pages consume existing centralized sources. Company identity and nullable contact fields come from `company.ts`; state and county coverage and supported brands come from `site.ts`; operating principles come from `homepage.ts`; service relationships come from `services.ts`; and request actions use `BookingLink` and `cta.ts`.

`completedPublicPaths` in `routes.ts` provides the completed core-page inventory for the sitemap. Completed paths were removed from `plannedRoutes`, so they no longer resolve through the `noindex` placeholder system.

## Service Areas UX

The page states that Apex serves select counties rather than entire states. A sticky, horizontally scrollable state index links to five full state sections. Every confirmed county remains visible in the document at all viewport sizes; no JavaScript or disclosure is required to reach the information.

Each state section provides the exact centralized county list, restrained context, and a request CTA. The final location module sends visitors to the secure booking flow to enter ZIP and address details. No ZIP is exposed in the URL, and no eligibility result is fabricated. No county landing pages were generated.

## About content constraints

The About page is built around the confirmed name, tagline, service philosophy, Apex Standard, verified service categories, supported-brand concept, and five-state county footprint. It makes no claims about founders, founding year, ownership, team size, tenure, awards, licenses, certifications, jobs, reviews, or guarantees.

The only prominent photograph is the temporary Northeast HVAC concept and is publicly captioned as conceptual imagery rather than an Apex employee or completed job.

## Brands architecture

The Brands We Service page renders the centralized Appliances, Premium Appliances, and HVAC groups as text-only editorial directories. No logo or trademark assets were added. Appliance groups link to Appliance Repair; HVAC links to Cooling, Heating, and Indoor Air Quality.

The page states that listing a brand does not mean manufacturer authorization and preserves the intended “Don’t see your brand?” contact path. No per-brand SEO pages were created.

## Contact strategy

Contact is a route-selection experience rather than a second form. Request Service leads to `/book`; other pathways lead to Services, Service Areas, and Brands. The page conditionally renders phone, email, address, and hours only when those centralized values exist. With all four currently unverified, no fake or empty contact fields render.

The Phase 2B adapter remains unchanged and intentionally unconnected. Contact copy does not claim that a request is delivered or an appointment is confirmed.

## Internal-link updates

Homepage About, Service Areas, and Brands sections now lead to completed destinations. The services index links to `/brands`. Footer company/support groups include Brands, Service Areas, About, Contact, and Request Service. Footer state links deep-link into the relevant `/service-areas` sections. The primary header remains restrained; Brands is available through service and footer pathways rather than adding another top-level item.

## SEO decisions

Each completed page defines a unique title, description, canonical, Open Graph fields, and `index, follow`. All four pages are included in the sitemap through the completed public-page inventory. Metadata describes regional coverage without enumerating counties or implying statewide service.

The About page outputs a fact-limited `Organization` schema containing only name, description, tagline, page URL, and the five known state-level areas. It omits phone, address, hours, coordinates, reviews, ratings, prices, and credentials.

## Accessibility decisions

Pages use one H1, labelled sections, semantic lists and navigation, visible focus styles, descriptive links, and minimum action sizes. State navigation uses ordinary anchor links so it is keyboard accessible, works without JavaScript, and exposes an understandable active destination through browser focus and URL fragment behavior. Long names wrap rather than truncate.

## Remaining placeholder inventory

### Ready for a later content phase

- `/resources` and `/faq`: require approved editorial content and publishing ownership.

### Blocked by missing business data

- `/emergency`: confirmed offering, availability, and response policy.
- `/membership`: Apex Care benefits, inclusions, eligibility, pricing, and terms.
- `/financing`: provider, eligibility, rates, terms, and disclosures.
- `/offers`: approved offer details, dates, eligibility, and terms.
- `/team`: verified people, roles, biographies, and approved photography.
- `/reviews`: verified testimonials, sources, ratings, and publication permission.
- `/projects`: verified projects, locations, facts, and approved photography.
- `/careers`: active roles, employment details, application destination, and policies.
- `/privacy` and `/terms`: approved legal copy and governing business details.

### Potentially unnecessary or overlapping

- `/emergency` should be removed if emergency service is not an actual offering; the existing route name must not create the claim.
- `/team` may remain part of About unless enough verified material supports a distinct page.
- `/offers` should be removed if there is no maintained promotions program.

All listed routes remain `noindex, nofollow`; Phase 2C does not implement them.

The homepage audit also tightened these boundaries: project imagery is visibly labelled as conceptual and not completed Apex work, Apex Care no longer presents unconfirmed benefit bullets, and financing copy no longer implies an available program before provider terms are verified.

## Routes blocked by business data

Phone, email, street address, office hours, licenses, certifications, business history, ownership, team, real reviews, project evidence, emergency policy, pricing, financing, offers, membership details, warranties, guarantees, and exact ZIP eligibility remain unavailable.

## Media status

No media was generated. Phase 2C uses one existing Northeast-appropriate temporary concept with a disclosure and otherwise relies on typography and layout. The three legacy Southwest concepts and all temporary assets still require rights-cleared production replacements before launch. The actual client logo is still unavailable.

## Browser QA status

The configured in-app browser was unavailable during final validation, so no rendered viewport or interactive browser QA is claimed. Structural, build, metadata, HTTP, and link checks were completed separately and do not substitute for rendered visual QA.

## Recommended next phase

Prioritize production integration readiness: select and connect the service-request provider, finalize consent and privacy requirements, establish rate limiting and bot controls, and complete rendered responsive/accessibility QA. In parallel, collect the verified business and proof content needed to decide which blocked routes should be completed or removed.
