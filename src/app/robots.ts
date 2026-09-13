import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site-url";

export default function robots(): MetadataRoute.Robots {
  // Defense in depth alongside each /admin page's own `robots: { index:
  // false, follow: false }` metadata (instruction #58) — Admin is an
  // operational area, never indexed and never linked from sitemap.ts.
  return { rules: { userAgent: "*", allow: "/", disallow: "/admin" }, sitemap: `${siteUrl}/sitemap.xml` };
}
