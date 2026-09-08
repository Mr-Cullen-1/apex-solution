"use client";

import { usePathname } from "next/navigation";
import { contact } from "@/content/company";
import { bookingEntry } from "@/content/cta";
import { MessageIcon, PhoneIcon } from "@/components/ui/icons";

export function MobileActionBar() {
  const pathname = usePathname();
  if (pathname === bookingEntry.href) return null;
  if (!contact.phoneHref) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-steel bg-surface/95 p-3 shadow-[0_-12px_30px_rgba(13,20,8,0.08)] backdrop-blur lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <a className="flex min-h-14 items-center justify-center gap-2 rounded-control bg-copper text-sm font-bold uppercase tracking-[0.06em] text-white" href={contact.phoneHref}>
        <PhoneIcon className="size-4" />Call
      </a>
      {contact.smsHref && (
        <a className="flex min-h-14 items-center justify-center gap-2 rounded-control bg-navy text-sm font-bold uppercase tracking-[0.06em] text-white" href={contact.smsHref}>
          <MessageIcon className="size-4" />Text
        </a>
      )}
    </div>
  );
}
