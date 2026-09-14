"use client";

import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { CHAT_MAX_MESSAGE_LENGTH, useChat } from "@/features/chat/chat-context";
import { getChatActions, type ChatAction } from "@/features/chat/actions";
import { CloseIcon, MessageIcon, SendIcon } from "@/components/ui/icons";
import { ChatMessageBubble } from "./chat-message";
import { QuickActions } from "./quick-actions";

// Focus trap / Escape / scroll-lock / focus-restore below intentionally
// mirror features/booking/book-now-modal.tsx's proven dialog pattern
// exactly, rather than introducing a new one.
export function ChatPanel() {
  const { isOpen, close, messages, input, setInput, isSending, sendMessage } = useChat();
  const headingId = useId();

  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen, close]);

  // Scroll the newest message into view. Respects reduced motion the same
  // way the rest of the site does (globals.css only overrides CSS
  // transitions/animations, not an imperative scrollTo, so it's checked
  // here explicitly).
  useEffect(() => {
    const node = conversationRef.current;
    if (!node) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollTo({ top: node.scrollHeight, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [messages, isSending]);

  if (!isOpen) return null;

  function handleSend() {
    sendMessage(input);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  const canSend = input.trim().length > 0 && !isSending;

  return (
    <div
      className="fixed inset-0 z-[55] flex items-end justify-center bg-ink/45 backdrop-blur-sm motion-safe:animate-[fade-slide_200ms_ease-out] md:items-end md:justify-end md:bg-transparent md:p-6 md:backdrop-blur-none"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="flex h-[min(85vh,680px)] w-full flex-col overflow-hidden rounded-t-hero border border-steel bg-surface shadow-hero motion-safe:animate-[fade-slide_240ms_ease-out] md:h-[620px] md:w-[400px] md:rounded-panel"
      >
        <div className="flex items-center justify-between gap-3 border-b border-steel bg-brand-soft px-4 py-3.5 sm:px-5">
          <div>
            <h2 id={headingId} className="text-sm font-semibold tracking-[-0.01em] text-navy">
              Apex Assistant
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
              <span className="relative flex size-1.5">
                <span
                  aria-hidden="true"
                  className="absolute inline-flex size-1.5 rounded-full bg-status-live motion-safe:animate-[pulse-dot_1.8s_ease-in-out_infinite]"
                />
              </span>
              Online
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label="Close Apex Assistant"
            className="grid size-9 shrink-0 place-items-center rounded-control text-navy transition-colors hover:bg-page-bg"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-6 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-control bg-brand-soft text-brand-primary">
              <MessageIcon className="size-5" />
            </div>
            <div>
              <p className="text-base font-semibold tracking-[-0.01em] text-navy">Hi! How can I help?</p>
              <p className="mt-1.5 text-sm leading-6 text-slate">
                Ask me about repairs, heating, cooling, appliances, or booking a service.
              </p>
            </div>
            <QuickActions />
          </div>
        ) : (
          <div ref={conversationRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
            {messages.map((message, index) => {
              // Only the latest assistant message may show conversion
              // actions — prevents CTA clutter from piling up under every
              // past reply as the conversation continues.
              const isLatestAssistantMessage = message.role === "assistant" && index === messages.length - 1;
              const actions: ChatAction[] =
                isLatestAssistantMessage && message.intent && message.safety
                  ? getChatActions({ intent: message.intent, categoryId: message.categoryId ?? null, safety: message.safety })
                  : [];
              return <ChatMessageBubble key={message.id} message={message} actions={actions} />;
            })}
            {isSending && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-1 rounded-card border border-steel bg-page-bg px-4 py-3"
                  aria-live="polite"
                  aria-label="Apex Assistant is typing"
                >
                  <span className="size-1.5 rounded-full bg-slate motion-safe:animate-[pulse-dot_1.2s_ease-in-out_infinite]" />
                  <span className="size-1.5 rounded-full bg-slate motion-safe:animate-[pulse-dot_1.2s_ease-in-out_infinite_0.15s]" />
                  <span className="size-1.5 rounded-full bg-slate motion-safe:animate-[pulse-dot_1.2s_ease-in-out_infinite_0.3s]" />
                </div>
              </div>
            )}
          </div>
        )}

        <div
          className="flex items-end gap-2 border-t border-steel bg-surface px-4 pt-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <textarea
            rows={1}
            maxLength={CHAT_MAX_MESSAGE_LENGTH}
            placeholder="Ask about your home service..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            disabled={isSending}
            aria-label="Message"
            className="min-h-10 max-h-32 flex-1 resize-none rounded-control border border-steel bg-surface px-3.5 py-2 text-sm text-navy outline-none transition-colors placeholder:text-slate/65 focus:border-brand-primary disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            className="grid size-10 shrink-0 place-items-center rounded-control bg-navy text-white transition-colors hover:bg-copper disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SendIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
