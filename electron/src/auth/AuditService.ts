/**
 * AuditService — Milestone 10
 *
 * Append-only NDJSON audit log at ~/.jarvis/audit.log
 * Provides log, query, clear, and export IPC handlers.
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { ipcMain } from "electron";
import { randomUUID } from "crypto";
import log from "electron-log";

const AUDIT_FILE = path.join(os.homedir(), ".jarvis", "audit.log");

function ensureDir(): void {
  const dir = path.dirname(AUDIT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export type AuditCategory = "auth" | "capability" | "file" | "shell" | "ai" | "plugin" | "automation";
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

export type AuditFilter = {
  category?: AuditCategory;
  actor?: AuditActor;
  status?: AuditStatus;
  since?: string;
  until?: string;
  limit?: number;
};

function readAll(): AuditEntry[] {
  ensureDir();
  if (!fs.existsSync(AUDIT_FILE)) return [];
  const lines = fs.readFileSync(AUDIT_FILE, "utf-8").split("\n").filter(Boolean);
  return lines.map((l) => {
    try { return JSON.parse(l) as AuditEntry; }
    catch { return null; }
  }).filter(Boolean) as AuditEntry[];
}

function appendEntry(entry: AuditEntry): void {
  ensureDir();
  fs.appendFileSync(AUDIT_FILE, JSON.stringify(entry) + "\n", "utf-8");
}

const _auditService = {
  log(partial: Omit<AuditEntry, "id" | "timestamp">): void {
    const entry: AuditEntry = {
      ...partial,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };
    appendEntry(entry);
    log.debug(`[audit] ${entry.category}/${entry.action} → ${entry.status}`);
  },

  query(filters: AuditFilter = {}): AuditEntry[] {
    let entries = readAll();
    if (filters.category) entries = entries.filter((e) => e.category === filters.category);
    if (filters.actor)    entries = entries.filter((e) => e.actor === filters.actor);
    if (filters.status)   entries = entries.filter((e) => e.status === filters.status);
    if (filters.since)    entries = entries.filter((e) => e.timestamp >= filters.since!);
    if (filters.until)    entries = entries.filter((e) => e.timestamp <= filters.until!);
    // Most recent first
    entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    if (filters.limit) entries = entries.slice(0, filters.limit);
    return entries;
  },

  clear(): void {
    ensureDir();
    fs.writeFileSync(AUDIT_FILE, "", "utf-8");
  },

  export(): string {
    return JSON.stringify(readAll(), null, 2);
  },
};

export const auditService = _auditService;

export function registerAuditHandlers(): void {
  ipcMain.handle("audit:log",    (_, partial: Omit<AuditEntry, "id" | "timestamp">) => { _auditService.log(partial); });
  ipcMain.handle("audit:query",  (_, filters: AuditFilter) => _auditService.query(filters));
  ipcMain.handle("audit:clear",  () => { _auditService.clear(); });
  ipcMain.handle("audit:export", () => _auditService.export());
}
