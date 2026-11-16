"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { contact } from "@/content/company";
import { primaryServices } from "@/content/services";
import { GridIcon, MessageIcon, PhoneIcon } from "@/components/ui/icons";
import { useBookNow } from "@/features/booking/book-now-context";
import { useChat } from "@/features/chat/chat-context";

export function MobileActionBar() {
  const pathname = usePathname();
  const { open, isOpen: bookingOpen, homeCategoryId } = useBookNow();
  const { open: openChat, isOpen: chatOpen } = useChat();
  const category = primaryServices.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
  const service = category?.children.find((item) => pathname === item.href);
  if (pathname === "/book") return null;

  return (
    <nav aria-label="Quick navigation" className="app-dock" inert={bookingOpen || chatOpen}>
      <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m3 10 9-7 9 7v10H3V10Z" strokeLinejoin="round" /><path d="M9 20v-7h6v7" /></svg>
        <span>Home</span>
      </Link>
      <Link href="/services" aria-current={pathname.startsWith("/services") ? "page" : undefined}><GridIcon /><span>Services</span></Link>
      <button type="button" onClick={openChat} aria-label="Help from Apex Assistant"><MessageIcon /><span>Help</span></button>
      {contact.phoneHref && <a href={contact.phoneHref} aria-label={`Call Apex at ${contact.phone}`}><PhoneIcon /><span>Call</span></a>}
      <button type="button" className="dock-book" onClick={() => open({ categoryId: pathname === "/" ? homeCategoryId : category?.id, serviceId: service?.id })}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4m8-4v4M4 11h16m-12 5 2 2 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span>Book now</span>
      </button>
    </nav>
  );
}
