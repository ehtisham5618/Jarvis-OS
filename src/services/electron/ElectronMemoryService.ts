/**
 * ElectronMemoryService.ts
 *
 * Implements IMemoryService by orchestrating Ollama for embeddings
 * and delegating LanceDB vector storage to the Electron main process via IPC.
 */

import { v4 as uuidv4 } from "uuid";
import type { IMemoryService, MemoryEntry } from "@/services/interfaces/IMemoryService";
import { serviceRegistry, ServiceToken } from "@/core/service-registry";
import type { IAIService } from "@/services/interfaces/IAIService";
import { Logger } from "@/core/logger";
import MemorySearchWorker from "@/workers/memorySearch.worker?worker";

const log = Logger.for("memory:electron");

export class ElectronMemoryService implements IMemoryService {
  private get api() {
    return (window as any).jarvisOS?.memory;
  }

  private get ai(): IAIService {
    return serviceRegistry.resolve<IAIService>(ServiceToken.AI);
  }

  async store(
    entry: Omit<MemoryEntry, "id" | "embedding" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    if (!this.api) throw new Error("Memory IPC not available.");

    log.info(`Generating embedding for new memory: "${entry.content.slice(0, 30)}..."`);
    const embeddingArray = await this.ai.embed(entry.content, "nomic-embed-text");
    const embedding = Array.from(embeddingArray);

    const fullEntry: MemoryEntry = {
      ...entry,
      id: uuidv4(),
      embedding,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.api.store(fullEntry);
    log.info(`Stored memory ${fullEntry.id}`);
    return fullEntry.id;
  }

  async search(query: string, topK: number = 3): Promise<MemoryEntry[]> {
    if (!this.api) throw new Error("Memory IPC not available.");

    log.debug(`Searching memory for: "${query}"`);

    // Offload embedding calculation to a Web Worker (M11)
    const embeddingVector: number[] = await new Promise((resolve, reject) => {
      const worker = new MemorySearchWorker();
      worker.onmessage = (e) => {
        worker.terminate();
        if (e.data.success) {
          resolve(e.data.embedding);
        } else {
          reject(new Error(e.data.error));
        }
      };
      worker.onerror = (err) => {
        worker.terminate();
        reject(err);
      };
      worker.postMessage({ query, model: "nomic-embed-text" });
    });

    return this.api.search(embeddingVector, topK);
  }

  async list(limit: number = 50): Promise<MemoryEntry[]> {
    if (!this.api) throw new Error("Memory IPC not available.");
    return this.api.list(limit);
  }

  async delete(id: string): Promise<void> {
    if (!this.api) throw new Error("Memory IPC not available.");
    await this.api.delete(id);
  }

  async clear(): Promise<void> {
    if (!this.api) throw new Error("Memory IPC not available.");
    log.warn("Clearing all memories via IPC.");
    await this.api.clear();
  }

  async isAvailable(): Promise<boolean> {
    try {
      const isUp = await this.ai.isAvailable();
      return !!this.api && isUp;
    } catch {
      return false;
    }
  }
}
