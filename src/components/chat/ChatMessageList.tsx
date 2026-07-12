/**
 * ChatMessageList
 *
 * Scrollable list of chat bubbles. Auto-scrolls to bottom during streaming.
 * Shows a "scroll to bottom" button when user scrolls up manually.
 * Empty state when no messages exist.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, ArrowDown } from "lucide-react";
import { ChatBubble } from "./ChatBubble";
import type { ChatMessage } from "@/services/interfaces/IAIService";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 animate-fade-in">
      <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-[#4f7dff]/20 to-[#7b5cff]/20 border border-white/[0.06]">
        <Sparkles className="size-7 text-[#61c7ff]" strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <h3 className="text-base font-medium text-white/80">Start a conversation</h3>
        <p className="mt-1 text-sm text-white/40">
          Ask Jarvis anything — code, research, analysis, or just chat.
        </p>
      </div>
    </div>
  );
}

export function ChatMessageList({ messages, isStreaming }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isUserScrolledUp = useRef(false);

  // Detect if user manually scrolled up
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isUserScrolledUp.current = distFromBottom > 100;
    setShowScrollButton(distFromBottom > 100);
  }, []);

  // Auto-scroll during streaming unless user scrolled up
  useEffect(() => {
    if (!isUserScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Always scroll to bottom when a new user message is added
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user") {
      isUserScrolledUp.current = false;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = () => {
    isUserScrolledUp.current = false;
    setShowScrollButton(false);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-6 py-6"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
      >
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((message, idx) => {
            const isLastMessage = idx === messages.length - 1;
            const isLastStreaming = isLastMessage && isStreaming && message.role === "assistant";
            return (
              <ChatBubble
                key={message.id}
                message={message}
                isStreaming={isLastStreaming}
              />
            );
          })}
          <div ref={bottomRef} className="h-1" />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-white/10 bg-[#0d0f12]/90 px-4 py-2 text-xs font-medium text-white/70 shadow-lg backdrop-blur transition hover:bg-white/[0.08] hover:text-white animate-fade-in"
        >
          <ArrowDown className="size-3.5" />
          Scroll to bottom
        </button>
      )}
    </div>
  );
}
