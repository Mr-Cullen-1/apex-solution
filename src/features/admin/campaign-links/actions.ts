"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/admin/auth/require-admin";
import { resolveServiceRequestContext } from "@/features/booking/model";
import { createCampaignLink, setCampaignLinkActive } from "./repository";
import type { CreateCampaignLinkResult, SetCampaignLinkActiveResult } from "./types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createCampaignLinkAction(input: {
  platform: string;
  campaignName: string;
  categoryId: string;
  serviceId: string;
}): Promise<CreateCampaignLinkResult> {
  if (input.platform !== "instagram" && input.platform !== "facebook") return { ok: false, message: "Choose a platform." };

  const admin = await requireAdmin();

  // Same canonical validation Book Now itself uses at submission time
  // (src/features/booking/model.ts) -- handles a bare category selection
  // (Appliance Repair, Water Heater Repair: serviceId empty) as well as a
  // child-service selection, and resolves both {"", ""} ("Any service") to
  // {null, null} rather than needing a separate case. An unresolvable id is
  // silently dropped (never rejected), the same as everywhere else this
  // function is used.
  const resolved = resolveServiceRequestContext({ categoryId: input.categoryId, serviceId: input.serviceId });
  const result = await createCampaignLink(admin.userId, {
    platform: input.platform,
    campaignName: input.campaignName.trim().slice(0, 120),
    categoryId: resolved.categoryId ?? "",
    serviceId: resolved.serviceId ?? "",
  });
  if (result.ok) revalidatePath("/admin/campaign-links");
  return result;
}

export async function setCampaignLinkActiveAction(campaignLinkId: string, isActive: boolean): Promise<SetCampaignLinkActiveResult> {
  if (!UUID_PATTERN.test(campaignLinkId)) return { ok: false, message: "Campaign link not found." };

  const admin = await requireAdmin();
  const result = await setCampaignLinkActive(campaignLinkId, admin.userId, isActive);
  if (result.ok) revalidatePath("/admin/campaign-links");
  return result;
}
