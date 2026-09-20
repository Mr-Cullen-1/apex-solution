import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@/content/company";
import { ResetPasswordForm } from "@/features/admin/auth/reset-password-form";

export const metadata: Metadata = {
  title: { absolute: `Set new password | ${company.name}` },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Standalone (no sidebar, no marketing shell). Supabase's own /auth/v1/verify
// redemption already happened before the browser ever got here -- this page
// just receives the resulting one-time `code` in the query string. Landing
// here (a GET) never exchanges that code by itself; only the form's
// explicit submit (confirmPasswordResetAction) does. See the comment above
// that action for why (a prefetched/scanned GET must never be able to burn
// the code before the real admin clicks anything).
export default async function AdminResetPasswordPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-page-bg px-page py-16">
      <div className="w-full max-w-sm rounded-panel border border-steel bg-surface p-8 shadow-soft">
        <p className="eyebrow">{company.name}</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-navy">Set new password</h1>
        {code ? (
          <>
            <p className="mt-2 text-sm text-slate">Choose a new password for your Admin account.</p>
            <div className="mt-7">
              <ResetPasswordForm code={code} />
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate">This link is invalid or has expired.</p>
            <Link href="/admin/forgot-password" className="mt-6 inline-flex text-sm font-semibold text-brand-primary hover:underline">
              Request a new link
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
