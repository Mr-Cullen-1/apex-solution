"use client";

import { useChat } from "@/features/chat/chat-context";
import { MessageIcon } from "@/components/ui/icons";
import { useBookNow } from "@/features/booking/book-now-context";

/** Desktop help entry. Smaller screens use Help in the shared navigation dock. */
export function ChatLauncher() {
  const { isOpen, open } = useChat();
  const { isOpen: bookingOpen } = useBookNow();
  if (isOpen || bookingOpen) return null;

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open Apex Assistant"
      title="Ask Apex"
      className="fixed bottom-6 right-1 z-[45] hidden size-11 items-center justify-center rounded-control border border-steel bg-surface text-navy shadow-soft transition-colors hover:bg-surface-soft xl:flex"
    >
      <MessageIcon className="size-6" />
    </button>
  );
}
