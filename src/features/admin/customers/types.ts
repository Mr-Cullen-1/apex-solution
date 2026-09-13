export const ADMIN_CUSTOMERS_PAGE_SIZE = 25;

export type AdminCustomerListItem = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  zipCode: string | null;
  firstSeenAt: string;
  lastRequestAt: string | null;
  totalRequests: number;
};

export type AdminCustomerProfile = AdminCustomerListItem;

export type ListAdminCustomersParams = { page: number; search?: string };

export type ListAdminCustomersResult =
  | { ok: true; customers: AdminCustomerListItem[]; total: number; page: number; pageSize: number }
  | { ok: false; message: string };

export type GetAdminCustomerResult = { ok: true; customer: AdminCustomerProfile } | { ok: false; status: "not_found" } | { ok: false; status: "error"; message: string };
