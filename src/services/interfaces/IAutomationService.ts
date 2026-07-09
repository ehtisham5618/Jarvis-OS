/**
 * IAutomationService — Automation Engine Contract
 * Milestone 8: Visual Workflow Builder
 */

// ─── Trigger Types ─────────────────────────────────────────────────────────

export type Trigger =
  | { type: "schedule"; cron: string }
  | { type: "hotkey"; keys: string[] }
  | { type: "file_change"; path: string; event: "create" | "modify" | "delete" }
  | { type: "process_start"; processName: string }
  | { type: "ai_prompt"; match: string }
  | { type: "clipboard_contains"; pattern: string };

// ─── Action Types ──────────────────────────────────────────────────────────

export type Action =
  | { type: "shell_exec"; command: string; args: string[] }
  | { type: "open_file"; path: string }
  | { type: "ai_request"; prompt: string; outputVar: string }
  | { type: "show_notification"; title: string; body: string }
  | { type: "write_file"; path: string; content: string }
  | { type: "clipboard_write"; content: string }
  | { type: "navigate"; route: string };

// ─── Condition ─────────────────────────────────────────────────────────────

export interface Condition {
  field: string;
  operator: "equals" | "contains" | "gt" | "lt";
  value: unknown;
}

// ─── Automation ────────────────────────────────────────────────────────────

export interface Automation {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: Trigger;
  conditions: Condition[];
  actions: Action[];
  runCount: number;
  lastRanAt: string | null;
  lastStatus: "success" | "failed" | null;
  createdAt: string;
}

// ─── Run Result ────────────────────────────────────────────────────────────

export interface AutomationRunResult {
  success: boolean;
  executedAt: string;
  durationMs: number;
  actionsRun: number;
  error?: string;
}

// ─── Service Interface ─────────────────────────────────────────────────────

export interface IAutomationService {
  list(): Promise<Automation[]>;
  create(
    a: Omit<Automation, "id" | "runCount" | "lastRanAt" | "lastStatus" | "createdAt">,
  ): Promise<string>;
  update(id: string, partial: Partial<Automation>): Promise<void>;
  delete(id: string): Promise<void>;
  run(id: string): Promise<AutomationRunResult>;
  enable(id: string): Promise<void>;
  disable(id: string): Promise<void>;
}
