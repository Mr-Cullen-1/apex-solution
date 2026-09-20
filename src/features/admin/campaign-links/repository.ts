import "server-only";
import { randomBytes } from "node:crypto";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { AdminCampaignLink, CampaignPlatform, CreateCampaignLinkResult, ListCampaignLinksResult, SetCampaignLinkActiveResult } from "./types";

const LIST_FAILED_MESSAGE = "Couldn't load campaign links. Try again.";
const CREATE_FAILED_MESSAGE = "Couldn't create the campaign link right now. Please try again.";
const UPDATE_FAILED_MESSAGE = "Couldn't update the campaign link right now. Please try again.";

type CampaignLinkRow = {
  id: string;
  token: string;
  platform: CampaignPlatform;
  campaign_name: string | null;
  category_id: string | null;
  service_id: string | null;
  is_active: boolean;
  created_at: string;
};

function toAdminCampaignLink(row: CampaignLinkRow): AdminCampaignLink {
  return {
    id: row.id,
    token: row.token,
    platform: row.platform,
    campaignName: row.campaign_name,
    categoryId: row.category_id,
    serviceId: row.service_id,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

// Not a security-sensitive secret (this token is meant to be pasted into a
// public ad) — just short and unique. 8 base64url characters from 6 random
// bytes is a large enough space that a collision is exceedingly unlikely,
// and the table's unique constraint plus a bounded retry loop below close
// the gap regardless.
function generateCampaignToken(): string {
  return randomBytes(6).toString("base64url");
}

export async function listCampaignLinks(): Promise<ListCampaignLinksResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: LIST_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("campaign_links").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("[admin_campaign_links_list_failed]", error.code, error.message);
      return { ok: false, message: LIST_FAILED_MESSAGE };
    }
    return { ok: true, links: ((data ?? []) as CampaignLinkRow[]).map(toAdminCampaignLink) };
  } catch (err) {
    console.error("[admin_campaign_links_list_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: LIST_FAILED_MESSAGE };
  }
}

export async function createCampaignLink(
  adminUserId: string,
  input: { platform: CampaignPlatform; campaignName: string; categoryId: string; serviceId: string },
): Promise<CreateCampaignLinkResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: CREATE_FAILED_MESSAGE };
  const supabase = getSupabaseServerClient();

  // Bounded retry on the (extremely unlikely) chance of a token collision —
  // never a COUNT(*)-based scheme, and the unique constraint is what
  // actually guarantees no duplicate is ever stored regardless.
  for (let attempt = 0; attempt < 5; attempt++) {
    const token = generateCampaignToken();
    const { data, error } = await supabase.rpc("admin_create_campaign_link", {
      p_admin_user_id: adminUserId,
      p_token: token,
      p_platform: input.platform,
      p_campaign_name: input.campaignName || null,
      p_category_id: input.categoryId || null,
      p_service_id: input.serviceId || null,
    });
    if (!error && data) return { ok: true, link: toAdminCampaignLink(data as CampaignLinkRow) };
    if (error?.code !== "23505") {
      console.error("[admin_campaign_link_create_failed]", error?.code, error?.message);
      return { ok: false, message: CREATE_FAILED_MESSAGE };
    }
    // 23505 = unique_violation on token — retry with a fresh one.
  }
  console.error("[admin_campaign_link_create_failed]", "exhausted retries on token collision");
  return { ok: false, message: CREATE_FAILED_MESSAGE };
}

/** Public resolution for the /l/<token> redirect route -- no admin
 * context, deliberately returns nothing (not an error) for an
 * inactive/unmatched token so the route can fall back to a plain homepage
 * redirect rather than exposing which case it was. */
export async function resolveActiveCampaignLink(token: string): Promise<Pick<CampaignLinkRow, "id" | "platform" | "category_id" | "service_id"> | null> {
  if (!token || !isSupabaseConfigured()) return null;
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_active_campaign_link", { p_token: token });
    if (error || !data) return null;
    return data as CampaignLinkRow;
  } catch (err) {
    console.error("[campaign_link_resolve_failed]", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function setCampaignLinkActive(campaignLinkId: string, adminUserId: string, isActive: boolean): Promise<SetCampaignLinkActiveResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: UPDATE_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.rpc("admin_set_campaign_link_active", {
      p_campaign_link_id: campaignLinkId,
      p_admin_user_id: adminUserId,
      p_is_active: isActive,
    });
    if (error || !data) {
      console.error("[admin_campaign_link_update_failed]", error?.code, error?.message);
      return { ok: false, message: UPDATE_FAILED_MESSAGE };
    }
    return { ok: true, link: toAdminCampaignLink(data as CampaignLinkRow) };
  } catch (err) {
    console.error("[admin_campaign_link_update_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: UPDATE_FAILED_MESSAGE };
  }
}
