import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { company } from "@/content/company";
import { getAdminSession } from "@/features/admin/auth/require-admin";
import { ChangePasswordForm } from "@/features/admin/auth/change-password-form";
import { isAdminHost } from "@/lib/admin-host";

export const metadata: Metadata = {
  title: { absolute: `Set your password | ${company.name}` },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Standalone (no sidebar, no marketing shell) — reachable both for the
// mandatory first password change (must_change_password = true, freshly
// provisioned or reset by a SUPER_ADMIN) and for a voluntary change
// initiated later from the sidebar's "Change Password" link. Uses
// getAdminSession() (non-redirecting), never requireAdmin(): requireAdmin()
// itself redirects here whenever mustChangePassword is true, which would
// loop forever if this page also called it.
export default async function AdminChangePasswordPage() {
  const session = await getAdminSession();
  // Host-aware for the same reason as /admin/login/page.tsx above.
  if (!session) redirect(isAdminHost((await headers()).get("host")) ? "/login" : "/admin/login");

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-page-bg px-page py-16">
      <div className="w-full max-w-sm rounded-panel border border-steel bg-surface p-8 shadow-soft">
        <p className="eyebrow">{company.name}</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-navy">Set your password</h1>
        <p className="mt-2 text-sm text-slate">
          {session.mustChangePassword
            ? "Choose a new password to finish setting up your Admin account."
            : "Choose a new password for your Admin account."}
        </p>
        <div className="mt-7">
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  );
}
