"use client";

import { useActionState } from "react";
import { confirmPasswordResetAction } from "./actions";

/** The `code` from the URL travels as a hidden field, submitted only on an
 * explicit click of "Set new password" -- this page's own GET render never
 * exchanges it (see the comment above confirmPasswordResetAction for why:
 * a prefetched/scanned GET on the email link must never be able to consume
 * the one-time code before the real admin clicks anything here). */
export function ResetPasswordForm({ code }: { code: string }) {
  const [state, formAction, pending] = useActionState(confirmPasswordResetAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="code" value={code} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-navy">
          New Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          disabled={pending}
          className="min-h-11 rounded-control border border-steel bg-surface px-4 text-sm text-navy outline-none focus-visible:border-brand-primary disabled:opacity-60"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-semibold text-navy">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          disabled={pending}
          className="min-h-11 rounded-control border border-steel bg-surface px-4 text-sm text-navy outline-none focus-visible:border-brand-primary disabled:opacity-60"
        />
      </div>

      {state?.error && (
        <p role="alert" className="rounded-control bg-brand-soft px-4 py-3 text-sm font-medium text-ink">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex min-h-11 items-center justify-center rounded-control bg-navy px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-copper disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
