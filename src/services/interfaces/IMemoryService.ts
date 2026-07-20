/**
 * IMemoryService — Persistent Vector Memory Contract
 */

export interface MemoryEntry {
  id: string;
  content: string;
  source: "conversation" | "file" | "web" | "manual";
  threadId?: string;
  tags: string[];
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface IMemoryService {
  /**
   * Embeds the text and stores it in the vector DB.
   * Returns the generated UUID.
   */
  store(entry: Omit<MemoryEntry, "id" | "embedding" | "createdAt" | "updatedAt">): Promise<string>;

  /**
   * Search for semantically similar memories using Ollama embeddings.
   */
  search(query: string, topK?: number): Promise<MemoryEntry[]>;

  /**
   * List recent memories chronologically.
   */
  list(limit?: number): Promise<MemoryEntry[]>;

  /**
   * Delete a specific memory by ID.
   */
  delete(id: string): Promise<void>;

  /**
   * Completely wipe the memory database.
   */
  clear(): Promise<void>;

  /**
   * Returns true if LanceDB and Ollama embeddings are accessible.
   */
  isAvailable(): Promise<boolean>;
}
