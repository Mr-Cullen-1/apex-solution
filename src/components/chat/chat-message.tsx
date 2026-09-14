import type { ChatMessage } from "@/features/chat/types";
import type { ChatAction } from "@/features/chat/actions";
import { ChatActionRow } from "./chat-action-row";

export function ChatMessageBubble({ message, actions = [] }: { message: ChatMessage; actions?: ChatAction[] }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
      <p
        className={
          isUser
            ? "max-w-[85%] rounded-card bg-navy px-4 py-2.5 text-sm leading-6 whitespace-pre-wrap text-white"
            : "max-w-[85%] rounded-card border border-steel bg-page-bg px-4 py-2.5 text-sm leading-6 whitespace-pre-wrap text-navy"
        }
      >
        {message.content}
      </p>
      {!isUser && <ChatActionRow actions={actions} />}
    </div>
  );
}
