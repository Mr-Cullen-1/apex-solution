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
