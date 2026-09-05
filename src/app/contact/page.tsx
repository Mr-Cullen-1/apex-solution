import type { Metadata } from "next";
import Link from "next/link";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { company, contact } from "@/content/company";

export const metadata: Metadata = {
  title: "Contact Apex Home Services",
  description: "Find the right path to request service, explore Apex services, check listed coverage, or ask about supported brands.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact Apex Home Services", description: "Choose the right path for service, coverage, or equipment-brand questions.", url: "/contact" },
  robots: { index: true, follow: true },
};

const pathways = [
  { number: "01", title: "Need help choosing a service?", description: "Explore the verified service categories and common homeowner situations.", label: "Explore services", href: "/services" },
  { number: "02", title: "Checking coverage?", description: "Review the confirmed county directory across five Northeast states.", label: "View service areas", href: "/service-areas" },
  { number: "03", title: "Have a brand question?", description: "Browse the confirmed appliance and HVAC brand directory.", label: "Browse brands", href: "/brands" },
] as const;

export default function ContactPage() {
  const verifiedDetails = [contact.phone && { label: "Phone", value: contact.phone, href: `tel:${contact.phone}` }, contact.email && { label: "Email", value: contact.email, href: `mailto:${contact.email}` }, contact.address && { label: "Address", value: contact.address }, contact.hours && { label: "Hours", value: contact.hours }].filter(Boolean);
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-steel bg-warm-white py-16 sm:py-24"><Container className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end"><div><p className="eyebrow">Contact Apex</p><h1 className="mt-5 max-w-5xl text-balance text-[clamp(4rem,9vw,8.5rem)] font-semibold leading-[0.84] tracking-[-0.075em] text-navy">Start with the right path forward.</h1></div><div><p className="text-lg leading-8 text-slate">The primary way to request help from {company.name} is the guided service-request flow. It prepares your details for review without claiming a confirmed appointment.</p><BookingLink className="mt-8">Request service</BookingLink></div></Container></section>

      <section className="py-20 sm:py-28" aria-labelledby="contact-paths-heading"><Container><div className="max-w-3xl"><p className="eyebrow">Other questions</p><h2 id="contact-paths-heading" className="mt-5 text-balance text-[clamp(3rem,7vw,6rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-navy">Find information without starting over.</h2></div><div className="mt-14 grid border-t border-navy md:grid-cols-3">{pathways.map((path) => <Link key={path.href} href={path.href} className="group flex min-h-80 flex-col justify-between border-b border-steel p-7 transition-colors hover:bg-warm-white md:border-r md:last:border-r-0 sm:p-9"><span className="text-xs font-bold tracking-[0.16em] text-copper">{path.number}</span><div><h3 className="text-3xl font-semibold tracking-[-0.045em] text-navy">{path.title}</h3><p className="mt-4 leading-7 text-slate">{path.description}</p></div><span className="mt-8 flex items-center gap-3 text-sm font-semibold text-navy">{path.label}<ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" /></span></Link>)}</div></Container></section>

      {verifiedDetails.length > 0 && <section className="border-y border-steel bg-warm-white py-16" aria-labelledby="business-details-heading"><Container><h2 id="business-details-heading" className="text-3xl font-semibold tracking-[-0.04em]">Business contact information</h2><dl className="mt-8 grid gap-8 sm:grid-cols-2">{verifiedDetails.map((detail) => detail && <div key={detail.label} className="border-t border-navy pt-4"><dt className="text-xs font-bold uppercase tracking-[0.14em] text-copper">{detail.label}</dt><dd className="mt-2 text-lg font-semibold text-navy">{"href" in detail && detail.href ? <a href={detail.href}>{detail.value}</a> : detail.value}</dd></div>)}</dl></Container></section>}

      <section className="bg-navy py-20 text-white sm:py-24"><Container><p className="eyebrow">Request service</p><h2 className="mt-5 max-w-5xl text-balance text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.065em]">Tell us what you’re noticing.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">Choose the closest service, share the issue and location, and provide preferred timing. Online delivery remains unconnected, so the flow will not claim Apex received the request.</p><BookingLink className="mt-9 border-white bg-white text-navy hover:border-copper hover:bg-copper hover:text-white">Prepare a request</BookingLink></Container></section>
    </main>
  );
}
