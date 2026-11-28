import { organizationIdentity } from "@/content/organization";
import type { ResourceAuthor } from "@/types/resource";

/** Approved organization author for all five planned Apex articles. */
export const resourceAuthor = {
  name: organizationIdentity.name,
  type: organizationIdentity["@type"],
  id: organizationIdentity["@id"],
} as const satisfies ResourceAuthor;
