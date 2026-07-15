/**
 * memory.store.ts
 *
 * Zustand store for managing the memory engine UI state.
 */

import { create } from "zustand";
import type { MemoryEntry, IMemoryService } from "@/services/interfaces/IMemoryService";
import { serviceRegistry, ServiceToken } from "@/core/service-registry";
import { useNotificationsStore } from "./notifications.store";
import { Logger } from "@/core/logger";

const log = Logger.for("store:memory");

interface MemoryState {
  entries: MemoryEntry[];
  isLoading: boolean;
  lastSearch: { query: string; results: MemoryEntry[] } | null;

  loadRecent(limit?: number): Promise<void>;
  searchMemory(query: string): Promise<void>;
  storeMemory(
    entry: Omit<MemoryEntry, "id" | "embedding" | "createdAt" | "updatedAt">,
  ): Promise<void>;
  deleteMemory(id: string): Promise<void>;
  clearAllMemory(): Promise<void>;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  entries: [],
  isLoading: false,
  lastSearch: null,

  async loadRecent(limit = 50) {
    set({ isLoading: true });
    try {
      const memService = serviceRegistry.resolve<IMemoryService>(ServiceToken.Memory);
      const isUp = await memService.isAvailable();
      if (!isUp) {
        log.warn("Memory service unavailable.");
        set({ entries: [], isLoading: false });
        return;
      }
      const entries = await memService.list(limit);
      set({ entries, isLoading: false });
    } catch (err: any) {
      log.error("Failed to load recent memories:", err);
      set({ isLoading: false });
    }
  },

  async searchMemory(query) {
    if (!query.trim()) {
      set({ lastSearch: null });
      return;
    }
    set({ isLoading: true });
    try {
      const memService = serviceRegistry.resolve<IMemoryService>(ServiceToken.Memory);
      const results = await memService.search(query);
      set({ lastSearch: { query, results }, isLoading: false });
    } catch (err: any) {
      log.error("Failed to search memory:", err);
      set({ isLoading: false });
    }
  },

  async storeMemory(entry) {
    try {
      const memService = serviceRegistry.resolve<IMemoryService>(ServiceToken.Memory);
      await memService.store(entry);
      // Refresh timeline
      await get().loadRecent();
    } catch (err: any) {
      log.error("Failed to store memory:", err);
    }
  },

  async deleteMemory(id) {
    try {
      const memService = serviceRegistry.resolve<IMemoryService>(ServiceToken.Memory);
      await memService.delete(id);

      // Optimistic UI update
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
        lastSearch: state.lastSearch
          ? { ...state.lastSearch, results: state.lastSearch.results.filter((e) => e.id !== id) }
          : null,
      }));
    } catch (err: any) {
      log.error("Failed to delete memory:", err);
    }
  },

  async clearAllMemory() {
    try {
      const memService = serviceRegistry.resolve<IMemoryService>(ServiceToken.Memory);
      await memService.clear();
      set({ entries: [], lastSearch: null });
      useNotificationsStore
        .getState()
        .show("Memory Engine", "All semantic memory has been completely erased.", "icon");
    } catch (err: any) {
      log.error("Failed to clear memory:", err);
    }
  },
}));
