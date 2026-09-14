import type { RequestStatus } from "@/features/booking/types";

export type ServiceRequestSignals = {
  /** Count of service_requests created in the last 24 hours — this project
   * has no canonical business timezone configured (see .env.example /
   * docs/BOOK_NOW_ARCHITECTURE.md), so "last 24h" is used rather than
   * silently inventing one (instruction #50). Time-based volume signal —
   * distinct from `newStatusCount` below, which is status-based. */
  newLast24h: number;
  telegramFailed: number;
  emailFailed: number;
  /** request_status = 'NEW' — submissions no admin has acted on yet at
   * all. */
  newStatusCount: number;
  /** request_status in ('NEW', 'CONTACTED') — anything not yet Scheduled,
   * Completed, or Cancelled. A pragmatic "still needs action" bucket, not
   * a time-based SLA calculation. */
  needsFollowUpCount: number;
  customerCount: number;
};

export type ServiceRequestSignalsResult = { ok: true; signals: ServiceRequestSignals } | { ok: false; message: string };

export type ActiveAdminCountResult = { ok: true; count: number } | { ok: false; message: string };

/** One UTC calendar day's request volume — used by the "Requests over time"
 * dashboard chart. Every day in the requested window is present, even at
 * count 0, so the chart never silently skips a quiet day. */
export type RequestsOverTimePoint = { date: string; count: number };

export type RequestsOverTimeResult = { ok: true; points: RequestsOverTimePoint[] } | { ok: false; message: string };

export type RequestStatusDistribution = {
  NEW: number;
  CONTACTED: number;
  SCHEDULED: number;
  COMPLETED: number;
  CANCELLED: number;
};

export type RequestStatusDistributionResult = { ok: true; distribution: RequestStatusDistribution } | { ok: false; message: string };

export type ServiceCategoryCount = { label: string; count: number };

export type TopServiceCategoriesResult = { ok: true; categories: ServiceCategoryCount[] } | { ok: false; message: string };

export type DeliveryOutcomes = {
  telegram: { pending: number; sent: number; failed: number };
  email: { notRequested: number; pending: number; sent: number; failed: number };
};

export type DeliveryOutcomesResult = { ok: true; outcomes: DeliveryOutcomes } | { ok: false; message: string };

export type OfferUsage = { withOffer: number; withoutOffer: number };

export type OfferUsageResult = { ok: true; usage: OfferUsage } | { ok: false; message: string };

/** Minimal shape for the dashboard's recent-activity mini feed — not the
 * full AdminRequest DTO (this is a lightweight, dashboard-only read, same
 * pattern as ServiceRequestSignals above). */
export type RecentRequestFeedItem = {
  id: string;
  fullName: string;
  serviceLabel: string | null;
  categoryLabel: string | null;
  requestStatus: RequestStatus;
  createdAt: string;
};

export type RecentRequestFeedResult = { ok: true; items: RecentRequestFeedItem[] } | { ok: false; message: string };
