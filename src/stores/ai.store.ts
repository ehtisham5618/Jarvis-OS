import { create } from "zustand";
import type { ChatThread, ChatMessage, StreamToken } from "@/services/interfaces/IAIService";
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
  sendMessage: (content: string) => Promise<void>;
  checkProviderStatus: () => Promise<void>;
  setActiveModel: (model: string) => void;
}

export const useAIStore = create<AIState>()((set, get) => ({
  threads: {},
  activeThreadId: null,
  isStreaming: false,
  activeModel: "llama3.1:70b",
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
        }
      },
      activeThreadId: id,
    }));
    return id;
  },

  checkProviderStatus: async () => {
    try {
      const aiService = serviceRegistry.resolve<import("@/services/interfaces/IAIService").IAIService>(ServiceToken.AI);
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
        }
      },
      isStreaming: true,
    }));

    try {
      const aiService = serviceRegistry.resolve<import("@/services/interfaces/IAIService").IAIService>(ServiceToken.AI);
      
      const stream = aiService.chat(
        { ...thread, messages: [...thread.messages, userMessage] },
        { model: activeModel }
      );

      for await (const chunk of stream) {
        set((state) => {
          const currentThread = state.threads[activeThreadId!];
          const messages = [...currentThread.messages];
          const lastIndex = messages.length - 1;
          
          messages[lastIndex] = {
            ...messages[lastIndex],
            content: messages[lastIndex].content + chunk.token,
            ...(chunk.isFinal ? {
              tokenCount: chunk.totalTokens,
              latencyMs: chunk.latencyMs,
            } : {})
          };

          return {
            threads: {
              ...state.threads,
              [activeThreadId!]: { ...currentThread, messages }
            },
            isStreaming: !chunk.isFinal
          };
        });
      }
    } catch (err) {
      log.error("Failed to stream response", { error: err });
      set({ isStreaming: false });
    }
  },
}));
