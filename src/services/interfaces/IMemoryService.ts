/**
 * IMemoryService — Memory Engine Contract
 *
 * Manages the semantic memory of Jarvis.
 * Items can be files, conversations, URLs, screenshots, etc.
 */

export type MemoryItemType =
  | "file"
  | "conversation"
  | "command"
  | "clipboard"
  | "screenshot"
  | "url"
  | "note";

export interface MemoryItem {
  id: string;
  type: MemoryItemType;
  title: string;
  contentSnippet: string;
  timestamp: string;
  source: string; // e.g., filepath, url, app name
  tags: string[];
  /** Vector embedding of the content (useful in Phase 2) */
  embedding?: Float32Array;
  metadata?: Record<string, unknown>;
}

export interface MemorySearchQuery {
  text: string;
  types?: MemoryItemType[];
  limit?: number;
  timeRange?: {
    start: string;
    end: string;
  };
}

export interface MemorySearchResult {
  item: MemoryItem;
  score: number; // Relevance score (0.0 - 1.0)
}

export interface IMemoryService {
  /** Add a new item to memory */
  addItem(item: Omit<MemoryItem, "id" | "timestamp" | "embedding">): Promise<MemoryItem>;

  /** Retrieve an item by ID */
  getItem(id: string): Promise<MemoryItem | undefined>;

  /** Delete an item from memory */
  deleteItem(id: string): Promise<void>;

  /**
   * Search memory using natural language.
   * Phase 1: fuzzy text search.
   * Phase 2: semantic vector search.
   */
  search(query: MemorySearchQuery): Promise<MemorySearchResult[]>;

  /** Get a chronological timeline of recent memory items */
  getTimeline(limit?: number): Promise<MemoryItem[]>;

  /** Get basic stats (total items, breakdown by type) */
  getStats(): Promise<{ total: number; byType: Record<string, number> }>;
}
