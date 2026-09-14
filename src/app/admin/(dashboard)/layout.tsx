import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireAdmin } from "@/features/admin/auth/require-admin";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: { template: "%s | Admin", default: "Admin" },
  robots: { index: false, follow: false },
};

// Applies to every route under this group (/admin, /admin/reviews, …) —
// /admin/login sits outside this group entirely so it never gets the
// authenticated sidebar shell or the requireAdmin() redirect. This layout
// IS the real enforcement point for those routes (proxy.ts only performs
// an optimistic "is there a session" redirect) — every page below still
// independently calls requireAdmin() again before any mutation for
// defense in depth, per instruction #57.
export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  return (
    <AdminShell role={admin.role} email={admin.email}>
      {children}
    </AdminShell>
  );
}
