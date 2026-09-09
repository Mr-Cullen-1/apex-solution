import type { Metadata } from "next";
import Link from "next/link";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon, PhoneIcon } from "@/components/ui/icons";
import { company, contact } from "@/content/company";
import { sharedOpenGraph } from "@/content/social-meta";

export const metadata: Metadata = {
  title: "Contact Apex Home Support",
  description: "Find the right path to request service, explore Apex services, check listed coverage, or ask about supported brands.",
  alternates: { canonical: "/contact" },
  openGraph: { ...sharedOpenGraph, title: "Contact Apex Home Support", description: "Choose the right path for service, coverage, or equipment-brand questions.", url: "/contact" },
  robots: { index: true, follow: true },
};

const pathways = [
  { number: "01", title: "Need help choosing a service?", description: "Explore the verified service categories and common homeowner situations.", label: "Explore services", href: "/services" },
  { number: "02", title: "Checking coverage?", description: "Review the county directory across five Northeast states.", label: "View service areas", href: "/service-areas" },
  { number: "03", title: "Have a brand question?", description: "Browse the appliance and HVAC brand directory.", label: "Browse brands", href: "/brands" },
] as const;

export default function ContactPage() {
  const verifiedDetails = [contact.phone && { label: "Phone", value: contact.phone, href: contact.phoneHref ?? undefined }, contact.email && { label: "Email", value: contact.email, href: `mailto:${contact.email}` }, contact.address && { label: "Address", value: contact.address }, contact.hours && { label: "Hours", value: contact.hours }].filter(Boolean);
  return (
    <main id="main-content" className="flex-1 bg-page-bg">
      <section className="bg-page-bg pb-16 pt-6 sm:pb-20 sm:pt-8"><Container><div className="grid gap-12 rounded-hero border border-steel bg-surface p-8 shadow-hero sm:p-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end"><div><p className="eyebrow">Contact Apex</p><h1 className="mt-5 max-w-5xl text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-navy">Start with the right path forward.</h1></div><div><p className="text-lg leading-8 text-slate">The fastest way to reach {company.name} is to call. Prefer not to call right now? Book Now takes a minute and our team will follow up to confirm details.</p><div className="mt-8 flex flex-wrap gap-3">{contact.phoneHref && <a href={contact.phoneHref} className="inline-flex min-h-12 items-center gap-2 rounded-control bg-copper px-6 text-sm font-semibold text-white"><PhoneIcon className="size-4" />Call {contact.phone}</a>}<BookingLink variant="secondary" /></div></div></div></Container></section>

      <section className="bg-page-bg section-y" aria-labelledby="contact-paths-heading"><Container><div className="max-w-3xl"><p className="eyebrow">Other questions</p><h2 id="contact-paths-heading" className="mt-5 text-balance text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-navy">Find information without starting over.</h2></div><div className="mt-14 grid gap-4 md:grid-cols-3">{pathways.map((path) => <Link key={path.href} href={path.href} className="group flex min-h-64 flex-col justify-between rounded-panel border border-steel bg-surface p-7 shadow-soft transition-transform duration-300 hover:-translate-y-1 sm:p-9"><span className="text-xs font-bold tracking-[0.16em] text-copper">{path.number}</span><div><h3 className="text-2xl font-semibold tracking-[-0.03em] text-navy">{path.title}</h3><p className="mt-4 leading-7 text-slate">{path.description}</p></div><span className="mt-8 flex items-center gap-3 text-sm font-semibold text-navy">{path.label}<ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" /></span></Link>)}</div></Container></section>

      {verifiedDetails.length > 0 && <section className="bg-page-bg pb-20" aria-labelledby="business-details-heading"><Container><div className="rounded-panel border border-steel bg-surface p-8 shadow-soft sm:p-10"><h2 id="business-details-heading" className="text-2xl font-semibold tracking-[-0.03em] text-navy">Business contact information</h2><dl className="mt-8 grid gap-8 sm:grid-cols-2">{verifiedDetails.map((detail) => detail && <div key={detail.label} className="border-t border-steel pt-4"><dt className="text-xs font-bold uppercase tracking-[0.14em] text-copper">{detail.label}</dt><dd className="mt-2 text-lg font-semibold text-navy">{"href" in detail && detail.href ? <a href={detail.href}>{detail.value}</a> : detail.value}</dd></div>)}</dl></div></Container></section>}

      <section className="bg-page-bg section-y-bottom"><Container><div className="flex flex-col items-start justify-between gap-10 rounded-hero bg-brand-dark p-8 text-white sm:p-12 lg:flex-row lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-white/75">Call or book now</p><h2 className="mt-5 max-w-5xl text-balance text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">Tell us what you’re noticing.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">Share the issue and your ZIP code. Online submission is not yet connected, so the flow will not claim Apex received the request — call for the fastest response.</p></div><div className="flex flex-col gap-3 sm:flex-row">{contact.phoneHref && <a href={contact.phoneHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-white px-6 text-sm font-semibold text-navy transition-colors hover:bg-copper hover:text-white"><PhoneIcon className="size-4" />Call {contact.phone}</a>}<BookingLink variant="outline-invert" /></div></div></Container></section>
    </main>
  );
}
