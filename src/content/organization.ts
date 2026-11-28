import { company } from "./company";
import { siteUrl } from "./site-url";

/** Shared identity for references to the site's existing Organization entity. */
export const organizationIdentity = {
  "@type": "Organization",
  "@id": new URL("/#organization", siteUrl).toString(),
  name: company.name,
} as const;
