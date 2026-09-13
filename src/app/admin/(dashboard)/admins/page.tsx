import type { Metadata } from "next";
import { requireSuperAdmin } from "@/features/admin/auth/require-admin";
import { listAdmins } from "@/features/admin/admins/repository";
import { AdminsBoard } from "@/components/admin/admins/admins-board";

export const metadata: Metadata = { title: "Admins" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

// SUPER_ADMIN only — requireSuperAdmin() redirects an ADMIN back to /admin
// (the (dashboard) layout's requireAdmin() already proved a valid admin
// session; this page independently narrows to SUPER_ADMIN on top of that).
export default async function AdminAdminsPage() {
  const actor = await requireSuperAdmin();
  const result = await listAdmins();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-navy">Admins</h1>
        <p className="mt-1 text-sm text-slate">Create admins, change roles, and activate or deactivate accounts.</p>
      </div>

      {!result.ok ? (
        <div className="rounded-panel border border-steel bg-surface p-8 text-center text-sm font-medium text-ink">{result.message}</div>
      ) : (
        <AdminsBoard admins={result.admins} currentUserId={actor.userId} />
      )}
    </div>
  );
}
