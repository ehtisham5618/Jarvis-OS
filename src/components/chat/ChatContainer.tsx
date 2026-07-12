/**
 * ChatContainer
 *
 * Full-height chat layout: message list + anchored input.
 * Shows offline warning banner, thread title, and new conversation button.
 */

import { useNavigate } from "@tanstack/react-router";
import { MessageSquarePlus, WifiOff } from "lucide-react";
import { useAIStore } from "@/stores/ai.store";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";

export function ChatContainer() {
  const navigate = useNavigate();
  const {
    threads,
    activeThreadId,
    isStreaming,
    providerStatus,
    sendMessage,
    createThread,
    setActiveThread,
  } = useAIStore();

  const activeThread = activeThreadId ? threads[activeThreadId] : null;
  const messages = activeThread?.messages ?? [];

  const handleSend = async (content: string) => {
    if (!activeThreadId) {
      const id = createThread();
      setActiveThread(id);
    }
    await sendMessage(content);
  };

  const handleNewConversation = () => {
    const id = createThread();
    setActiveThread(id);
    navigate({ to: "/chat" });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Offline Banner */}
      {providerStatus === "offline" && (
        <div className="flex items-center gap-3 border-b border-amber-500/20 bg-amber-500/5 px-6 py-2.5 text-sm text-amber-400 animate-fade-in">
          <WifiOff className="size-4 shrink-0" />
          <span>Ollama is offline — responses are mocked. Start Ollama to enable real AI.</span>
        </div>
      )}

      {/* Thread header */}
      <div className="flex items-center justify-between border-b border-white/[0.04] px-6 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-medium text-white/70">
            {activeThread?.title ?? "New Conversation"}
          </h2>
          {messages.length > 0 && (
            <p className="text-[10px] text-white/30">
              {messages.filter((m) => m.role === "user").length} messages
            </p>
          )}
        </div>
        <button
          onClick={handleNewConversation}
          className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-white/50 transition hover:border-white/10 hover:bg-white/[0.05] hover:text-white/80"
        >
          <MessageSquarePlus className="size-3.5" />
          New chat
        </button>
      </div>

      {/* Message list — fills remaining space */}
      <ChatMessageList messages={messages} isStreaming={isStreaming} />

      {/* Input — anchored to bottom */}
      <div className="shrink-0 border-t border-white/[0.04] px-6 py-4">
        <ChatInput onSend={handleSend} autoFocus />
      </div>
    </div>
  );
}
