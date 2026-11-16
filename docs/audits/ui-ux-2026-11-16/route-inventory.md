# Route source inventory

Generated from every App Router page and request-handler file. Static inspection only; dynamic parameters and authenticated operations require browser/test-session verification. Shared templates are described in UI_UX_AUDIT.md.

| Route | Source | Source behavior markers |
| --- | --- | --- |
| `/about` | `src/app/(marketing)/about/page.tsx` | public page/component composition |
| `/book` | `src/app/(marketing)/book/page.tsx` | redirect, async data/params |
| `/brands` | `src/app/(marketing)/brands/page.tsx` | public page/component composition |
| `/contact` | `src/app/(marketing)/contact/page.tsx` | public page/component composition |
| `/` | `src/app/(marketing)/page.tsx` | validation |
| `/review/[token]` | `src/app/(marketing)/review/[token]/page.tsx` | noindex metadata, form component, async data/params |
| `/review` | `src/app/(marketing)/review/page.tsx` | noindex metadata, form component |
| `/reviews` | `src/app/(marketing)/reviews/page.tsx` | async data/params, validation |
| `/service-areas` | `src/app/(marketing)/service-areas/page.tsx` | public page/component composition |
| `/services/[category]/[service]` | `src/app/(marketing)/services/[category]/[service]/page.tsx` | not-found handling, async data/params, shared detail template |
| `/services/[category]` | `src/app/(marketing)/services/[category]/page.tsx` | not-found handling, async data/params, shared category template |
| `/services` | `src/app/(marketing)/services/page.tsx` | public page/component composition |
| `/admin/admins` | `src/app/admin/(dashboard)/admins/page.tsx` | admin guard, super-admin guard, async data/params, validation |
| `/admin/campaign-links` | `src/app/admin/(dashboard)/campaign-links/page.tsx` | async data/params, validation |
| `/admin/create-request` | `src/app/admin/(dashboard)/create-request/page.tsx` | admin guard, form component, validation |
| `/admin/customers/[id]` | `src/app/admin/(dashboard)/customers/[id]/page.tsx` | not-found handling, form component, async data/params, validation |
| `/admin/customers` | `src/app/admin/(dashboard)/customers/page.tsx` | async data/params, validation |
| `/admin` | `src/app/admin/(dashboard)/page.tsx` | admin guard, form component, async data/params, validation |
| `/admin/requests/[id]` | `src/app/admin/(dashboard)/requests/[id]/page.tsx` | not-found handling, form component, async data/params, validation |
| `/admin/requests` | `src/app/admin/(dashboard)/requests/page.tsx` | async data/params, validation |
| `/admin/reviews` | `src/app/admin/(dashboard)/reviews/page.tsx` | async data/params, validation |
| `/admin/change-password` | `src/app/admin/change-password/page.tsx` | noindex metadata, admin guard, redirect, form component, async data/params |
| `/admin/forgot-password` | `src/app/admin/forgot-password/page.tsx` | noindex metadata, form component |
| `/admin/login` | `src/app/admin/login/page.tsx` | noindex metadata, admin guard, redirect, form component, async data/params |
| `/admin/reset-password` | `src/app/admin/reset-password/page.tsx` | noindex metadata, form component, async data/params |
| `/api/book-now` | `src/app/api/book-now/route.ts` | async data/params, validation |
| `/api/chat` | `src/app/api/chat/route.ts` | async data/params, validation |
| `/api/reviews` | `src/app/api/reviews/route.ts` | form component, async data/params, validation |
| `/l/[token]` | `src/app/l/[token]/route.ts` | redirect, async data/params |
