import { company } from "@/content/company";

// Every route's `openGraph` object fully replaces the parent's (Next.js does
// not deep-merge nested metadata fields across segments — see
// https://nextjs.org/docs/app/api-reference/functions/generate-metadata#merging-metadata,
// "Overwriting fields"). Declaring `openGraph` at all on a page therefore
// also silently drops the root-level `opengraph-image` file-convention image
// for that page. Every page that sets its own `openGraph` must spread this
// shared object back in so branding, type, and the social image stay intact.
export const sharedOpenGraph = {
  siteName: company.name,
  type: "website" as const,
  images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${company.name} — Reliable home services from local Northeast professionals.` }],
};
