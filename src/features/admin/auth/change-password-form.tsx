"use client";

import { useActionState } from "react";
import { changePasswordAction } from "./actions";

/** Password form for /admin/change-password — used both for the mandatory
 * first change after SUPER_ADMIN provisioning/reset and for a voluntary
 * change later. Hidden by default (plain `type="password"`, no visibility
 * toggle needed here), with `autoComplete="new-password"` so password
 * managers offer to generate/save a strong password rather than
 * autofilling an old one. */
export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
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
        {pending ? "Saving…" : "Set Password"}
      </button>
    </form>
  );
}
