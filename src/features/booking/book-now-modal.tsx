"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { primaryServices } from "@/content/services";
import { contact } from "@/content/company";
import { createBookNowDraft, normalizeBookNowPayload, resolveBookingContext, validateBookNowPayload } from "./model";
import type { BookNowDraft, BookNowErrors, SubmissionResult } from "./types";

// Every terminal outcome except the field-level "invalid" case, which is
// handled separately via the `errors` state instead of ever being stored here.
type CompletedResult = Exclude<SubmissionResult, { status: "invalid" }>;

const fieldClass = "min-h-12 w-full rounded-card border border-steel bg-surface px-4 py-3 text-base text-navy transition-colors placeholder:text-slate/65 focus:border-brand-primary";

type BookNowModalProps = {
  isOpen: boolean;
  categoryId?: string;
  serviceId?: string;
  offer?: boolean;
  issue?: string;
  campaignToken?: string;
  onClose: () => void;
};

export function BookNowModal({ isOpen, categoryId, serviceId, offer, issue, campaignToken, onClose }: BookNowModalProps) {
  const [draft, setDraft] = useState<BookNowDraft>(createBookNowDraft);
  const [errors, setErrors] = useState<BookNowErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CompletedResult | null>(null);
  const headingId = useId();
  const [selection, setSelection] = useState(serviceId ?? categoryId ?? "");
  const selectedCategory = primaryServices.find((category) => category.id === selection || category.children.some((service) => service.id === selection));
  const selectedService = selectedCategory?.children.find((service) => service.id === selection);
  const selectedContext = { categoryId: selectedCategory?.id, serviceId: selectedService?.id, offer };
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const focusErrorsRef = useRef(false);

  const contextLabel = resolveBookingContext(selectedContext);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = dialogRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === resultHeadingRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (focusErrorsRef.current) {
      dialogRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.focus();
      focusErrorsRef.current = false;
    }
  }, [errors]);

  useEffect(() => {
    if (result) resultHeadingRef.current?.focus();
  }, [result]);

  if (!isOpen) return null;

  function update<K extends keyof BookNowDraft>(key: K, value: BookNowDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(key in current) && !("form" in current)) return current;
      const next = { ...current };
      delete next[key];
      delete next.form;
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = normalizeBookNowPayload({ ...draft, ...selectedContext, issue, sourcePath: window.location.pathname, campaignToken });
    const validationErrors = validateBookNowPayload(payload);
    if (Object.keys(validationErrors).length) {
      focusErrorsRef.current = true;
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/book-now", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as SubmissionResult;
      if (data.status === "invalid") {
        focusErrorsRef.current = true;
        setErrors(data.errors);
        setSubmitting(false);
        return;
      }
      setResult(data);
    } catch {
      focusErrorsRef.current = true;
      setErrors({ form: "We couldn't confirm whether your request arrived. Please call Apex before trying again so we can avoid a duplicate request." });
      setSubmitting(false);
    }
  }

  const firstName = draft.fullName.trim().split(/\s+/)[0] || "there";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/55 backdrop-blur-md motion-safe:animate-[fade-slide_200ms_ease-out] sm:items-center sm:p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-hero border border-steel bg-surface shadow-hero motion-safe:animate-[fade-slide_240ms_ease-out] sm:w-[600px] sm:rounded-hero"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-steel bg-brand-soft px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <p className="eyebrow">{result ? (result.ok ? "Request sent" : "Request not sent") : "Book Now"}</p>
            <h2 ref={resultHeadingRef} tabIndex={-1} id={headingId} className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-navy sm:mt-2 sm:text-2xl">
              {result ? (result.ok ? "Request received." : "We couldn't send this.") : "Tell us what's going on."}
            </h2>
            {!result && contextLabel && <p className="mt-1.5 text-xs font-semibold text-brand-primary sm:text-sm">Regarding: {contextLabel}</p>}
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close" className="grid size-12 shrink-0 place-items-center rounded-control bg-surface/70 text-navy transition-colors hover:bg-surface">
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-7">
          {result ? (
            <div>
              <p className="rounded-panel border border-steel bg-page-bg p-4 text-sm leading-6 text-slate sm:p-5">
                {result.ok
                  ? `Thanks, ${firstName}. We received your service request and someone from our team will reach out shortly.`
                  : result.message}
              </p>
              {contact.phoneHref && (
                <a href={contact.phoneHref} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control bg-copper px-6 text-sm font-semibold text-white sm:mt-5 sm:min-h-12">
                  Call {contact.phone} now
                </a>
              )}
              <button type="button" onClick={onClose} className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-control border border-steel px-6 text-sm font-semibold text-navy hover:border-navy sm:min-h-12">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate aria-busy={submitting}>
              {errors.form && <p role="alert" tabIndex={-1} className="mb-3 rounded-control border-l-2 border-copper bg-page-bg px-4 py-2.5 text-sm font-semibold text-navy">{errors.form}</p>}
              <div className="mb-5">
                <label htmlFor="bn-service" className="mb-2 block text-sm font-bold text-navy">Service needed <span className="font-normal text-slate">Optional</span></label>
                <select id="bn-service" className={fieldClass} value={selection} onChange={(event) => setSelection(event.target.value)}>
                  <option value="">Help me choose</option>
                  {primaryServices.map((category) => <optgroup key={category.id} label={category.name}><option value={category.id}>{category.name} — general request</option>{category.children.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</optgroup>)}
                </select>
              </div>
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Full Name" htmlFor="bn-fullName" error={errors.fullName}>
                    <input id="bn-fullName" aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "bn-fullName-error" : undefined} required autoComplete="name" className={fieldClass} value={draft.fullName} onChange={(event) => update("fullName", event.target.value)} />
                  </Field>
                </div>
                <Field label="Phone number" htmlFor="bn-phone" error={errors.phone}>
                  <input id="bn-phone" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "bn-phone-error" : undefined} required type="tel" inputMode="tel" autoComplete="tel" className={fieldClass} value={draft.phone} onChange={(event) => update("phone", event.target.value)} />
                </Field>
                <Field label="ZIP code" htmlFor="bn-zip" error={errors.zipCode}>
                  <input id="bn-zip" aria-invalid={Boolean(errors.zipCode)} aria-describedby={errors.zipCode ? "bn-zip-error" : undefined} required inputMode="numeric" autoComplete="postal-code" maxLength={5} className={fieldClass} value={draft.zipCode} onChange={(event) => update("zipCode", event.target.value.replace(/\D/g, ""))} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Email address" htmlFor="bn-email" optional error={errors.email}>
                    <input id="bn-email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "bn-email-error" : undefined} type="email" autoComplete="email" className={fieldClass} value={draft.email} onChange={(event) => update("email", event.target.value)} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Tell us what's going on" htmlFor="bn-message" error={errors.message}>
                    <textarea id="bn-message" aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "bn-message-error" : undefined} required rows={2} maxLength={1200} className={`${fieldClass} min-h-28 resize-y py-3`} value={draft.message} onChange={(event) => update("message", event.target.value)} placeholder="What's happening, and with what system or appliance?" />
                  </Field>
                </div>
              </div>

              {/* TODO(legal): this wording is in-house draft copy, not yet reviewed/approved by
                  legal or business. Do not replace it with language copied from a reference
                  site. Must stay optional (never required to submit) and must not claim
                  marketing consent or link to a Privacy/Terms page that doesn't exist yet. */}
              <label className="mt-3 flex cursor-pointer items-start gap-2.5 min-h-11 text-sm leading-6 text-slate sm:mt-4">
                <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-navy" checked={draft.serviceTextConsent} onChange={(event) => update("serviceTextConsent", event.target.checked)} />
                I agree that my phone number may be used for service-request text communication. This is not marketing consent.
              </label>

              <button type="submit" disabled={submitting} className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-control bg-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-copper disabled:cursor-wait disabled:opacity-60 sm:mt-4 sm:min-h-12">
                {submitting ? "Sending…" : "Send Request"}
              </button>
              <p className="mt-2 text-xs leading-5 text-slate">Sending this does not confirm an appointment. Availability is confirmed when Apex follows up.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, optional, error, children }: { label: string; htmlFor: string; optional?: boolean; error?: string; children: React.ReactNode }) {
  const errorId = `${htmlFor}-error`;
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-bold text-navy sm:text-sm">
        {label}
        {optional && <span className="ml-2 font-normal text-slate">Optional</span>}
      </label>
      {children}
      {error && <p role="alert" id={errorId} className="mt-1.5 border-l-2 border-copper pl-3 text-xs font-semibold text-navy sm:text-sm">{error}</p>}
    </div>
  );
}
