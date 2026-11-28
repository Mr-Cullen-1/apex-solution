"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { BookingLink } from "@/components/ui/booking-link";
import { buttonStyles } from "@/components/ui/button-link";
import { contact } from "@/content/company";
import { checkZipCoverage, type ZipCoverageResult } from "@/content/service-coverage";
import type { Placement } from "@/features/analytics/events";

export function ZipCoverageChecker({ placement = "coverage_cta" }: { placement?: Placement }) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [zip, setZip] = useState("");
  const [result, setResult] = useState<ZipCoverageResult | null>(null);
  const invalid = result?.status === "invalid";

  function checkCoverage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextResult = checkZipCoverage(zip);
    setResult(nextResult);
    if (nextResult.status === "invalid") inputRef.current?.focus();
  }

  return (
    <div className="rounded-panel border border-steel bg-surface p-6 sm:p-8">
      <h3 id={`${id}-heading`} className="text-2xl font-semibold tracking-[-0.035em] text-navy">Check your ZIP code</h3>
      <p id={`${id}-hint`} className="mt-3 text-sm leading-6 text-slate">Enter your five-digit ZIP to check our current service area. Service details and appointment availability are confirmed by our team.</p>
      <form onSubmit={checkCoverage} noValidate aria-labelledby={`${id}-heading`} className="mt-6">
        <label htmlFor={`${id}-zip`} className="block text-sm font-semibold text-navy">ZIP code</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            ref={inputRef}
            id={`${id}-zip`}
            name="zip"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            pattern="[0-9]{5}"
            required
            value={zip}
            onChange={(event) => { setZip(event.target.value); setResult(null); }}
            aria-invalid={invalid}
            aria-describedby={`${id}-hint${invalid ? ` ${id}-error` : ""}`}
            className="min-h-12 w-full min-w-0 rounded-control border border-steel bg-page-bg px-4 text-base text-navy sm:max-w-48"
          />
          <button type="submit" className={`${buttonStyles.primary} justify-center`}>Check coverage</button>
        </div>
        {invalid && <p id={`${id}-error`} role="alert" className="mt-3 text-sm font-semibold text-navy">Enter exactly five digits, including any leading zero. ZIP+4 is not supported.</p>}
      </form>
      <div role="status" aria-live="polite" aria-atomic="true">
        {result?.status === "supported" && (
          <div className="mt-6 border-t border-steel pt-6">
            <p className="font-semibold text-navy">{result.zip} is in our {result.stateName} service area.</p>
            <p className="mt-2 text-sm leading-6 text-slate">Request service and our team will confirm the work needed and scheduling.</p>
            <BookingLink placement={placement} className="mt-4 w-full justify-center sm:w-auto" />
          </div>
        )}
        {result?.status === "unsupported" && (
          <div className="mt-6 border-t border-steel pt-6">
            <p className="font-semibold text-navy">{result.zip} is outside our current listed coverage.</p>
            <p className="mt-2 text-sm leading-6 text-slate">Contact our team with location questions. Service at this ZIP is not confirmed.</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              {contact.phoneHref && contact.phone && <a href={contact.phoneHref} className={buttonStyles.secondary}>Call {contact.phone}</a>}
              <Link href="/contact" className="inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-4">Contact our team</Link>
            </div>
          </div>
        )}
      </div>
      <noscript><p className="mt-4 text-sm leading-6 text-slate">Enable JavaScript to check your ZIP, or <a href="/contact" className="underline">contact our team</a> for coverage questions.</p></noscript>
    </div>
  );
}
