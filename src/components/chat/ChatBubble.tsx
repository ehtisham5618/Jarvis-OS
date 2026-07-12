/**
 * ChatBubble
 *
 * Renders a single chat message — either a user message (right-aligned)
 * or an assistant response (left-aligned with Markdown + streaming indicator).
 */

import { memo } from "react";
import { Sparkles } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { ChatMessage } from "@/services/interfaces/IAIService";
import { useUserStore } from "@/stores/user.store";

interface ChatBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span
        className="size-1.5 animate-bounce rounded-full bg-[#61c7ff]"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="size-1.5 animate-bounce rounded-full bg-[#4f7dff]"
        style={{ animationDelay: "120ms" }}
      />
      <span
        className="size-1.5 animate-bounce rounded-full bg-[#7b5cff]"
        style={{ animationDelay: "240ms" }}
      />
    </div>
  );
}

const UserBubble = memo(function UserBubble({ message }: { message: ChatMessage }) {
  const { profile } = useUserStore();
  const initials = profile?.preferredName ? profile.preferredName.slice(0, 2).toUpperCase() : "ME";

  return (
    <div className="flex items-end justify-end gap-3 animate-fade-in">
      <div className="max-w-[75%]">
        <div className="rounded-2xl rounded-br-sm bg-gradient-to-br from-[#4f7dff] to-[#7b5cff] px-4 py-3 text-sm text-white shadow-[0_8px_24px_-8px_rgba(79,125,255,0.4)]">
          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className="mt-1 text-right text-[10px] text-white/30">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      {/* Avatar */}
      <div className="mb-5 grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.08] text-[11px] font-semibold text-white/60">
        {initials}
      </div>
    </div>
  );
});

const AssistantBubble = memo(function AssistantBubble({
  message,
  isStreaming,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
}) {
  const showTyping = isStreaming && message.content === "";
  const showContent = message.content.length > 0;

  return (
    <div className="flex items-end gap-3 animate-fade-in">
      {/* Jarvis icon */}
      <div className="mb-5 grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#4f7dff] to-[#7b5cff] shadow-[0_0_16px_-4px_rgba(79,125,255,0.6)]">
        <Sparkles className="size-3.5 text-white" strokeWidth={2.5} />
      </div>

      <div className="max-w-[80%] min-w-0">
        {/* Model badge */}
        {message.model && (
          <div className="mb-1.5 flex items-center gap-2">
            <span className="rounded-full border border-[#4f7dff]/30 bg-[#4f7dff]/10 px-2 py-0.5 text-[10px] font-medium text-[#61c7ff]">
              {message.model}
            </span>
          </div>
        )}

        {/* Bubble */}
        <div className="rounded-2xl rounded-bl-sm border border-white/[0.06] bg-white/[0.03] px-4 py-3 backdrop-blur-sm">
          {showTyping && <TypingIndicator />}
          {showContent && (
            <>
              <MarkdownRenderer content={message.content} />
              {/* Still streaming: show cursor */}
              {isStreaming && (
                <span className="mt-1 inline-block h-4 w-0.5 animate-pulse bg-[#61c7ff]" />
              )}
            </>
          )}
        </div>

        {/* Metadata row (only on completed messages) */}
        {!isStreaming && (
          <div className="mt-1 flex items-center gap-3 text-[10px] text-white/25">
            <span>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {message.tokenCount && <span>{message.tokenCount.toLocaleString()} tokens</span>}
            {message.latencyMs && <span>{(message.latencyMs / 1000).toFixed(1)}s</span>}
          </div>
        )}
      </div>
    </div>
  );
});

export const ChatBubble = memo(function ChatBubble({ message, isStreaming }: ChatBubbleProps) {
  if (message.role === "user") {
    return <UserBubble message={message} />;
  }
  return <AssistantBubble message={message} isStreaming={isStreaming} />;
});
