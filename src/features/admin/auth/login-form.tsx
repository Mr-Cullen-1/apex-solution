"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

/** Operational sign-in only: email + password + Sign in. Deliberately
 * absent: a signup CTA, social login, and a public password-reset flow —
 * this app has no public admin registration at all (instruction #3/#13). */
export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-navy">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
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
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
