"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAdminRequestAction } from "@/features/admin/requests/actions";
import type { CreateAdminRequestInput } from "@/features/admin/requests/actions";
import { encodeServiceSelection, resolveServiceSelection } from "@/features/admin/requests/service-options";
import type { AdminCreateRequestServiceOption } from "@/features/admin/requests/service-options";
import { CheckIcon } from "@/components/ui/icons";

const fieldClass =
  "min-h-11 w-full rounded-control border border-steel bg-surface px-3.5 py-2 text-sm text-navy outline-none transition-colors focus-visible:border-brand-primary";

// Multiline fields get their own base class rather than reusing fieldClass:
// `rounded-control` is a 999px pill radius meant for single-line
// controls/buttons and looks like an oversized capsule on a multiline box.
// `rounded-card` (20px) is this project's existing convention for a
// multiline field (see the customer-facing review textarea,
// src/features/reviews/review-form.tsx). Both textareas share this exact
// string, differing only in `min-h-*`, so padding/font-size/line-height/
// placeholder color can never drift between them.
const textareaClass =
  "w-full resize-none rounded-card border border-steel bg-surface px-3.5 pt-2.5 pb-2 text-sm leading-6 text-navy outline-none transition-colors placeholder:text-slate/65 focus-visible:border-brand-primary";

function createDraft(): CreateAdminRequestInput {
  return { fullName: "", phone: "", email: "", zipCode: "", message: "", categoryId: "", serviceId: "", internalNotes: "" };
}

/** Manual phone-in lead entry -- reuses the exact same booking payload
 * shape, validation, and creation/delivery pipeline as the public Book Now
 * flow (source is "admin_phone" instead of "book_now"); see
 * createAdminRequestAction. Never a second, parallel booking form. */
export function CreateRequestForm({ serviceOptions }: { serviceOptions: AdminCreateRequestServiceOption[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<CreateAdminRequestInput>(createDraft);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateAdminRequestInput, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [created, setCreated] = useState<{ requestId: string; requestCode: string } | null>(null);

  function update<K extends keyof CreateAdminRequestInput>(key: K, value: CreateAdminRequestInput[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function handleServiceChange(value: string) {
    const selection = resolveServiceSelection(serviceOptions, value);
    setDraft((current) => ({ ...current, ...selection }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    startTransition(async () => {
      const result = await createAdminRequestAction(draft);
      if (result.ok) {
        setCreated({ requestId: result.requestId, requestCode: result.requestCode });
        return;
      }
      if (result.status === "invalid") {
        setErrors(result.errors);
      } else {
        setFormError(result.message);
      }
    });
  }

  if (created) {
    return (
      <div className="rounded-panel border border-steel bg-surface p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand-primary">
          <CheckIcon className="size-5" />
        </span>
        <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-navy">Request {created.requestCode} created successfully.</h2>
        <p className="mt-2 text-sm text-slate">Saved, and a Telegram notification has been sent (or logged as failed, if delivery didn&apos;t succeed).</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href={`/admin/requests/${created.requestId}`} className="rounded-control bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary">
            View request
          </Link>
          <button
            type="button"
            onClick={() => {
              setCreated(null);
              setDraft(createDraft());
              router.refresh();
            }}
            className="rounded-control border border-steel px-4 py-2.5 text-sm font-semibold text-navy hover:border-navy"
          >
            Create another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-panel border border-steel bg-surface p-6 lg:p-7">
      {/* 12-column grid at lg: so the compact fields line up in two tight
          rows (Full Name/Phone/Email, then ZIP/Service) instead of the
          previous 2-column stack's four rows, and Message/Notes sit
          side-by-side in a third row instead of each taking a full-width
          row of their own -- the point of both is using the wider desktop
          card's horizontal room instead of vertical height. Single column
          below lg, where stacking/scrolling is fine. */}
      <div className="grid grid-cols-1 gap-x-5 gap-y-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Field label="Customer Full Name" htmlFor="ar-fullName" error={errors.fullName}>
            <input id="ar-fullName" autoComplete="name" className={fieldClass} value={draft.fullName} onChange={(event) => update("fullName", event.target.value)} />
          </Field>
        </div>
        <div className="lg:col-span-4">
          <Field label="Phone number" htmlFor="ar-phone" error={errors.phone}>
            <input id="ar-phone" type="tel" autoComplete="tel" className={fieldClass} value={draft.phone} onChange={(event) => update("phone", event.target.value)} />
          </Field>
        </div>
        <div className="lg:col-span-4">
          <Field label="Email" htmlFor="ar-email" optional error={errors.email}>
            <input id="ar-email" type="email" autoComplete="email" className={fieldClass} value={draft.email} onChange={(event) => update("email", event.target.value)} />
          </Field>
        </div>

        <div className="lg:col-span-3">
          <Field label="ZIP code" htmlFor="ar-zip" error={errors.zipCode}>
            <input id="ar-zip" inputMode="numeric" maxLength={5} className={fieldClass} value={draft.zipCode} onChange={(event) => update("zipCode", event.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <div className="lg:col-span-9">
          <Field label="Service" htmlFor="ar-service" optional>
            <select id="ar-service" className={fieldClass} value={encodeServiceSelection(draft)} onChange={(event) => handleServiceChange(event.target.value)}>
              <option value="">Not specified</option>
              {serviceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="lg:col-span-7">
          <Field label="Customer issue / description" htmlFor="ar-message" error={errors.message}>
            <textarea
              id="ar-message"
              rows={4}
              maxLength={1200}
              className={`${textareaClass} min-h-28`}
              value={draft.message}
              onChange={(event) => update("message", event.target.value)}
              placeholder="Describe the customer’s issue, symptoms, and preferred date/time."
            />
          </Field>
        </div>
        <div className="lg:col-span-5">
          <Field label="Internal notes" htmlFor="ar-notes" optional>
            <textarea
              id="ar-notes"
              rows={3}
              maxLength={2000}
              className={`${textareaClass} min-h-24`}
              value={draft.internalNotes}
              onChange={(event) => update("internalNotes", event.target.value)}
              placeholder="Staff-only notes. Not visible to the customer."
            />
          </Field>
        </div>
      </div>

      {formError && <p className="mt-4 rounded-control border-l-2 border-copper bg-page-bg px-4 py-2.5 text-sm font-semibold text-navy">{formError}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-control bg-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-primary disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create request"}
      </button>
    </form>
  );
}

function Field({ label, htmlFor, optional, error, children }: { label: string; htmlFor: string; optional?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-bold uppercase tracking-[0.06em] text-slate">
        {label}
        {optional && <span className="ml-1.5 font-normal normal-case text-slate">Optional</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-semibold text-navy">{error}</p>}
    </div>
  );
}
