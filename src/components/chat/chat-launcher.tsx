"use client";

import { useChat } from "@/features/chat/chat-context";
import { MessageIcon } from "@/components/ui/icons";

/** Global floating launcher. Hidden while the panel is open (the panel's
 * own header close button is the affordance then) so nothing sits stacked
 * under the panel in the same corner. Positioned via `.chat-launcher-offset`
 * (globals.css) — see that rule for why this can't be a naive `bottom-4`:
 * it must clear MobileActionBar (fixed, ~80px incl. its own safe-area
 * padding, z-40) below `md`, and drop back to a normal corner offset once
 * MobileActionBar is hidden (`md:hidden`) at `md` and above. */
export function ChatLauncher() {
  const { isOpen, open } = useChat();
  if (isOpen) return null;

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open Apex Assistant"
      className="chat-launcher-offset fixed right-4 z-[45] grid size-14 place-items-center rounded-control bg-navy text-white shadow-card transition-colors hover:bg-copper md:right-6"
    >
      <MessageIcon className="size-6" />
    </button>
  );
}
