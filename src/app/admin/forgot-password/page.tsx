import type { Metadata } from "next";
import { company } from "@/content/company";
import { ForgotPasswordForm } from "@/features/admin/auth/forgot-password-form";

export const metadata: Metadata = {
  title: { absolute: `Reset password | ${company.name}` },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Standalone (no sidebar, no marketing shell) -- reached from a "Forgot
// password?" link on /admin/login. No session/admin check here: this page
// must be reachable by a signed-out visitor by definition.
export default function AdminForgotPasswordPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-page-bg px-page py-16">
      <div className="w-full max-w-sm rounded-panel border border-steel bg-surface p-8 shadow-soft">
        <p className="eyebrow">{company.name}</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-navy">Reset your password</h1>
        <p className="mt-2 text-sm text-slate">Enter your admin email and we&apos;ll send a link to reset your password.</p>
        <div className="mt-7">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
