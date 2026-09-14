"use client";

import { contact } from "@/content/company";
import { useBookNow } from "@/features/booking/book-now-context";
import { useChat } from "@/features/chat/chat-context";
import type { ChatAction } from "@/features/chat/actions";

// "book" is the stronger, primary CTA (matches the site's solid navy
// button convention); "call" is the lighter secondary/outline style,
// visually the same weight as the Phase 1 quick-action chips.
const bookButtonClass =
  "inline-flex min-h-9 items-center rounded-control bg-navy px-4 text-xs font-semibold text-white transition-colors hover:bg-copper";
const callButtonClass =
  "inline-flex min-h-9 items-center rounded-control border border-steel bg-surface px-4 text-xs font-semibold text-navy transition-colors hover:border-navy hover:bg-page-bg";

/** Renders the small, message-attached conversion action row. Reuses the
 * existing global booking flow and canonical contact config exactly like
 * quick-actions.tsx — never a second booking UI, never a model-generated
 * phone number. Closing the chat before opening Book Now avoids two
 * simultaneous focus traps, same as the Phase 1 "Book a service" quick
 * action; "Call Apex" is a plain `tel:` link and doesn't need the chat
 * closed first, same as "Talk to someone". */
export function ChatActionRow({ actions }: { actions: ChatAction[] }) {
  const { close } = useChat();
  const { open: openBookNow } = useBookNow();

  if (!actions.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        if (action.type === "book") {
          return (
            <button
              key={action.type}
              type="button"
              className={bookButtonClass}
              onClick={() => {
                close();
                openBookNow({ categoryId: action.categoryId ?? undefined });
              }}
            >
              {action.label}
            </button>
          );
        }
        if (!contact.phoneHref) return null;
        return (
          <a key={action.type} href={contact.phoneHref} className={callButtonClass}>
            {action.label}
          </a>
        );
      })}
    </div>
  );
}
