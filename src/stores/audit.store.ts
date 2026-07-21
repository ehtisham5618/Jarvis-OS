import { create } from "zustand";
import { Logger } from "@/core/logger";

const log = Logger.for("audit.store");

export type AuditCategory =
  "auth" | "capability" | "file" | "shell" | "ai" | "plugin" | "automation";
export type AuditActor = "user" | "jarvis" | `plugin:${string}`;
export type AuditStatus = "allowed" | "denied" | "failed";

export interface AuditEntry {
  id: string;
  timestamp: string;
  category: AuditCategory;
  action: string;
  actor: AuditActor;
  status: AuditStatus;
  details?: Record<string, unknown>;
}

export interface AuditFilter {
  category?: AuditCategory;
  actor?: AuditActor;
  status?: AuditStatus;
  since?: string;
  until?: string;
  limit?: number;
}

interface AuditState {
  entries: AuditEntry[];
  isLoading: boolean;

  log(entry: Omit<AuditEntry, "id" | "timestamp">): Promise<void>;
  query(filters?: AuditFilter): Promise<void>;
  clear(): Promise<void>;
  exportLog(): Promise<string>;
}

const isBrowser = typeof window !== "undefined" && !("jarvisOS" in window);

async function ipc<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (isBrowser) return fallback;
  try {
    return await fn();
  } catch (err) {
    log.error("Audit IPC error", { error: err });
    return fallback;
  }
}

// Mock entries for dev mode
const MOCK_ENTRIES: AuditEntry[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    category: "auth",
    action: "unlock-pin",
    actor: "user",
    status: "allowed",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 50000).toISOString(),
    category: "capability",
    action: "shell.exec",
    actor: "jarvis",
    status: "denied",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 40000).toISOString(),
    category: "ai",
    action: "chat",
    actor: "user",
    status: "allowed",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 30000).toISOString(),
    category: "file",
    action: "read",
    actor: "jarvis",
    status: "allowed",
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 20000).toISOString(),
    category: "automation",
    action: "run",
    actor: "jarvis",
    status: "allowed",
  },
  {
    id: "6",
    timestamp: new Date(Date.now() - 10000).toISOString(),
    category: "plugin",
    action: "summarize_clipboard",
    actor: "plugin:sample",
    status: "allowed",
  },
];

export const useAuditStore = create<AuditState>((set) => ({
  entries: [],
  isLoading: false,

  async log(partial) {
    await ipc(() => window.jarvisOS.audit.log(partial), undefined);
  },

  async query(filters = {}) {
    set({ isLoading: true });
    const entries = await ipc(() => window.jarvisOS.audit.query(filters), MOCK_ENTRIES);
    set({ entries, isLoading: false });
  },

  async clear() {
    await ipc(() => window.jarvisOS.audit.clear(), undefined);
    set({ entries: [] });
  },

  async exportLog() {
    return await ipc(() => window.jarvisOS.audit.export(), JSON.stringify(MOCK_ENTRIES, null, 2));
  },
}));
