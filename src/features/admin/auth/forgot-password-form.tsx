"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "./actions";

/** Always shows the same generic confirmation regardless of whether the
 * email belongs to a real admin account (see requestPasswordResetAction) --
 * so this form never reveals which emails are or aren't provisioned. */
export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, undefined);

  if (state?.message) {
    return (
      <p role="status" className="rounded-control bg-brand-soft px-4 py-3 text-sm font-medium text-ink">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-navy">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={pending}
          className="min-h-11 rounded-control border border-steel bg-surface px-4 text-sm text-navy outline-none focus-visible:border-brand-primary disabled:opacity-60"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex min-h-11 items-center justify-center rounded-control bg-navy px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-copper disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
