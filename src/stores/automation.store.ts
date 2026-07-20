import { create } from "zustand";
import type { Automation, AutomationRunResult } from "@/services/interfaces/IAutomationService";
import { Logger } from "@/core/logger";

const log = Logger.for("automation.store");

interface AutomationState {
  automations: Automation[];
  isLoading:   boolean;
  runningId:   string | null;

  loadAll():                                    Promise<void>;
  create(a: Omit<Automation, "id" | "runCount" | "lastRanAt" | "lastStatus" | "createdAt">): Promise<string>;
  update(id: string, partial: Partial<Automation>): Promise<void>;
  remove(id: string):                            Promise<void>;
  run(id: string):                               Promise<AutomationRunResult>;
  toggle(id: string, enabled: boolean):          Promise<void>;
}

const isBrowser = typeof window !== "undefined" && !("jarvisOS" in window);

/** Attempt a call to the main process; fall back gracefully in browser mode */
async function ipc<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (isBrowser) return fallback;
  try {
    return await fn();
  } catch (err) {
    log.error("Automation IPC error", { error: err });
    return fallback;
  }
}

export const useAutomationStore = create<AutomationState>((set, get) => ({
  automations: [],
  isLoading:   false,
  runningId:   null,

  async loadAll() {
    set({ isLoading: true });
    const automations = await ipc(() => window.jarvisOS.automation.list(), MOCK_AUTOMATIONS);
    set({ automations, isLoading: false });
    log.info(`Loaded ${automations.length} automations.`);
  },

  async create(partial) {
    const id = await ipc(() => window.jarvisOS.automation.create(partial), crypto.randomUUID());
    await get().loadAll();
    return id;
  },

  async update(id, partial) {
    await ipc(() => window.jarvisOS.automation.update(id, partial), undefined);
    set((state) => ({
      automations: state.automations.map((a) => a.id === id ? { ...a, ...partial } : a),
    }));
  },

  async remove(id) {
    await ipc(() => window.jarvisOS.automation.delete(id), undefined);
    set((state) => ({ automations: state.automations.filter((a) => a.id !== id) }));
  },

  async run(id) {
    set({ runningId: id });
    const result = await ipc(
      () => window.jarvisOS.automation.run(id),
      { success: true, executedAt: new Date().toISOString(), durationMs: 500, actionsRun: 1 }
    );
    set((state) => ({
      runningId: null,
      automations: state.automations.map((a) =>
        a.id === id ? { ...a, runCount: a.runCount + 1, lastRanAt: result.executedAt, lastStatus: result.success ? "success" : "failed" } : a
      ),
    }));
    return result;
  },

  async toggle(id, enabled) {
    await ipc(() => window.jarvisOS.automation.toggle(id, enabled), undefined);
    set((state) => ({
      automations: state.automations.map((a) => a.id === id ? { ...a, enabled } : a),
    }));
  },
}));

// ─── Mock data for browser dev mode ────────────────────────────────────────────

const MOCK_AUTOMATIONS: Automation[] = [
  {
    id: "mock-1",
    name: "Daily git pull",
    description: "Every day at 9 AM run git pull in projects",
    enabled: false,
    trigger: { type: "schedule", cron: "0 9 * * *" },
    conditions: [],
    actions: [{ type: "shell_exec", command: "git", args: ["pull"] }, { type: "show_notification", title: "Jarvis", body: "Git pull done ✓" }],
    runCount: 0, lastRanAt: null, lastStatus: null, createdAt: new Date().toISOString(),
  },
  {
    id: "mock-2",
    name: "Morning briefing",
    description: "Every morning at 8 AM — AI briefing + notification",
    enabled: true,
    trigger: { type: "schedule", cron: "0 8 * * *" },
    conditions: [],
    actions: [{ type: "ai_request", prompt: "Give me my morning briefing", outputVar: "briefing" }, { type: "show_notification", title: "Morning Briefing", body: "Ready in Jarvis" }],
    runCount: 42, lastRanAt: new Date(Date.now() - 86400000).toISOString(), lastStatus: "success", createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "mock-3",
    name: "Clipboard translator",
    description: "When clipboard contains 'translate:' → AI translates → writes back",
    enabled: false,
    trigger: { type: "clipboard_contains", pattern: "translate:" },
    conditions: [],
    actions: [{ type: "ai_request", prompt: "Translate: {{clipboard}}", outputVar: "translation" }, { type: "clipboard_write", content: "{{translation}}" }],
    runCount: 7, lastRanAt: new Date(Date.now() - 3600000).toISOString(), lastStatus: "success", createdAt: new Date().toISOString(),
  },
  {
    id: "mock-4",
    name: "Focus mode",
    description: "Ctrl+Alt+F → navigate to chat",
    enabled: true,
    trigger: { type: "hotkey", keys: ["Ctrl", "Alt", "F"] },
    conditions: [],
    actions: [{ type: "navigate", route: "/chat" }, { type: "show_notification", title: "Focus Mode", body: "Distractions minimized." }],
    runCount: 15, lastRanAt: new Date().toISOString(), lastStatus: "success", createdAt: new Date().toISOString(),
  },
];
