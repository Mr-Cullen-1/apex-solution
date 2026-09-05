"use client";

import { Children, cloneElement, forwardRef, isValidElement, useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import { primaryServices } from "@/content/services";
import { serviceAreas, supportedBrands } from "@/content/site";
import { ArrowRightIcon } from "@/components/ui/icons";
import {
  applianceTypes,
  bookingSteps,
  contactPreferences,
  createBookingDraft,
  getProblems,
  getSelectedCategory,
  getSelectedService,
  normalizeBookingPayload,
  stateOptions,
  timeWindows,
  validateBookingStep,
} from "./model";
import type { BookingDraft, BookingErrors, SubmissionResult } from "./types";

const fieldClass = "min-h-12 w-full border border-steel bg-soft-white px-4 py-3 text-base text-navy outline-none transition-colors placeholder:text-slate/65 focus:border-copper";

export function BookingFlow({ initialSelection }: { initialSelection: { categoryId: string; serviceId: string } }) {
  const [draft, setDraft] = useState<BookingDraft>(() => createBookingDraft(initialSelection));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const category = getSelectedCategory(draft);
  const service = getSelectedService(draft);
  const problems = getProblems(draft.categoryId);
  const problem = problems.find((item) => item.id === draft.problemId);
  const brandOptions = useMemo(() => supportedBrands.filter((group) => category?.brandGroupIds.includes(group.id)).flatMap((group) => group.brands), [category]);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const historyStep = event.state?.bookingStep;
      if (Number.isInteger(historyStep) && historyStep >= 0 && historyStep <= bookingSteps.length) {
        setStep(historyStep);
        return;
      }
      const match = window.location.hash.match(/^#step-(\d+)$/);
      if (match) setStep(Math.min(Number(match[1]) - 1, bookingSteps.length - 1));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  function update<K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  }

  function goTo(next: number, push = true) {
    setErrors({});
    setStep(next);
    if (push) window.history.pushState({ bookingStep: next }, "", `${window.location.pathname}${window.location.search}#step-${next + 1}`);
  }

  function continueFlow() {
    const nextErrors = validateBookingStep(draft, step, today);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    goTo(step + 1);
  }

  async function submit() {
    setSubmitting(true);
    setErrors({});
    try {
      const response = await fetch("/api/service-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(normalizeBookingPayload(draft)) });
      const result = await response.json() as SubmissionResult;
      if (result.status === "invalid") {
        setErrors(result.errors);
        setSubmitting(false);
        requestAnimationFrame(() => errorRef.current?.focus());
        return;
      }
      setConfirmation(result.message);
      setStep(bookingSteps.length);
      window.history.pushState({ bookingStep: bookingSteps.length }, "", `${window.location.pathname}${window.location.search}#request-ready`);
    } catch {
      setErrors({ form: "The request could not be prepared right now. Your details have not been sent." });
    } finally {
      setSubmitting(false);
    }
  }

  if (step === bookingSteps.length) return <Confirmation message={confirmation} draft={draft} />;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] xl:gap-16">
      <div>
        <Progress step={step} />
        <div className="mt-10 border-t border-navy pt-9 sm:mt-12 sm:pt-12">
          <p className="eyebrow">Step {step + 1} of {bookingSteps.length}</p>
          <h2 ref={headingRef} tabIndex={-1} className="mt-4 text-balance text-[clamp(2.6rem,6vw,5.3rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-navy">{bookingSteps[step]}</h2>
          <StepIntroduction step={step} serviceName={service?.name ?? category?.name} />
          {Object.keys(errors).length > 0 && <ErrorSummary ref={errorRef} errors={errors} />}
          <div className="mt-10">
            {step === 0 && <ServiceStep draft={draft} update={update} errors={errors} />}
            {step === 1 && <ProblemStep draft={draft} update={update} errors={errors} problems={problems} brandOptions={brandOptions} />}
            {step === 2 && <LocationStep draft={draft} update={update} errors={errors} />}
            {step === 3 && <TimingStep draft={draft} update={update} errors={errors} today={today} />}
            {step === 4 && <ContactStep draft={draft} update={update} errors={errors} />}
            {step === 5 && <ReviewStep draft={draft} edit={goTo} />}
          </div>
        </div>
        <div className="sticky bottom-0 z-20 -mx-page mt-12 flex items-center justify-between gap-3 border-t border-steel bg-soft-white/95 px-page py-4 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0">
          {step > 0 ? <button type="button" className="min-h-12 border border-steel px-6 text-sm font-semibold uppercase tracking-[0.08em] text-navy hover:border-navy" onClick={() => goTo(step - 1)}>Back</button> : <span />}
          {step < bookingSteps.length - 1 ? <button type="button" className="group inline-flex min-h-12 items-center gap-3 bg-navy px-6 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-copper" onClick={continueFlow}>Continue <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" /></button> : <button type="button" disabled={submitting} className="min-h-12 bg-navy px-6 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-copper disabled:cursor-wait disabled:opacity-60" onClick={submit}>{submitting ? "Preparing…" : "Prepare request"}</button>}
        </div>
      </div>
      <SummaryRail draft={draft} problemLabel={problem?.label} edit={goTo} />
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return <nav aria-label="Booking progress"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate">Request progress</p><ol className="mt-4 grid grid-cols-6 gap-1">{bookingSteps.map((label, index) => <li key={label} aria-current={index === step ? "step" : undefined}><span className={`block h-1.5 ${index <= step ? "bg-copper" : "bg-steel"}`} /><span className={`mt-3 hidden text-xs font-semibold lg:block ${index === step ? "text-navy" : "text-slate"}`}>{index + 1}. {label}</span><span className="sr-only">{index + 1}. {label}{index === step ? ", current step" : ""}</span></li>)}</ol></nav>;
}

function StepIntroduction({ step, serviceName }: { step: number; serviceName?: string }) {
  const copy = ["Choose a category and, where available, the specific service that fits best.", serviceName ? `Tell us what you're noticing with ${serviceName}. These choices are not a diagnosis.` : "Tell us what you're noticing. These choices are not a diagnosis.", "Share the service address so the team can review regional availability.", "Tell us what timing you prefer. This does not reserve an appointment.", "Provide a reliable way for the team to follow up about this request.", "Check the details below. You can edit any section without starting over."][step];
  return <p className="mt-6 max-w-2xl text-lg leading-8 text-slate">{copy}</p>;
}

type Update = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => void;

function ServiceStep({ draft, update, errors }: { draft: BookingDraft; update: Update; errors: BookingErrors }) {
  const selected = primaryServices.find((item) => item.id === draft.categoryId);
  return <div><fieldset><legend className="text-sm font-bold uppercase tracking-[0.12em] text-navy">Service category</legend><div className="mt-4 grid gap-3 sm:grid-cols-2">{primaryServices.map((category) => <Choice key={category.id} name="category" value={category.id} checked={draft.categoryId === category.id} label={category.name} description={category.shortDescription} onChange={() => { update("categoryId", category.id); update("serviceId", ""); update("problemId", ""); update("brand", ""); update("applianceType", ""); }} />)}</div><FieldError message={errors.categoryId} /></fieldset>{selected?.children.length ? <fieldset className="mt-10"><legend className="text-sm font-bold uppercase tracking-[0.12em] text-navy">Specific service <span className="font-normal normal-case tracking-normal text-slate">— optional</span></legend><div className="mt-4 grid gap-3 sm:grid-cols-2">{selected.children.map((service) => <Choice key={service.id} name="service" value={service.id} checked={draft.serviceId === service.id} label={service.name} description={service.shortDescription} onChange={() => update("serviceId", service.id)} />)}</div><FieldError message={errors.serviceId} /></fieldset> : selected ? <p className="mt-8 border-l-2 border-copper bg-warm-white p-5 leading-7 text-slate">No narrower public service type is required. Continue with {selected.name} and describe what you are noticing.</p> : null}</div>;
}

function ProblemStep({ draft, update, errors, problems, brandOptions }: { draft: BookingDraft; update: Update; errors: BookingErrors; problems: ReturnType<typeof getProblems>; brandOptions: readonly string[] }) {
  return <div className="space-y-10"><fieldset><legend className="text-sm font-bold uppercase tracking-[0.12em] text-navy">What are you noticing?</legend><div className="mt-4 grid gap-3 sm:grid-cols-2">{problems.map((problem) => <Choice key={problem.id} name="problem" value={problem.id} checked={draft.problemId === problem.id} label={problem.label} description={problem.description} onChange={() => update("problemId", problem.id)} />)}<Choice name="problem" value="other" checked={draft.problemId === "other"} label="Something else" description="Describe the concern in your own words." onChange={() => update("problemId", "other")} /></div><FieldError message={errors.problemId} /></fieldset>{draft.categoryId === "appliance-repair" && <Field label="What appliance needs service?" htmlFor="applianceType" optional><select id="applianceType" className={fieldClass} value={draft.applianceType} onChange={(event) => update("applianceType", event.target.value)}><option value="">Choose if known</option>{applianceTypes.map((item) => <option key={item}>{item}</option>)}</select></Field>}<Field label="Anything else we should know?" htmlFor="issueDescription" optional error={errors.issueDescription}><textarea id="issueDescription" rows={5} maxLength={1200} className={fieldClass} value={draft.issueDescription} onChange={(event) => update("issueDescription", event.target.value)} placeholder="Tell us anything that may help us understand the issue. No technical terminology is required." /><p className="mt-2 text-xs text-slate">{draft.issueDescription.length}/1,200 characters</p></Field>{brandOptions.length > 0 && <Field label="Appliance or system brand" htmlFor="brand" optional><input id="brand" list="booking-brands" className={fieldClass} value={draft.brand} onChange={(event) => update("brand", event.target.value)} placeholder="Choose, type another brand, or enter Not sure" /><datalist id="booking-brands">{brandOptions.map((brand) => <option key={brand} value={brand} />)}<option value="Not sure" /></datalist><p className="mt-2 text-sm leading-6 text-slate">Brand is optional. A brand not shown here does not automatically prevent a request.</p></Field>}</div>;
}

function LocationStep({ draft, update, errors }: { draft: BookingDraft; update: Update; errors: BookingErrors }) {
  const outside = draft.state === "OTHER";
  return <div className="grid gap-6 sm:grid-cols-2"><Field label="ZIP code" htmlFor="zipCode" error={errors.zipCode}><input id="zipCode" inputMode="numeric" autoComplete="postal-code" maxLength={5} className={fieldClass} value={draft.zipCode} onChange={(event) => update("zipCode", event.target.value.replace(/\D/g, ""))} /></Field><Field label="State" htmlFor="state" error={errors.state}><select id="state" autoComplete="address-level1" className={fieldClass} value={draft.state} onChange={(event) => { update("state", event.target.value); if (event.target.value !== "OTHER") update("otherState", ""); }}><option value="">Choose a state</option>{stateOptions.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></Field>{outside && <div className="sm:col-span-2"><Field label="State" htmlFor="otherState" error={errors.otherState}><input id="otherState" autoComplete="address-level1" className={fieldClass} value={draft.otherState} onChange={(event) => update("otherState", event.target.value)} /></Field></div>}<div className="sm:col-span-2"><Field label="Street address" htmlFor="street" error={errors.street}><input id="street" autoComplete="street-address" className={fieldClass} value={draft.street} onChange={(event) => update("street", event.target.value)} /></Field></div><Field label="Apartment / unit" htmlFor="unit" optional><input id="unit" autoComplete="address-line2" className={fieldClass} value={draft.unit} onChange={(event) => update("unit", event.target.value)} /></Field><Field label="City" htmlFor="city" error={errors.city}><input id="city" autoComplete="address-level2" className={fieldClass} value={draft.city} onChange={(event) => update("city", event.target.value)} /></Field><div className="sm:col-span-2 border-l-2 border-copper bg-warm-white p-5 text-sm leading-6 text-slate">{outside ? "Apex currently lists service coverage in New York, New Jersey, Connecticut, Massachusetts, and Rhode Island. You can still prepare your request and the team can confirm availability once online submission is connected." : "A valid ZIP format does not establish service eligibility. Exact availability is confirmed separately."}</div></div>;
}

function TimingStep({ draft, update, errors, today }: { draft: BookingDraft; update: Update; errors: BookingErrors; today: string }) {
  return <div><div className="grid gap-6 sm:grid-cols-2"><Field label="First preferred date" htmlFor="preferredDate" error={errors.preferredDate}><input id="preferredDate" type="date" min={today} className={fieldClass} value={draft.preferredDate} onChange={(event) => update("preferredDate", event.target.value)} /></Field><Field label="Second preferred date" htmlFor="alternateDate" optional error={errors.alternateDate}><input id="alternateDate" type="date" min={today} className={fieldClass} value={draft.alternateDate} onChange={(event) => update("alternateDate", event.target.value)} /></Field></div><fieldset className="mt-9"><legend className="text-sm font-bold uppercase tracking-[0.12em] text-navy">Preferred time window</legend><div className="mt-4 grid gap-3 sm:grid-cols-3">{timeWindows.map((option) => <Choice key={option.value} name="timeWindow" value={option.value} checked={draft.timeWindow === option.value} label={option.label} onChange={() => update("timeWindow", option.value)} />)}</div><FieldError message={errors.timeWindow} /></fieldset><p className="mt-8 border-l-2 border-copper bg-warm-white p-5 leading-7 text-slate">Requested timing is a preference and is not confirmed until Apex follows up. No appointment or technician time is reserved here.</p></div>;
}

function ContactStep({ draft, update, errors }: { draft: BookingDraft; update: Update; errors: BookingErrors }) {
  return <div className="grid gap-6 sm:grid-cols-2">{errors.form && <div className="sm:col-span-2"><FieldError message={errors.form} /></div>}<Field label="First name" htmlFor="firstName" error={errors.firstName}><input id="firstName" autoComplete="given-name" className={fieldClass} value={draft.firstName} onChange={(event) => update("firstName", event.target.value)} /></Field><Field label="Last name" htmlFor="lastName" error={errors.lastName}><input id="lastName" autoComplete="family-name" className={fieldClass} value={draft.lastName} onChange={(event) => update("lastName", event.target.value)} /></Field><Field label="Phone" htmlFor="phone" optional error={errors.phone}><input id="phone" type="tel" autoComplete="tel" className={fieldClass} value={draft.phone} onChange={(event) => update("phone", event.target.value)} /></Field><Field label="Email" htmlFor="email" optional error={errors.email}><input id="email" type="email" autoComplete="email" className={fieldClass} value={draft.email} onChange={(event) => update("email", event.target.value)} /></Field><div className="sm:col-span-2"><fieldset><legend className="text-sm font-bold uppercase tracking-[0.12em] text-navy">Preferred contact method</legend><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{contactPreferences.map((option) => <Choice key={option.value} name="contactPreference" value={option.value} checked={draft.contactPreference === option.value} label={option.label} onChange={() => update("contactPreference", option.value)} />)}</div></fieldset></div>{draft.contactPreference === "text" && <div className="sm:col-span-2"><label className="flex cursor-pointer items-start gap-4 border border-steel p-5"><input className="mt-1 size-5 shrink-0 accent-navy" type="checkbox" checked={draft.serviceTextConsent} onChange={(event) => update("serviceTextConsent", event.target.checked)} /><span className="text-sm leading-6 text-slate">I agree that my phone number may be used for service-request text communication. This is not marketing consent, and delivery capability is not connected yet.</span></label><FieldError message={errors.serviceTextConsent} /><p className="mt-3 text-xs text-slate">Final consent language requires business and legal review.</p></div>}<p className="sm:col-span-2 text-sm leading-6 text-slate">Provide at least one contact channel. Apex contact details are not displayed because they have not been verified.</p></div>;
}

function ReviewStep({ draft, edit }: { draft: BookingDraft; edit: (step: number) => void }) {
  const category = getSelectedCategory(draft); const service = getSelectedService(draft); const problem = getProblems(draft.categoryId).find((item) => item.id === draft.problemId);
  const sections = [
    { title: "Service", step: 0, values: [category?.name, service?.name] },
    { title: "What’s happening", step: 1, values: [problem?.label ?? (draft.problemId === "other" ? "Something else" : ""), draft.applianceType, draft.brand, draft.issueDescription] },
    { title: "Location", step: 2, values: [draft.street, draft.unit, `${draft.city}, ${draft.state === "OTHER" ? draft.otherState : draft.state} ${draft.zipCode}`] },
    { title: "Preferred timing", step: 3, values: [draft.preferredDate, draft.alternateDate && `Second choice: ${draft.alternateDate}`, timeWindows.find((item) => item.value === draft.timeWindow)?.label] },
    { title: "Contact", step: 4, values: [`${draft.firstName} ${draft.lastName}`, draft.phone, draft.email, `Preference: ${contactPreferences.find((item) => item.value === draft.contactPreference)?.label}`] },
  ];
  return <div className="border-t border-navy">{sections.map((section) => <section key={section.title} className="grid gap-5 border-b border-steel py-7 sm:grid-cols-[10rem_1fr_auto]"><h3 className="text-sm font-bold uppercase tracking-[0.12em] text-navy">{section.title}</h3><div className="space-y-1 text-base leading-7 text-slate">{section.values.filter(Boolean).map((value) => <p key={value}>{value}</p>)}</div><button type="button" className="min-h-11 self-start text-sm font-semibold text-navy underline decoration-copper underline-offset-4" onClick={() => edit(section.step)}>Edit</button></section>)}<p className="mt-8 border-l-2 border-copper bg-warm-white p-5 leading-7 text-slate">Preparing this request does not send it to Apex. Online submission remains disconnected until a provider is configured.</p></div>;
}

function SummaryRail({ draft, problemLabel, edit }: { draft: BookingDraft; problemLabel?: string; edit: (step: number) => void }) {
  const category = getSelectedCategory(draft); const service = getSelectedService(draft);
  return <aside className="hidden self-start border-t border-navy pt-7 lg:sticky lg:top-32 lg:block" aria-label="Current request summary"><p className="eyebrow">Your request</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">{service?.name ?? category?.name ?? "Service not selected"}</h2><dl className="mt-8 space-y-6 border-t border-steel pt-6"><SummaryItem term="Issue" value={problemLabel ?? (draft.problemId === "other" ? "Something else" : "Not added")} /><SummaryItem term="Location" value={draft.zipCode ? `${draft.city || "City pending"}, ${draft.state || "State pending"} ${draft.zipCode}` : "Not added"} /><SummaryItem term="Preference" value={draft.preferredDate || "Not added"} /></dl>{category && <button type="button" className="text-link mt-7" onClick={() => edit(0)}>Change service</button>}<p className="mt-10 border-t border-steel pt-5 text-sm leading-6 text-slate">A request is not a confirmed appointment. Exact service eligibility and timing require follow-up.</p><div className="mt-8"><p className="text-xs font-bold uppercase tracking-[0.14em] text-navy">Listed coverage</p><p className="mt-3 text-sm leading-6 text-slate">{serviceAreas.map((area) => area.state).join(", ")}</p></div></aside>;
}

function SummaryItem({ term, value }: { term: string; value: string }) { return <div><dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate">{term}</dt><dd className="mt-1 font-semibold text-navy">{value}</dd></div>; }

function Confirmation({ message, draft }: { message: string; draft: BookingDraft }) {
  const confirmationHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { confirmationHeadingRef.current?.focus(); }, []);
  const service = getSelectedService(draft); const category = getSelectedCategory(draft);
  return <section className="border-t-4 border-copper bg-navy px-7 py-12 text-white sm:px-12 sm:py-16" aria-labelledby="request-ready-heading"><p className="eyebrow">Request prepared</p><h2 ref={confirmationHeadingRef} id="request-ready-heading" tabIndex={-1} className="mt-5 max-w-3xl text-balance text-[clamp(3rem,7vw,6rem)] font-semibold leading-[0.9] tracking-[-0.065em]">Your details are ready.</h2><p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">{message}</p><div className="mt-10 border-y border-white/20 py-7"><p className="text-xs font-bold uppercase tracking-[0.14em] text-copper">Service request</p><p className="mt-2 text-2xl font-semibold">{service?.name ?? category?.name}</p><p className="mt-3 text-sm text-white/60">Preferred date: {draft.preferredDate}. This is not a confirmed appointment.</p></div><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/" className="inline-flex min-h-12 items-center justify-center bg-white px-6 text-sm font-semibold uppercase tracking-[0.08em] text-navy">Return home</Link><Link href="/services" className="inline-flex min-h-12 items-center justify-center border border-white/35 px-6 text-sm font-semibold uppercase tracking-[0.08em] text-white">Explore services</Link></div></section>;
}

function Choice({ name, value, checked, label, description, onChange }: { name: string; value: string; checked: boolean; label: string; description?: string; onChange: () => void }) {
  return <label className={`cursor-pointer border p-5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-copper ${checked ? "border-navy bg-navy text-white" : "border-steel bg-soft-white text-navy hover:border-navy"}`}><input type="radio" className="sr-only" name={name} value={value} checked={checked} onChange={onChange} /><span className="block text-base font-semibold">{label}</span>{description && <span className={`mt-2 block text-sm leading-6 ${checked ? "text-white/65" : "text-slate"}`}>{description}</span>}</label>;
}

function Field({ label, htmlFor, optional, error, children }: { label: string; htmlFor: string; optional?: boolean; error?: string; children: ReactNode }) {
  const errorId = `${htmlFor}-error`;
  const enhancedChildren = Children.map(children, (child, index) => index === 0 && isValidElement(child)
    ? cloneElement(child as ReactElement<Record<string, unknown>>, { "aria-invalid": error ? true : undefined, "aria-describedby": error ? errorId : undefined })
    : child);
  return <div><label htmlFor={htmlFor} className="mb-2 block text-sm font-bold text-navy">{label}{optional && <span className="ml-2 font-normal text-slate">Optional</span>}</label>{enhancedChildren}<FieldError id={errorId} message={error} /></div>;
}

function FieldError({ id, message }: { id?: string; message?: string }) { return message ? <p id={id} className="mt-2 border-l-2 border-copper pl-3 text-sm font-semibold text-navy">{message}</p> : null; }

const ErrorSummary = forwardRef<HTMLDivElement, { errors: BookingErrors }>(function ErrorSummary({ errors }, ref) {
  return <div ref={ref} tabIndex={-1} role="alert" className="mt-8 border-l-4 border-copper bg-warm-white p-5"><p className="font-semibold text-navy">Please review this step.</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate">{Object.values(errors).filter(Boolean).map((error) => <li key={error}>{error}</li>)}</ul></div>;
});
