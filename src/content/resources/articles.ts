import "server-only";
import { clientArticles } from "./client-articles";
import { plannedDrafts } from "./planned-drafts";
import type { Resource } from "@/types/resource";

// The client furnace article supersedes the earlier local furnace draft.
// Keep the remaining four planned subjects private and available for later editing.
export const resources: readonly Resource[] = [...clientArticles, ...plannedDrafts.slice(1)];
