export type CampaignPlatform = "instagram" | "facebook";

export type AdminCampaignLink = {
  id: string;
  token: string;
  platform: CampaignPlatform;
  campaignName: string | null;
  categoryId: string | null;
  serviceId: string | null;
  isActive: boolean;
  createdAt: string;
};

export type ListCampaignLinksResult = { ok: true; links: AdminCampaignLink[] } | { ok: false; message: string };

export type CreateCampaignLinkResult = { ok: true; link: AdminCampaignLink } | { ok: false; message: string };

export type SetCampaignLinkActiveResult = { ok: true; link: AdminCampaignLink } | { ok: false; message: string };
