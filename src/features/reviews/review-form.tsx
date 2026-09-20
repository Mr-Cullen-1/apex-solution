"use client";

import Link from "next/link";
import { cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import { CheckIcon, StarIcon } from "@/components/ui/icons";
import { buttonStyles } from "@/components/ui/button-link";
import { primaryServices } from "@/content/services";
import { focusRing } from "./focus-ring";
import { ImageUpload } from "./image-upload";
import { validateMediaFile } from "./media";
import { normalizeReviewSubmission, validateReviewSubmission } from "./model";
import { ServiceSelect } from "./service-select";
import { REVIEW_LOCATION_MAX_LENGTH, REVIEW_TEXT_MAX_LENGTH } from "./types";
import type { ReviewSubmissionDraft, ReviewSubmissionResult, ReviewValidationErrors } from "./types";

const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

// Native OS emoji input (Win+. / Cmd+Ctrl+Space) already works in a plain
// text field — this is a small extra convenience, not a requirement. Kept
// to a fixed set of common reactions rather than a full picker/library, per
// the explicit "skip if it needs a heavy dependency" guidance; inserting at
// the cursor position uses only the standard selectionStart/selectionEnd
// APIs, no new package.
const REACTION_EMOJI = ["😊", "👍", "❤️", "🙏", "⭐", "🔥", "👏", "🙂"];

const serviceOptions = primaryServices.map((category) => ({ value: category.slug, label: category.name }));

function createDraft(initial?: { fullName?: string; serviceSlug?: string }): ReviewSubmissionDraft {
  return { fullName: initial?.fullName ?? "", rating: null, reviewText: "", serviceSlug: initial?.serviceSlug ?? "", locationText: "", consentToPublish: false };
}

/** `invitationToken`/`initialFullName`/`initialServiceSlug` are only ever
 * set by the /review/[token] invitation route (see
 * src/app/(marketing)/review/[token]/page.tsx) — the plain /review page
 * renders this with no props, exactly as before. The token travels as a
 * hidden form field straight through to POST /api/reviews; it is never read
 * from anywhere else (not a query param the customer could tamper with
 * client-side and have it silently accepted — the server independently
 * re-validates it before linking a review to it). */
export function ReviewForm({ invitationToken, initialFullName, initialServiceSlug }: { invitationToken?: string; initialFullName?: string; initialServiceSlug?: string } = {}) {
  const [draft, setDraft] = useState<ReviewSubmissionDraft>(() => createDraft({ fullName: initialFullName, serviceSlug: initialServiceSlug }));
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ReviewValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  // Honeypot — real visitors never see or fill this (see the aria-hidden,
  // off-screen wrapper below). autoComplete="off" also keeps a real user's
  // browser autofill from populating it and triggering a false positive.
  const [honeypot, setHoneypot] = useState("");
  const starRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // The compact form-level error sits down by the Submit button, which can
  // already be below the fold on the smallest phones — without this, a
  // customer could get a rate-limit/server error that's real but literally
  // off-screen. `scrollIntoView` only moves the viewport; it never changes
  // the page's own height, so this doesn't reintroduce the "form resizes"
  // problem the top banner had.
  useEffect(() => {
    if (!formError) return;
    document.getElementById("review-form-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [formError]);

  useEffect(() => {
    if (!emojiPickerOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (!emojiPickerRef.current?.contains(event.target as Node)) setEmojiPickerOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setEmojiPickerOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [emojiPickerOpen]);

  function clearFieldError<K extends keyof ReviewValidationErrors>(key: K) {
    setErrors((current) => {
      if (!(key in current) && !("form" in current)) return current;
      const next = { ...current };
      delete next[key];
      delete next.form;
      return next;
    });
  }

  function update<K extends keyof ReviewSubmissionDraft>(key: K, value: ReviewSubmissionDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    clearFieldError(key as keyof ReviewValidationErrors);
    setFormError(null);
  }

  function setRating(value: number) {
    update("rating", value);
  }

  function focusStar(value: number) {
    starRefs.current[value - 1]?.focus();
  }

  /** Moves focus to the first invalid field, in the same top-to-bottom
   * order they appear in the form. `scroll-mt-28` on each of these
   * elements (not just their wrapping label) keeps the sticky header from
   * covering whatever the browser scrolls into view. */
  function focusFirstError(errs: ReviewValidationErrors) {
    if (errs.fullName) {
      document.getElementById("review-fullName")?.focus();
    } else if (errs.rating) {
      focusStar(1);
    } else if (errs.serviceSlug) {
      document.getElementById("review-service")?.focus();
    } else if (errs.locationText) {
      document.getElementById("review-location")?.focus();
    } else if (errs.reviewText) {
      document.getElementById("review-text")?.focus();
    } else if (errs.media) {
      document.getElementById("review-media")?.focus();
    } else if (errs.consentToPublish) {
      document.getElementById("review-consent")?.focus();
    }
  }

  function handleStarKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, value: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = value < 5 ? value + 1 : 1;
      setRating(next);
      focusStar(next);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      const prev = value > 1 ? value - 1 : 5;
      setRating(prev);
      focusStar(prev);
    }
  }

  function handleSelectMedia(file: File) {
    const mediaError = validateMediaFile(file);
    if (mediaError) {
      setErrors((current) => ({ ...current, media: mediaError }));
      return;
    }
    clearFieldError("media");
    setMediaFile(file);
  }

  function handleRemoveMedia() {
    setMediaFile(null);
    clearFieldError("media");
  }

  function insertEmoji(emoji: string) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? draft.reviewText.length;
    const end = textarea?.selectionEnd ?? draft.reviewText.length;
    const next = (draft.reviewText.slice(0, start) + emoji + draft.reviewText.slice(end)).slice(0, REVIEW_TEXT_MAX_LENGTH);
    update("reviewText", next);
    setEmojiPickerOpen(false);
    if (!textarea) return;
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = Math.min(start + emoji.length, next.length);
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    const payload = normalizeReviewSubmission(draft);
    const validationErrors = validateReviewSubmission(payload);
    if (mediaFile) {
      const mediaError = validateMediaFile(mediaFile);
      if (mediaError) validationErrors.media = mediaError;
    }
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      focusFirstError(validationErrors);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      // multipart/form-data so an optional binary photo can travel alongside
      // the text fields — the browser sets its own Content-Type + boundary
      // for a FormData body, so no header is set here.
      const formData = new FormData();
      formData.set("fullName", payload.fullName);
      formData.set("rating", String(payload.rating));
      formData.set("reviewText", payload.reviewText);
      formData.set("serviceSlug", payload.serviceSlug);
      formData.set("locationText", payload.locationText);
      formData.set("consentToPublish", String(payload.consentToPublish));
      formData.set("website", honeypot);
      if (invitationToken) formData.set("invitationToken", invitationToken);
      if (mediaFile) formData.set("media", mediaFile);

      const response = await fetch("/api/reviews", { method: "POST", body: formData });
      const data = (await response.json()) as ReviewSubmissionResult;
      if (data.ok) {
        setSubmitted(true);
        return;
      }
      if (data.status === "invalid") {
        setErrors(data.errors);
        focusFirstError(data.errors);
      } else if (data.status === "media_upload_failed") {
        // Local to the photo control, not the form-level banner — an
        // upload failure isn't a whole-form problem. The image selection
        // itself is left in place so the customer can just press submit
        // again rather than re-attaching it.
        setErrors((current) => ({ ...current, media: data.message }));
        document.getElementById("review-media")?.focus();
        document.getElementById("review-media")?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        // "not_configured" | "rate_limited" | "invalid_invitation" | "error"
        // all surface as a single compact form-level message — none of them
        // are field-specific, and the customer's entered text (and selected
        // photo) are preserved either way.
        setFormError(data.message);
      }
    } catch {
      setFormError("We couldn't submit your review right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="scroll-mt-28 rounded-hero border border-steel bg-surface p-6 text-center shadow-soft sm:p-8">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-copper">
          <CheckIcon className="size-5" />
        </span>
        <p className="eyebrow mt-4">Thank you</p>
        <h2 className="mt-2 text-balance text-xl font-semibold tracking-[-0.02em] text-navy sm:text-2xl">Thanks for sharing your experience.</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate sm:text-base">
          Your review has been submitted for approval. Once approved, it may appear on the Apex Home Services website.
        </p>
        <p className="mt-1.5 text-sm text-slate">No further action is needed.</p>
        <Link href="/" className={`${buttonStyles.secondary} mt-6 inline-flex`}>
          Back to home
        </Link>
      </div>
    );
  }

  const reviewLength = draft.reviewText.length;
  const selectedRating = draft.rating;

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-hero border border-steel bg-surface p-3.5 shadow-soft sm:p-5 lg:p-6">
      {/* Honeypot: `sr-only`'s clip-based visually-hidden CSS (not
          display:none or an off-screen left offset) — display:none is what
          some simple bots specifically check for and skip to dodge classic
          honeypots. `aria-hidden` additionally removes it from the
          accessibility tree (sr-only alone would still announce it), and
          tabIndex=-1 keeps it out of the keyboard tab order. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="review-website">Website</label>
        <input id="review-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
      </div>

      {/* True 50/50 split at md+ (grid-cols-2 = repeat(2, minmax(0, 1fr))),
          single column below it — the same breakpoint used for the
          always-2-column Service/Location row inside the left column. The
          intro is a grid item in its own right (col 1, row 1), not a
          full-width block above the grid: that's what keeps its paragraph
          confined to the left column's own width instead of stretching
          across both columns, with no `max-w-[px]` guess involved. Row 2
          (Your Details / Your Review) starts only once row 1 — sized to the
          intro alone, since row 1's second cell is empty — ends, so "Your
          Review" lines up with "Your Details" via the grid itself rather
          than a manual margin offset. On mobile this is just DOM order:
          intro, then details, then composer. */}
      <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:mt-4 md:grid-cols-2 md:grid-rows-[auto_auto] md:gap-x-10">
        <div className="scroll-mt-28 md:col-start-1 md:row-start-1">
          <p className="eyebrow">Customer feedback</p>
          <h1 className="mt-0.5 text-balance text-[clamp(1.375rem,2.6vw,1.875rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-navy">
            Share your experience
          </h1>
          <p className="mt-1 text-sm leading-6 text-slate sm:text-base">
            We appreciate your feedback. Tell us about your experience with the service professional you worked with. Reviews are checked before
            they appear publicly.
          </p>
        </div>

        <div className="space-y-2 md:col-start-1 md:row-start-2">
          <p className="hidden text-xs font-bold uppercase tracking-[0.08em] text-slate md:block">Your details</p>

          <Field label="Full Name" htmlFor="review-fullName" error={errors.fullName}>
            <input id="review-fullName" autoComplete="name" className={fieldClass} value={draft.fullName} onChange={(event) => update("fullName", event.target.value)} />
          </Field>

          <div className="scroll-mt-28">
            <span id="review-rating-label" className="mb-0.5 block text-sm font-bold text-navy">
              Rating
            </span>
            <div
              role="radiogroup"
              aria-labelledby="review-rating-label"
              aria-invalid={Boolean(errors.rating)}
              aria-describedby={errors.rating ? "review-rating-error" : undefined}
              className="flex items-center gap-1"
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const active = selectedRating !== null && value <= selectedRating;
                const isTabbable = selectedRating ? value === selectedRating : value === 1;
                return (
                  <button
                    key={value}
                    ref={(el) => {
                      starRefs.current[value - 1] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={selectedRating === value}
                    aria-label={`${value} star${value > 1 ? "s" : ""}${ratingLabels[value] ? ` — ${ratingLabels[value]}` : ""}`}
                    tabIndex={isTabbable ? 0 : -1}
                    onClick={() => setRating(value)}
                    onKeyDown={(event) => handleStarKeyDown(event, value)}
                    className={`grid size-10 place-items-center rounded-control text-steel transition-colors hover:text-copper ${focusRing}`}
                  >
                    <StarIcon className={`size-6 ${active ? "text-copper" : "text-steel"}`} />
                  </button>
                );
              })}
              {selectedRating && <span className="ml-1.5 text-sm font-semibold text-navy">{ratingLabels[selectedRating]}</span>}
            </div>
            {errors.rating && (
              <p id="review-rating-error" role="alert" className="mt-1 border-l-2 border-copper pl-3 text-sm font-semibold text-navy">
                {errors.rating}
              </p>
            )}
          </div>

          {/* Always 2 columns, even at the smallest tested width (390px) —
              the one-screen-fit requirement takes priority here, and a
              ~150px column is workable for a short optional service name /
              location string (the select's label truncates), unlike Full
              Name or the review textarea which stay full width. */}
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Service" htmlFor="review-service" optional error={errors.serviceSlug}>
              <ServiceSelect
                id="review-service"
                value={draft.serviceSlug}
                onChange={(value) => update("serviceSlug", value)}
                options={serviceOptions}
                placeholder="Select a service (optional)"
                triggerClassName={fieldClass}
              />
            </Field>

            <Field label="Location" htmlFor="review-location" optional error={errors.locationText}>
              <input
                id="review-location"
                placeholder="City, county or state"
                maxLength={REVIEW_LOCATION_MAX_LENGTH}
                className={fieldClass}
                value={draft.locationText}
                onChange={(event) => update("locationText", event.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-2 md:col-start-2 md:row-start-2">
          <p className="hidden text-xs font-bold uppercase tracking-[0.08em] text-slate md:block">Your review</p>

          <Field label="Your Review" htmlFor="review-text" error={errors.reviewText}>
            <textarea
              id="review-text"
              ref={textareaRef}
              rows={3}
              maxLength={REVIEW_TEXT_MAX_LENGTH}
              placeholder="Tell us what stood out about your experience…"
              className={`min-h-[6.5rem] w-full rounded-card border border-steel bg-surface px-3.5 py-2.5 text-sm leading-6 text-navy transition-colors placeholder:text-slate/65 hover:border-slate/40 sm:text-base md:min-h-[10rem] ${focusRing}`}
              value={draft.reviewText}
              onChange={(event) => update("reviewText", event.target.value)}
            />
          </Field>

          <div className="flex items-center justify-between">
            <div ref={emojiPickerRef} className="relative">
              <button
                type="button"
                onClick={() => setEmojiPickerOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={emojiPickerOpen}
                aria-label="Insert an emoji"
                className={`grid size-7 place-items-center rounded-control text-base leading-none transition-colors hover:bg-page-bg ${focusRing}`}
              >
                😊
              </button>
              {emojiPickerOpen && (
                <div role="menu" aria-label="Emoji" className="absolute z-20 mt-1.5 flex w-40 flex-wrap gap-0.5 rounded-card border border-steel bg-surface p-1.5 shadow-card">
                  {REACTION_EMOJI.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      role="menuitem"
                      onClick={() => insertEmoji(emoji)}
                      className={`grid size-8 place-items-center rounded-control text-lg leading-none transition-colors hover:bg-brand-soft ${focusRing}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-right text-[11px] text-slate">
              {reviewLength} / {REVIEW_TEXT_MAX_LENGTH}
            </p>
          </div>

          <div className="scroll-mt-28">
            {/* No separate external label row here (unlike the other
                Fields) — the dropzone's own "Add a photo Optional" text
                already serves as its accessible name via the <label
                htmlFor>, so a duplicate heading above it would only cost a
                visual row the smallest phones can't spare now that a
                mandatory new upload control exists at all. The supporting
                sentence is kept for screen readers only, same reason. */}
            <p id="review-media-note" className="sr-only">
              You can attach one photo to your review.
            </p>
            <ImageUpload
              id="review-media"
              file={mediaFile}
              onSelect={handleSelectMedia}
              onRemove={handleRemoveMedia}
              error={errors.media}
              ariaDescribedBy={errors.media ? "review-media-note review-media-error" : "review-media-note"}
            />
            {errors.media && (
              <p id="review-media-error" role="alert" className="mt-1 border-l-2 border-copper pl-3 text-sm font-semibold text-navy">
                {errors.media}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex flex-col gap-2.5 border-t border-steel pt-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
        <div className="scroll-mt-28 sm:flex-1">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-5 text-slate">
            <input
              id="review-consent"
              type="checkbox"
              className={`mt-0.5 size-4 shrink-0 accent-navy ${focusRing}`}
              checked={draft.consentToPublish}
              aria-describedby={errors.consentToPublish ? "review-consent-note review-consent-error" : "review-consent-note"}
              aria-invalid={Boolean(errors.consentToPublish)}
              onChange={(event) => update("consentToPublish", event.target.checked)}
            />
            <span>
              I agree that Apex Home Services may publish this review and any attached photo on its website after approval.
              <span id="review-consent-note" className="mt-1 block text-xs text-slate">
                Your full name will not be displayed publicly.
              </span>
            </span>
          </label>
          {errors.consentToPublish && (
            <p id="review-consent-error" role="alert" className="mt-1 border-l-2 border-copper pl-3 text-sm font-semibold text-navy">
              {errors.consentToPublish}
            </p>
          )}
        </div>

        {/* A rate-limit/server/network error renders here — small, local to
            the submit action, reserving no space when absent — rather than
            a full-width banner above the whole card. That old placement
            pushed the heading and every field down by its own height,
            which could reintroduce page scrolling on a form that's
            otherwise built to fit one screen. `role="alert"` alone already
            gives it an implicit assertive `aria-live` announcement, same
            as every other error message in this form. */}
        <div className="flex flex-col items-stretch gap-1.5 sm:items-end">
          {formError && (
            <p id="review-form-error" role="alert" className="scroll-mt-28 max-w-xs text-left text-xs font-semibold text-navy sm:max-w-sm sm:text-right">
              {formError}
            </p>
          )}
          {/* scroll-mb-24 mirrors the scroll-mt-28 used everywhere else in
              this form for the sticky header, but for the bottom edge: the
              fixed mobile Call/Book Now bar (~81px + safe-area) stays
              pinned over the last slice of the viewport regardless of
              scroll position, and native scroll-into-view (keyboard focus,
              or the error-state scrollIntoView above) only scrolls the
              minimum needed by the raw viewport bounds — it has no idea a
              fixed sibling covers part of that space. This margin makes
              that minimum include clearing the bar. md:scroll-mb-0 because
              the bar itself is md:hidden. */}
          <button
            type="submit"
            disabled={submitting}
            className={`${buttonStyles.primary} w-full scroll-mb-24 disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:shrink-0 md:scroll-mb-0`}
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      </div>
    </form>
  );
}

const fieldClass = `min-h-11 w-full rounded-control border border-steel bg-surface px-3.5 py-2 text-sm text-navy transition-colors placeholder:text-slate/65 hover:border-slate/40 sm:text-base ${focusRing}`;

function Field({
  label,
  htmlFor,
  optional,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  const errorId = `${htmlFor}-error`;
  const control = isValidElement<{ "aria-describedby"?: string; "aria-invalid"?: boolean }>(children)
    ? cloneElement(children, {
        "aria-describedby": error ? errorId : undefined,
        "aria-invalid": Boolean(error),
      })
    : children;
  return (
    <div className="scroll-mt-28">
      <label htmlFor={htmlFor} className="mb-0.5 block text-sm font-bold text-navy">
        {label}
        {optional && <span className="ml-1.5 font-normal text-slate">Optional</span>}
      </label>
      {control}
      {error && (
        <p id={errorId} role="alert" className="mt-1 border-l-2 border-copper pl-3 text-sm font-semibold text-navy">
          {error}
        </p>
      )}
    </div>
  );
}
