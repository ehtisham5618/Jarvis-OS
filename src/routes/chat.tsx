import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shell } from "@/components/desktop/Shell";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useAIStore } from "@/stores/ai.store";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat · Jarvis" },
      {
        name: "description",
        content:
          "Have a full AI conversation with Jarvis. Streaming responses, Markdown rendering, and code highlighting.",
      },
    ],
  }),
  component: Chat,
});

function Chat() {
  const { activeThreadId, createThread, setActiveThread, checkProviderStatus } = useAIStore();

  // Ensure there's always an active thread when the chat page loads
  useEffect(() => {
    if (!activeThreadId) {
      const id = createThread();
      setActiveThread(id);
    }
    checkProviderStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Shell showWidgets={false}>
      <div className="flex h-full flex-col">
        <ChatContainer />
      </div>
    </Shell>
  );
}
