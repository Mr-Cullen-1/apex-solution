import type { RequestStatus } from "@/features/booking/types";

export type { RequestStatus };

export type AdminRequestStatusFilter = RequestStatus | "all";
export type AdminTelegramStatusFilter = "pending" | "sent" | "failed" | "all";
export type AdminEmailStatusFilter = "not_requested" | "pending" | "sent" | "failed" | "all";
export type AdminOfferFilter = "with" | "without" | "all";

export const ADMIN_REQUESTS_PAGE_SIZE = 25;

export type ListAdminRequestsParams = {
  status: AdminRequestStatusFilter;
  telegramStatus: AdminTelegramStatusFilter;
  emailStatus: AdminEmailStatusFilter;
  offer: AdminOfferFilter;
  serviceId?: string;
  page: number;
  search?: string;
};

/** Admin-only DTO — includes phone/email/full_name, which never appear in
 * any public route or API. */
export type AdminRequest = {
  id: string;
  customerId: string;
  fullName: string;
  phone: string;
  email: string | null;
  zipCode: string;
  serviceLabel: string | null;
  categoryLabel: string | null;
  issue: string | null;
  message: string;
  smsConsent: boolean;
  sourcePath: string | null;
  requestStatus: RequestStatus;
  offerLabel: string | null;
  discountPercent: number | null;
  telegramStatus: "pending" | "sent" | "failed";
  telegramMessageId: number | null;
  telegramSentAt: string | null;
  emailStatus: "not_requested" | "pending" | "sent" | "failed";
  emailMessageId: string | null;
  emailSentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListAdminRequestsResult =
  | { ok: true; requests: AdminRequest[]; total: number; page: number; pageSize: number }
  | { ok: false; message: string };

export type GetAdminRequestResult = { ok: true; request: AdminRequest } | { ok: false; status: "not_found" } | { ok: false; status: "error"; message: string };

export type AdminRequestMutationResult =
  | { ok: true; request: AdminRequest }
  | { ok: false; status: "not_found" }
  | { ok: false; status: "error"; message: string };
