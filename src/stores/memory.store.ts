import { create } from "zustand";
import type { MemoryItem } from "@/services/interfaces/IMemoryService";

// Mock data for Phase 1
const mockTimeline: MemoryItem[] = [
  {
    id: "1",
    type: "conversation",
    title: "Chat about Neural Studio",
    contentSnippet: "Discussed the new generative UI toolkit architecture.",
    source: "Jarvis",
    tags: ["neural-studio", "planning"],
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "2",
    type: "file",
    title: "Project Aether — v0.4 Architecture",
    contentSnippet: "Added capability registry and permission engine.",
    source: "C:/Users/ehtis/Desktop/Jarvis-OS/src/core",
    tags: ["aether", "code"],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "3",
    type: "url",
    title: "Ollama API Documentation",
    contentSnippet: "Reference for /api/chat and /api/tags endpoints.",
    source: "https://github.com/ollama/ollama/blob/main/docs/api.md",
    tags: ["docs", "ollama"],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
];

interface MemoryState {
  timeline: MemoryItem[];
  isSearching: boolean;
  
  fetchTimeline: () => Promise<void>;
  searchMemory: (query: string) => Promise<void>;
}

export const useMemoryStore = create<MemoryState>()((set) => ({
  timeline: mockTimeline,
  isSearching: false,

  fetchTimeline: async () => {
    // In Phase 1, we just use the mock data
    // In Phase 2, this will call the IMemoryService
    set({ timeline: mockTimeline });
  },

  searchMemory: async (query: string) => {
    if (!query) {
      set({ timeline: mockTimeline });
      return;
    }

    set({ isSearching: true });
    
    // Fake latency
    await new Promise(r => setTimeout(r, 400));
    
    const q = query.toLowerCase();
    const results = mockTimeline.filter(m => 
      m.title.toLowerCase().includes(q) || 
      m.contentSnippet.toLowerCase().includes(q) ||
      m.tags.some(t => t.includes(q))
    );
    
    set({ timeline: results, isSearching: false });
  },
}));
