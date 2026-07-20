/**
 * ai.store — Jarvis AI Conversation State
 *
 * Manages all chat threads, streaming state, and model selection.
 * Persists threads to localStorage so conversations survive page refreshes.
 * Streaming is abortable via AbortController.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatThread, ChatMessage, IAIService } from "@/services/interfaces/IAIService";
import { serviceRegistry, ServiceToken } from "@/core/service-registry";
import { detectIntent } from "@/core/model-router/IntentDetector";
import { selectModel } from "@/core/model-router/ModelRouter";
import { Logger } from "@/core/logger";

const log = Logger.for("ai.store");

async function triggerBackgroundSummarization(threadId: string) {
  const store = useAIStore.getState();
  const thread = store.threads[threadId];
  if (!thread || thread.messages.length < 4) return;
  
  // Get last 4 messages
  const recent = thread.messages.slice(-4).map(m => `${m.role}: ${m.content}`).join("\n");
  const aiService = serviceRegistry.resolve<IAIService>(ServiceToken.AI);
  const memService = serviceRegistry.resolve<any>(ServiceToken.Memory);

  try {
    if (!(await memService.isAvailable())) return;

    const summaryPrompt = `Summarize the following conversation snippet in one concise sentence to serve as a long-term memory for an AI assistant. Focus on facts, preferences, or project details. Do not use conversational filler, just give the fact.\n\n${recent}`;
    
    let summary = "";
    const stream = aiService.chat(
      { id: "sum", messages: [{ id: "1", role: "user", content: summaryPrompt, timestamp: "" }], createdAt: "", updatedAt: "" },
      { model: store.activeModel }
    );
    
    for await (const chunk of stream) {
      summary += chunk.token;
    }
    
    if (summary.trim()) {
      await memService.store({
        content: summary.trim(),
        source: "conversation",
        threadId,
        tags: ["auto-summary"]
      });
      log.info(`Background memory saved for thread ${threadId}`);
    }
  } catch (err) {
    log.error("Background summarization failed", { error: err });
  }
}

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

        // ── Model Router: auto-select best model for this message ──────────────
        let routerDecision: string | undefined;
        try {
          const { useModelsStore } = await import("@/stores/models.store");
          const { models, autoRoute } = useModelsStore.getState();
          if (autoRoute && models.length > 0) {
            const intent = detectIntent(content);
            const decision = selectModel(intent, models);
            if (decision && decision.model.id !== activeModel) {
              activeModel = decision.model.id;
              routerDecision = decision.reason;
              log.info(`[model-router] Switched to "${activeModel}" — ${decision.reason}`);
            }
          }
        } catch (err) {
          log.warn("Model router failed, using activeModel", { error: err });
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
          // Attach router decision for dev-mode display
          ...(routerDecision ? { routerDecision } : {}),
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

          // Memory Context Injection
          try {
            const memService = serviceRegistry.resolve<any>(ServiceToken.Memory);
            if (await memService.isAvailable()) {
              const memories = await memService.search(content, 3);
              if (memories.length > 0) {
                const contextBlock = `[Relevant Memory Context]:\n` + memories.map((m: any) => `- ${m.content}`).join("\n");
                const firstMsg = messagesForContext[0];
                if (firstMsg.role === "system") {
                  messagesForContext[0] = { ...firstMsg, content: firstMsg.content + "\n\n" + contextBlock };
                } else {
                  messagesForContext.unshift({ id: "sys", role: "system", content: contextBlock, timestamp: new Date().toISOString() });
                }
                log.info("Injected memory context into prompt.");
              }
            }
          } catch (err) {
            log.warn("Memory context injection failed", { error: err });
          }

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
          // Trigger summarization safely in background
          if (activeThreadId) {
             triggerBackgroundSummarization(activeThreadId).catch(console.error);
          }
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
