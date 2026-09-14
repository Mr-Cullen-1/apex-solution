"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CHAT_MAX_MESSAGES, CHAT_MAX_MESSAGE_LENGTH } from "./model";
import type { ChatAssistantReply, ChatMessage, ChatWireMessage } from "./types";

type ChatContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  isSending: boolean;
  sendMessage: (content: string) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
}

export { CHAT_MAX_MESSAGE_LENGTH };

const CONNECTION_ERROR_MESSAGE =
  "I'm having trouble connecting right now. You can still book a service or call Apex directly.";
const RATE_LIMITED_MESSAGE =
  "You've sent several messages in a short time. Please try again shortly, or use the booking/call options if you need help now.";

function createMessageId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type ChatApiResponse =
  | { ok: true; status: "answered"; reply: ChatAssistantReply }
  | { ok: false; status: string };

/** Phase 2: in-memory only, intentionally reset on refresh — no
 * localStorage/sessionStorage/database. Persistence, if ever added, is a
 * later-phase decision. Conversation history sent to the server is bounded
 * client-side too (CHAT_MAX_MESSAGES), though the server never trusts that
 * — see features/chat/model.ts. */
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Always holds the latest committed `messages`, so sendMessage can build
  // the outgoing request from real state instead of a stale closure —
  // updated synchronously alongside every setMessages call below, not via
  // an effect (there's nothing to react to; this is just a "latest value"
  // mirror).
  const messagesRef = useRef<ChatMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((current) => !current), []);

  const sendMessage = useCallback((content: string) => {
    const trimmed = content.trim().slice(0, CHAT_MAX_MESSAGE_LENGTH);
    if (!trimmed || abortRef.current) return;

    const userMessage: ChatMessage = { id: createMessageId(), role: "user", content: trimmed };
    const nextMessages = [...messagesRef.current, userMessage];
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const wireMessages: ChatWireMessage[] = nextMessages
      .slice(-CHAT_MAX_MESSAGES)
      .map((message) => ({ role: message.role, content: message.content }));

    (async () => {
      // Only a genuine, validated "answered" reply carries intent/category/
      // safety/emergencyKind onto the message — every fallback branch below
      // is a local/system message, not a validated assistant recommendation,
      // so it deliberately omits them. features/chat/actions.ts treats a
      // message with no metadata as having no eligible conversion actions.
      let assistantMessage: ChatMessage;
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: wireMessages }),
          signal: controller.signal,
        });
        const data = (await response.json()) as ChatApiResponse;
        if (data.ok && data.status === "answered") {
          assistantMessage = {
            id: createMessageId(),
            role: "assistant",
            content: data.reply.message,
            intent: data.reply.intent,
            categoryId: data.reply.categoryId,
            safety: data.reply.safety,
            emergencyKind: data.reply.emergencyKind,
          };
        } else if (!data.ok && data.status === "rate_limited") {
          assistantMessage = { id: createMessageId(), role: "assistant", content: RATE_LIMITED_MESSAGE };
        } else {
          assistantMessage = { id: createMessageId(), role: "assistant", content: CONNECTION_ERROR_MESSAGE };
        }
      } catch {
        // Network failure, abort, or malformed JSON — the friendly fallback
        // covers it. Never fabricate a local AI-sounding answer here.
        assistantMessage = { id: createMessageId(), role: "assistant", content: CONNECTION_ERROR_MESSAGE };
      }

      if (controller.signal.aborted) return;
      messagesRef.current = [...messagesRef.current, assistantMessage];
      setMessages(messagesRef.current);
      setIsSending(false);
      abortRef.current = null;
    })();
  }, []);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle, messages, input, setInput, isSending, sendMessage }),
    [isOpen, open, close, toggle, messages, input, isSending, sendMessage],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
