export interface ChatOptions {
  model?: string;
  temperature?: number;
}

export interface MemoryEntry {
  id?: string;
  type: string;
  content: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface JarvisPluginSDK {
  ai: {
    chat(prompt: string, options?: ChatOptions): Promise<string>;
    embed(text: string): Promise<number[]>;
  };
  memory: {
    store(entry: MemoryEntry): Promise<void>;
    search(query: string): Promise<MemoryEntry[]>;
  };
  ui: {
    showNotification(title: string, body: string): void;
    openPanel(panelId: string): void;
  };
  fs: {
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
  };
  events: {
    on(event: string, callback: (...args: any[]) => void): void;
    emit(event: string, data?: unknown): void;
  };
  settings: {
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T): Promise<void>;
  };
}

export class PermissionDeniedError extends Error {
  constructor(permission: string) {
    super(`Permission denied: Plugin requires '${permission}' permission.`);
    this.name = "PermissionDeniedError";
  }
}
