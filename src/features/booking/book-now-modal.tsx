"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { contact } from "@/content/company";
import { createBookNowDraft, normalizeBookNowPayload, resolveBookingContext, validateBookNowPayload } from "./model";
import type { BookNowDraft, BookNowErrors, SubmissionResult } from "./types";

// Every terminal outcome except the field-level "invalid" case, which is
// handled separately via the `errors` state instead of ever being stored here.
type CompletedResult = Exclude<SubmissionResult, { status: "invalid" }>;

// Sizing has three tiers so the whole form clears the viewport with no
// internal scrollbar everywhere it's tested:
//   - base: comfortable phones (390x844+) and anywhere with normal headroom
//   - sm: (>=640px wide) a touch roomier once there is width to spend
//   - [@media(max-height:700px)]: denser still — short phones (320x568,
//     360x640, 375x667) and landscape/short-laptop heights, which in this
//     app's tested matrix never overlap with `sm:` widths, so the two
//     variants never compete over the same property.
const fieldClass =
  "min-h-10 w-full rounded-control border border-steel bg-surface px-3.5 py-2 text-sm text-navy outline-none transition-colors placeholder:text-slate/65 focus:border-brand-primary sm:min-h-11 sm:px-4 sm:text-base [@media(max-height:700px)]:min-h-9 [@media(max-height:700px)]:px-3 [@media(max-height:700px)]:py-1";

type BookNowModalProps = {
  isOpen: boolean;
  categoryId?: string;
  serviceId?: string;
  offer?: boolean;
  issue?: string;
  onClose: () => void;
};

export function BookNowModal({ isOpen, categoryId, serviceId, offer, issue, onClose }: BookNowModalProps) {
  const [draft, setDraft] = useState<BookNowDraft>(createBookNowDraft);
  const [errors, setErrors] = useState<BookNowErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CompletedResult | null>(null);
  const headingId = useId();

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const contextLabel = resolveBookingContext({ categoryId, serviceId, offer });

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
      if (event.shiftKey && document.activeElement === first) {
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
    const payload = normalizeBookNowPayload({ ...draft, categoryId, serviceId, offer, issue, sourcePath: window.location.pathname });
    const validationErrors = validateBookNowPayload(payload);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/book-now", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as SubmissionResult;
      if (data.status === "invalid") {
        setErrors(data.errors);
        setSubmitting(false);
        return;
      }
      setResult(data);
    } catch {
      setErrors({ form: "The request could not be sent right now. Your details have not been sent." });
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
        className="flex w-full flex-col overflow-hidden rounded-t-hero border border-steel bg-surface shadow-hero motion-safe:animate-[fade-slide_240ms_ease-out] sm:w-[600px] sm:rounded-hero"
      >
        <div className="flex items-start justify-between gap-4 border-b border-steel bg-brand-soft px-5 py-4 sm:px-7 sm:py-5 [@media(max-height:700px)]:px-4 [@media(max-height:700px)]:py-2">
          <div>
            <p className="eyebrow [@media(max-height:700px)]:text-[0.65rem]">{result ? (result.ok ? "Request sent" : "Request not sent") : "Book Now"}</p>
            <h2 id={headingId} className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-navy sm:mt-2 sm:text-2xl [@media(max-height:700px)]:mt-0.5 [@media(max-height:700px)]:text-base">
              {result ? (result.ok ? "Request received." : "We couldn't send this.") : "Tell us what's going on."}
            </h2>
            {!result && contextLabel && <p className="mt-1.5 text-xs font-semibold text-brand-primary sm:text-sm [@media(max-height:700px)]:mt-0.5 [@media(max-height:700px)]:text-[0.7rem]">Regarding: {contextLabel}</p>}
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-control bg-surface/70 text-navy transition-colors hover:bg-surface sm:size-10 [@media(max-height:700px)]:size-7">
            <CloseIcon className="size-5 [@media(max-height:700px)]:size-4" />
          </button>
        </div>

        <div className="px-5 py-4 sm:px-7 sm:py-5 [@media(max-height:700px)]:px-4 [@media(max-height:700px)]:py-2">
          {result ? (
            <div>
              <p className="rounded-panel border border-steel bg-page-bg p-4 text-sm leading-6 text-slate sm:p-5">
                {result.ok
                  ? `Thanks, ${firstName}. We received your service request and someone from our team will reach out shortly.`
                  : result.message}
              </p>
              {contact.phoneHref && (
                <a href={contact.phoneHref} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control bg-copper px-6 text-sm font-semibold text-white sm:mt-5 sm:min-h-12">
                  Call {contact.phone} now
                </a>
              )}
              <button type="button" onClick={onClose} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-control border border-steel px-6 text-sm font-semibold text-navy hover:border-navy sm:min-h-12">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {errors.form && <p className="mb-3 rounded-control border-l-2 border-copper bg-page-bg px-4 py-2.5 text-sm font-semibold text-navy">{errors.form}</p>}
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 [@media(max-height:700px)]:gap-y-1.5">
                <div className="sm:col-span-2">
                  <Field label="Full Name" htmlFor="bn-fullName" error={errors.fullName}>
                    <input id="bn-fullName" autoComplete="name" className={fieldClass} value={draft.fullName} onChange={(event) => update("fullName", event.target.value)} />
                  </Field>
                </div>
                <Field label="Phone number" htmlFor="bn-phone" error={errors.phone}>
                  <input id="bn-phone" type="tel" inputMode="tel" autoComplete="tel" className={fieldClass} value={draft.phone} onChange={(event) => update("phone", event.target.value)} />
                </Field>
                <Field label="ZIP code" htmlFor="bn-zip" error={errors.zipCode}>
                  <input id="bn-zip" inputMode="numeric" autoComplete="postal-code" maxLength={5} className={fieldClass} value={draft.zipCode} onChange={(event) => update("zipCode", event.target.value.replace(/\D/g, ""))} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Email address" htmlFor="bn-email" optional error={errors.email}>
                    <input id="bn-email" type="email" autoComplete="email" className={fieldClass} value={draft.email} onChange={(event) => update("email", event.target.value)} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Tell us what's going on" htmlFor="bn-message" error={errors.message}>
                    <textarea id="bn-message" rows={2} maxLength={1200} className={`${fieldClass} min-h-16 resize-none py-2 sm:min-h-20 [@media(max-height:700px)]:min-h-9 [@media(max-height:700px)]:py-1`} value={draft.message} onChange={(event) => update("message", event.target.value)} placeholder="What's happening, and with what system or appliance?" />
                  </Field>
                </div>
              </div>

              {/* TODO(legal): this wording is in-house draft copy, not yet reviewed/approved by
                  legal or business. Do not replace it with language copied from a reference
                  site. Must stay optional (never required to submit) and must not claim
                  marketing consent or link to a Privacy/Terms page that doesn't exist yet. */}
              <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[11px] leading-4 text-slate sm:mt-4 sm:text-xs sm:leading-5 [@media(max-height:700px)]:mt-1.5 [@media(max-height:700px)]:gap-2 [@media(max-height:700px)]:text-[10px] [@media(max-height:700px)]:leading-3.5">
                <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-navy" checked={draft.serviceTextConsent} onChange={(event) => update("serviceTextConsent", event.target.checked)} />
                I agree that my phone number may be used for service-request text communication. This is not marketing consent.
              </label>

              <button type="submit" disabled={submitting} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-control bg-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-copper disabled:cursor-wait disabled:opacity-60 sm:mt-4 sm:min-h-12 [@media(max-height:700px)]:mt-1.5 [@media(max-height:700px)]:min-h-9">
                {submitting ? "Sending…" : "Send Request"}
              </button>
              <p className="mt-2 text-xs leading-5 text-slate [@media(max-height:700px)]:hidden">Sending this does not confirm an appointment. Availability is confirmed when Apex follows up.</p>
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
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-bold text-navy sm:text-sm [@media(max-height:700px)]:mb-0.5 [@media(max-height:700px)]:text-[0.7rem]">
        {label}
        {optional && <span className="ml-2 font-normal text-slate">Optional</span>}
      </label>
      {children}
      {error && <p id={errorId} className="mt-1.5 border-l-2 border-copper pl-3 text-xs font-semibold text-navy sm:text-sm">{error}</p>}
    </div>
  );
}
