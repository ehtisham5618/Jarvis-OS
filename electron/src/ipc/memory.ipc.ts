/**
 * memory.ipc.ts — LanceDB Vector Store IPC Handlers
 *
 * Provides a local vector database for storing and semantically searching
 * memory entries. Embeddings are provided by the client (via Ollama).
 */

import { app, ipcMain } from "electron";
import * as lancedb from "@lancedb/lancedb";
import path from "path";
import fs from "fs";
import { IpcChannels } from "./channels";

const dbPath = path.join(app.getPath("userData"), "memory", "lancedb");

let dbInstance: lancedb.Connection | null = null;

async function getDb(): Promise<lancedb.Connection> {
  if (!dbInstance) {
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }
    dbInstance = await lancedb.connect(dbPath);
  }
  return dbInstance;
}

async function getTable(): Promise<lancedb.Table | null> {
  const db = await getDb();
  const tables = await db.tableNames();
  if (tables.includes("memories")) {
    return await db.openTable("memories");
  }
  return null;
}

export function registerMemoryHandlers(): void {
  // ─── STORE MEMORY ────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.MEMORY_STORE, async (_evt, entry: any) => {
    const db = await getDb();
    const tables = await db.tableNames();
    
    // Stringify tags for easy LanceDB storage
    const record = { ...entry, tags: JSON.stringify(entry.tags) };

    if (!tables.includes("memories")) {
      await db.createTable("memories", [record]);
    } else {
      const table = await db.openTable("memories");
      await table.add([record]);
    }
  });

  // ─── SEARCH MEMORY ───────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.MEMORY_SEARCH, async (_evt, queryVector: number[], topK: number = 3) => {
    const table = await getTable();
    if (!table) return [];

    const results = await table.search(queryVector).limit(topK).execute();
    return results.map((r: any) => ({
      ...r,
      tags: typeof r.tags === "string" ? JSON.parse(r.tags) : r.tags,
    }));
  });

  // ─── LIST RECENT MEMORY ──────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.MEMORY_LIST, async (_evt, limit: number = 50) => {
    const table = await getTable();
    if (!table) return [];

    // Hack: to get all rows, we search with a dummy vector and large limit, or use table.query()
    // LanceDB node API supports select/limit.
    try {
      const results = await table.query().limit(limit).execute();
      return results.map((r: any) => ({
        ...r,
        tags: typeof r.tags === "string" ? JSON.parse(r.tags) : r.tags,
      })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.error("Failed to list memories:", err);
      return [];
    }
  });

  // ─── DELETE MEMORY ───────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.MEMORY_DELETE, async (_evt, id: string) => {
    const table = await getTable();
    if (!table) return;
    await table.delete(`id = '${id}'`);
  });

  // ─── CLEAR MEMORY ────────────────────────────────────────────────────────
  ipcMain.handle(IpcChannels.MEMORY_CLEAR, async () => {
    const db = await getDb();
    const tables = await db.tableNames();
    if (tables.includes("memories")) {
      await db.dropTable("memories");
    }
  });
}
