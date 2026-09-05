"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { contact } from "@/content/company";
import { bookingEntry, contactEntry } from "@/content/cta";

export function MobileActionBar() {
  const pathname = usePathname();
  if (pathname === bookingEntry.href) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-steel bg-soft-white p-3 shadow-[0_-8px_30px_rgba(16,29,44,0.08)] lg:hidden">
      {contact.phone ? (
        <a className="grid min-h-12 place-items-center border border-steel text-sm font-semibold uppercase tracking-[0.08em] text-navy" href={`tel:${contact.phone}`}>Call now</a>
      ) : (
        <Link className="grid min-h-12 place-items-center border border-steel text-sm font-semibold uppercase tracking-[0.08em] text-navy" href={contactEntry.href}>Contact</Link>
      )}
      <Link className="grid min-h-12 place-items-center bg-navy text-sm font-semibold uppercase tracking-[0.08em] text-white" href={bookingEntry.href}>Request service</Link>
    </div>
  );
}
