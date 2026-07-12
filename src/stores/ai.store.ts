/**
 * ai.store — Jarvis AI Conversation State
 *
 * Manages all chat threads, streaming state, and model selection.
 * Persists threads to localStorage so conversations survive page refreshes.
 * Streaming is abortable via AbortController.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatThread, ChatMessage } from "@/services/interfaces/IAIService";
import { serviceRegistry, ServiceToken } from "@/core/service-registry";
import { Logger } from "@/core/logger";

const log = Logger.for("ai.store");

interface AIState {
  threads: Record<string, ChatThread>;
  activeThreadId: string | null;
  isStreaming: boolean;
  activeModel: string;
  providerStatus: "online" | "offline" | "checking";

  setActiveThread: (id: string) => void;
  createThread: (title?: string) => string;
  deleteThread: (id: string) => void;
  renameThread: (id: string, title: string) => void;
  clearAllThreads: () => void;
  sendMessage: (content: string) => Promise<void>;
  stopStreaming: () => void;
  checkProviderStatus: () => Promise<void>;
  setActiveModel: (model: string) => void;
}

// Store AbortController outside Zustand to avoid serialization issues
let currentAbortController: AbortController | null = null;

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      threads: {},
      activeThreadId: null,
      isStreaming: false,
      activeModel: "llama3.1:8b",
      providerStatus: "checking",

      setActiveThread: (id) => set({ activeThreadId: id }),

      createThread: (title) => {
        const id = crypto.randomUUID();
        set((state) => ({
          threads: {
            ...state.threads,
            [id]: {
              id,
              title: title ?? "New Conversation",
              messages: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          activeThreadId: id,
        }));
        return id;
      },

      deleteThread: (id) => {
        set((state) => {
          const { [id]: _removed, ...rest } = state.threads;
          return {
            threads: rest,
            activeThreadId: state.activeThreadId === id ? null : state.activeThreadId,
          };
        });
      },

      renameThread: (id, title) => {
        set((state) => ({
          threads: {
            ...state.threads,
            [id]: { ...state.threads[id], title, updatedAt: new Date().toISOString() },
          },
        }));
      },

      clearAllThreads: () => {
        set({ threads: {}, activeThreadId: null });
      },

      stopStreaming: () => {
        if (currentAbortController) {
          currentAbortController.abort();
          currentAbortController = null;
        }
        set({ isStreaming: false });
      },

      checkProviderStatus: async () => {
        try {
          const aiService = serviceRegistry.resolve<
            import("@/services/interfaces/IAIService").IAIService
          >(ServiceToken.AI);
          const isAvailable = await aiService.isAvailable();
          set({ providerStatus: isAvailable ? "online" : "offline" });
        } catch {
          set({ providerStatus: "offline" });
        }
      },

      setActiveModel: (model) => set({ activeModel: model }),

      sendMessage: async (content: string) => {
        let { activeThreadId, threads, activeModel } = get();

        if (!activeThreadId) {
          activeThreadId = get().createThread();
          threads = get().threads;
        }

        const thread = threads[activeThreadId];
        if (!thread) return;

        // Auto-title thread from first message
        const isFirstMessage = thread.messages.length === 0;
        if (isFirstMessage) {
          const autoTitle = content.length > 60 ? content.slice(0, 57) + "…" : content;
          get().renameThread(activeThreadId, autoTitle);
        }

        const userMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "user",
          content,
          timestamp: new Date().toISOString(),
        };

        const assistantMessageId = crypto.randomUUID();
        const assistantMessage: ChatMessage = {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          model: activeModel,
          timestamp: new Date().toISOString(),
        };

        // Optimistic update
        set((state) => ({
          threads: {
            ...state.threads,
            [activeThreadId!]: {
              ...thread,
              messages: [...thread.messages, userMessage, assistantMessage],
              updatedAt: new Date().toISOString(),
            },
          },
          isStreaming: true,
        }));

        // Create abort controller for this request
        currentAbortController = new AbortController();

        try {
          const aiService = serviceRegistry.resolve<
            import("@/services/interfaces/IAIService").IAIService
          >(ServiceToken.AI);

          const updatedThread = get().threads[activeThreadId!]!;
          const messagesForContext = updatedThread.messages.slice(0, -1); // exclude the empty assistant message

          const stream = aiService.chat(
            { ...thread, messages: messagesForContext },
            { model: activeModel },
          );

          for await (const chunk of stream) {
            // Check if aborted
            if (currentAbortController?.signal.aborted) break;

            set((state) => {
              const currentThread = state.threads[activeThreadId!];
              if (!currentThread) return state;
              const messages = [...currentThread.messages];
              const lastIndex = messages.length - 1;

              messages[lastIndex] = {
                ...messages[lastIndex],
                content: messages[lastIndex].content + chunk.token,
                ...(chunk.isFinal
                  ? {
                      tokenCount: chunk.totalTokens,
                      latencyMs: chunk.latencyMs,
                    }
                  : {}),
              };

              return {
                threads: {
                  ...state.threads,
                  [activeThreadId!]: {
                    ...currentThread,
                    messages,
                    updatedAt: new Date().toISOString(),
                  },
                },
                isStreaming: !chunk.isFinal,
              };
            });
          }
        } catch (err) {
          log.error("Failed to stream response", { error: err });
          set({ isStreaming: false });
        } finally {
          currentAbortController = null;
          set({ isStreaming: false });
        }
      },
    }),
    {
      name: "jarvis-ai-store",
      version: 1,
      partialize: (state) => ({
        threads: state.threads,
        activeThreadId: state.activeThreadId,
        activeModel: state.activeModel,
      }),
    }
  )
);
