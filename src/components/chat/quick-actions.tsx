"use client";

import { contact } from "@/content/company";
import { useBookNow } from "@/features/booking/book-now-context";
import { useChat } from "@/features/chat/chat-context";

const chipClass =
  "inline-flex min-h-9 items-center rounded-control border border-steel bg-surface px-3.5 text-xs font-semibold text-navy transition-colors hover:border-navy hover:bg-page-bg";

/** Four chips send a starter message into the real Gemini-backed
 * conversation (see chat-context.tsx / features/chat/gemini.ts).
 * "Book a service" is a direct integration with the existing global
 * booking modal — no second booking UI — and "Talk to someone" is a plain
 * `tel:` link sourced from the canonical company contact config, never a
 * hardcoded number. */
export function QuickActions() {
  const { sendMessage, close } = useChat();
  const { open: openBookNow } = useBookNow();

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <button type="button" className={chipClass} onClick={() => sendMessage("My AC isn't cooling.")}>
        AC not cooling
      </button>
      <button type="button" className={chipClass} onClick={() => sendMessage("I'm having a heating issue.")}>
        Heating issue
      </button>
      <button type="button" className={chipClass} onClick={() => sendMessage("I need help with an appliance repair.")}>
        Appliance repair
      </button>
      <button type="button" className={chipClass} onClick={() => sendMessage("I'm having a water heater problem.")}>
        Water heater
      </button>
      <button
        type="button"
        className={chipClass}
        onClick={() => {
          close();
          openBookNow();
        }}
      >
        Book a service
      </button>
      {contact.phoneHref && (
        <a href={contact.phoneHref} className={chipClass}>
          Talk to someone
        </a>
      )}
    </div>
  );
}
