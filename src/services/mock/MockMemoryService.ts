/**
 * MockMemoryService.ts
 *
 * Simulates semantic memory for browser development without a real vector DB.
 */

import { v4 as uuidv4 } from "uuid";
import type { IMemoryService, MemoryEntry } from "@/services/interfaces/IMemoryService";
import { Logger } from "@/core/logger";

const log = Logger.for("memory:mock");

const MOCK_DATA: MemoryEntry[] = [
  {
    id: uuidv4(),
    content: "Discussed the architectural layout of the Jarvis shell components. Agreed to use Lucide React for iconography and Tailwind for styling.",
    source: "conversation",
    tags: ["architecture", "design", "ui"],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: uuidv4(),
    content: "User prefers dark mode by default. The primary accent color is #61c7ff.",
    source: "manual",
    tags: ["preferences", "theme"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    content: "Summarized project features: Local LLM integration, IPC bridges for file system access, and native Windows notifications.",
    source: "conversation",
    tags: ["features", "summary"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export class MockMemoryService implements IMemoryService {
  private memories: MemoryEntry[] = [...MOCK_DATA];

  async store(entry: Omit<MemoryEntry, "id" | "embedding" | "createdAt" | "updatedAt">): Promise<string> {
    log.info(`[MOCK] Storing memory: "${entry.content.slice(0, 40)}..."`);
    const newEntry: MemoryEntry = {
      ...entry,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.memories.unshift(newEntry);
    return newEntry.id;
  }

  async search(query: string, topK: number = 3): Promise<MemoryEntry[]> {
    log.debug(`[MOCK] Semantic search for: "${query}"`);
    // Basic fuzzy search simulation
    const q = query.toLowerCase();
    const results = this.memories
      .filter(m => m.content.toLowerCase().includes(q) || m.tags.some(t => t.toLowerCase().includes(q)))
      .slice(0, topK);
    
    return results.length > 0 ? results : this.memories.slice(0, topK); // Fallback to recent if no match
  }

  async list(limit: number = 50): Promise<MemoryEntry[]> {
    log.debug(`[MOCK] Listing up to ${limit} memories`);
    return [...this.memories].slice(0, limit);
  }

  async delete(id: string): Promise<void> {
    log.info(`[MOCK] Deleting memory: ${id}`);
    this.memories = this.memories.filter(m => m.id !== id);
  }

  async clear(): Promise<void> {
    log.warn(`[MOCK] Clearing all memories!`);
    this.memories = [];
  }

  async isAvailable(): Promise<boolean> {
    return true; // Mock is always available
  }
}
