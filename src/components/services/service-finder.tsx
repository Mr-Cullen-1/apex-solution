"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { BookingLink } from "@/components/ui/booking-link";
import { ArrowRightIcon, CloseIcon } from "@/components/ui/icons";
import { ServiceIcon } from "@/components/ui/service-icon";
import { matchesServiceQuery } from "@/lib/service-search";

type DirectoryItem = { id: string; name: string; href: string; shortDescription: string };
type DirectoryCategory = DirectoryItem & { children: DirectoryItem[] };

export function ServiceFinder({ categories }: { categories: DirectoryCategory[] }) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const matches = (item: DirectoryItem) => matchesServiceQuery(item, query);
  const filtered = categories.flatMap((category) => {
    if (matches(category)) return [category];
    const children = category.children.filter(matches);
    return children.length ? [{ ...category, children }] : [];
  });

  return (
    <div data-analytics-placement="service_finder">
      <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-navy">Find your service</label>
      <div className="relative max-w-2xl">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="pointer-events-none absolute left-4 top-4 size-5 text-slate"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
        <input id={inputId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try AC repair, heating or appliances" autoComplete="off" className="min-h-14 w-full rounded-card border border-steel bg-surface py-3 pl-12 pr-14 text-base text-navy [&::-webkit-search-cancel-button]:appearance-none" />
        {query && <button type="button" aria-label="Clear service search" onClick={() => { setQuery(""); document.getElementById(inputId)?.focus(); }} className="absolute right-1 top-1 grid size-12 place-items-center rounded-control text-slate"><CloseIcon className="size-5" /></button>}
      </div>
      <p role="status" className="mt-3 text-xs text-slate">{query.trim() ? `${filtered.length} service ${filtered.length === 1 ? "category" : "categories"} found` : "Choose a category, or go straight to a specific service."}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filtered.map((category) => (
          <article key={category.id} className="min-w-0 rounded-panel border border-steel bg-surface p-5 sm:p-6">
            <Link href={category.href} className="group flex min-h-12 items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-card bg-surface-soft text-brand-primary"><ServiceIcon service={category.id} className="size-6" /></span>
              <h2 className="min-w-0 flex-1 text-xl font-semibold tracking-tight text-navy">{category.name}</h2>
              <ArrowRightIcon className="size-5 shrink-0 text-brand-primary motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
            </Link>
            <p className="mt-3 text-sm leading-6 text-slate">{category.shortDescription}</p>
            {category.children.length > 0 && <ul className="mt-4 grid gap-x-4 border-t border-steel pt-2 sm:grid-cols-2">{category.children.map((service) => <li key={service.id}><Link href={service.href} className="flex min-h-11 items-center gap-2 text-sm text-navy hover:text-brand-primary hover:underline"><span aria-hidden="true" className="text-brand-primary">↗</span>{service.name}</Link></li>)}</ul>}
            <BookingLink placement="service_finder" categoryId={category.id} variant="text" className="mt-3">Request service</BookingLink>
          </article>
        ))}
      </div>
      {!filtered.length && <div className="mt-6 rounded-panel border border-steel bg-surface p-6"><h2 className="text-lg font-semibold text-navy">Let’s find the right starting point.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate">No matching service name. Try a broader term, or tell Apex what is happening and we’ll help you choose.</p><div className="mt-4 flex flex-wrap gap-4"><button type="button" onClick={() => setQuery("")} className="text-link min-h-12 underline">Show all services</button><BookingLink placement="service_finder" variant="call">Help me choose</BookingLink></div></div>}
    </div>
  );
}
