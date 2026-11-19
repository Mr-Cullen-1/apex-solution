# Business facts and outstanding inputs

Updated 2026-11-17. This is a source register, not independent business verification. Existing supplied facts may be reused consistently; unknown facts must not be invented.

| Topic | Existing source | Current handling | Still needed |
|---|---|---|---|
| Brand | `src/content/company.ts`, `brand.ts` | Apex Home Services; approved logo retained | Legal operator name |
| Role | About explicitly states independent service providers perform the work; `trust.ts` has the same coordination explanation | Copy and Service `broker` relation aligned to the existing published model | Owner confirmation if operational model has changed; responsibility/warranty detail |
| Phone | `company.ts` | Existing (516) 586-0826 retained | Current routing/operating confirmation; no call was placed |
| Email, address, hours | `company.contact` fields are null | Not fabricated or inserted into schema | Public contact email; actual operating days/time zone; only a real applicable address |
| Live availability | Header used a static string and animated dot; no availability signal | Neutral “Contact Apex”; no operator-presence claim | A real signal before any live indicator returns |
| Credentials/experience | `trust.ts` records prior client approval in September 2026 | Existing credential/experience copy preserved | Current credential evidence, whose credentials, qualification of same-day availability |
| Coverage | `site.ts`: 5 states, 29 selected counties | Organization lists county+parent state; Service uses a qualified coverage statement also shown on the page | Service-by-county capacity, priority 3–5 locations and ZIP availability rules |
| Appliance equipment | `appliance-repair.ts` explicitly records client-supplied residential and commercial equipment | Same catalog is now visible on the appliance hub with specific-equipment/ZIP confirmation | Inspection inclusions/exclusions and case studies for each new appliance landing page |
| Diagnostics | `trust.ts`: starting at $89 based on location; diagnostic credited if repair proceeds same day | Existing wording reused with scope confirmation | Exceptions and service-specific fees |
| Offer | `offers.ts`: first maintenance service; 5 eligible service labels | “First visit” shorthand corrected; no repair discount invented | Any operational eligibility changes |
| Warranty/parts | No detailed approved terms found | Visitors are prompted to confirm applicable terms; no promise made | Who provides warranty, duration, exclusions, parts policy |
| Review verification | Admin-controlled `is_verified_customer`; approval and publish consent are separate | Existing badge condition retained; process explained without claiming external authentication | Actual staff verification procedure and evidence for disputed photo associations |
| Photos/results | Existing source media and captions; audit questions dryer vent vs lint trap and review associations | Furnace/boiler photos explicitly described as general outdoor HVAC imagery | Confirm exact dryer work, photo-to-review association, publication consent and locality for case studies |
| Analytics | GTM `GTM-5JLZPN4Q`; GA4 destination `G-50J6LW5JET`; Sprint 1 frontend events implemented locally | No publish/deploy; production form deduplication and user-provided-data settings still require review | See `ANALYTICS_SPRINT_1.md` release gates; consent, private-route exclusions and URL redaction |

## Policy publication input

The code supports the following flows, but environment flags alone do not prove live delivery:

- Booking validates the request and stores it through the booking repository. Telegram operational notification and optional email confirmation are separate delivery paths in `submission-adapter.ts`.
- Reviews include permission to publish, moderation, optional media and invitation flows. An approved review and verified-customer flag are distinct decisions.
- Chat uses the existing server-side chat adapter. The policy must describe the actual enabled processing, not a guessed list of vendors.

Before publishing `/privacy-policy` and `/terms`, provide the legal operator/privacy contact, actual recipient and independent-provider sharing rules, retention periods, deletion/request process, enabled analytics/cookies, and approved service/communication terms. Until supplied, no placeholder policy is presented to customers as operative legal text. The existing optional service-text consent has not been converted into marketing consent.

The remaining factual inputs were requested in chat. Independent technical fixes continue without those answers.
