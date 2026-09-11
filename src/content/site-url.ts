// Single canonical site-URL source. Every route/metadata file that needs an
// absolute origin (sitemap, robots, structured data, root metadata, OG images)
// imports this instead of reading `process.env.NEXT_PUBLIC_SITE_URL` directly.
//
// Production must set `NEXT_PUBLIC_SITE_URL` to the real custom domain once
// one exists. Until then, a Vercel preview/production deployment still gets a
// real, non-localhost origin via the platform-provided `VERCEL_URL`, so
// generated metadata never advertises `localhost` once actually deployed.
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;

// `||` (not `??`) deliberately: an .env file with the key present but left
// blank (e.g. `NEXT_PUBLIC_SITE_URL=`, as in .env.example) yields `""`, which
// `??` would treat as a set value and pass straight to `new URL()`.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || vercelUrl || "http://localhost:3000";
