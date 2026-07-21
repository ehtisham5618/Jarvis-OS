/**
 * ChatMessageList
 *
 * Scrollable list of chat bubbles. Auto-scrolls to bottom during streaming.
 * Shows a "scroll to bottom" button when user scrolls up manually.
 * Empty state when no messages exist.
 */

import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import { Sparkles, ArrowDown } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isUserScrolledUp = useRef(false);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 100, // Roughly 100px per message initially
    overscan: 5, // Render 5 items outside viewport
  });

  // Keep measuring the last item while it's streaming so virtualization adjusts
  const lastMessage = messages[messages.length - 1];
  const isLastStreaming = isStreaming && lastMessage?.role === "assistant";

  useEffect(() => {
    if (isLastStreaming) {
      virtualizer.measure();
    }
  }, [lastMessage?.content, isLastStreaming, virtualizer]);

  // Detect if user manually scrolled up
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isUserScrolledUp.current = distFromBottom > 150;
    setShowScrollButton(distFromBottom > 150);
  }, []);

  // Auto-scroll during streaming or when new messages arrive
  useEffect(() => {
    if (!isUserScrolledUp.current && messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, { align: "end", behavior: "auto" });
    }
  }, [messages.length, lastMessage?.content, virtualizer]);

  const scrollToBottom = () => {
    isUserScrolledUp.current = false;
    setShowScrollButton(false);
    virtualizer.scrollToIndex(messages.length - 1, { align: "end", behavior: "smooth" });
  };

  if (messages.length === 0) {
    return <EmptyState />;
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-6 py-6"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
      >
        <div
          className="mx-auto max-w-3xl relative"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualItems.map((virtualItem) => {
            const message = messages[virtualItem.index];
            const isLast = virtualItem.index === messages.length - 1;
            const streaming = isLast && isStreaming && message.role === "assistant";

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className="absolute top-0 left-0 w-full"
                style={{ transform: `translateY(${virtualItem.start}px)` }}
              >
                <div className="pb-6">
                  <ChatBubble message={message} isStreaming={streaming} />
                </div>
              </div>
            );
          })}
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
