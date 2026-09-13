import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { company } from "@/content/company";
import { getAdminSession } from "@/features/admin/auth/require-admin";
import { LoginForm } from "@/features/admin/auth/login-form";

export const metadata: Metadata = {
  title: { absolute: `Admin sign in | ${company.name}` },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Not wrapped by the protected /admin/(dashboard) layout (no sidebar, no
// requireAdmin() redirect loop) and not wrapped by the public marketing
// (SiteHeader/Footer) layout either — this route sits directly under the
// slim true-root layout. This is an operational sign-in screen, not a
// marketing page: light Apex branding only, no hero, no social login, no
// signup CTA (there is no public admin registration; admins are provisioned
// by a SUPER_ADMIN with a temporary password — see
// docs/ADMIN_ARCHITECTURE.md).
export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-page-bg px-page py-16">
      <div className="w-full max-w-sm rounded-panel border border-steel bg-surface p-8 shadow-soft">
        <p className="eyebrow">{company.name}</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-navy">Admin sign in</h1>
        <p className="mt-2 text-sm text-slate">Authorized personnel only.</p>
        <div className="mt-7">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
