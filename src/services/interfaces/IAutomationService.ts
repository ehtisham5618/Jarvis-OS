/**
 * IAutomationService — Automation Engine Contract
 *
 * Manages the creation, execution, and monitoring of automations.
 */

export type TriggerType =
  | "time"          // e.g., "Every day at 7:00 AM"
  | "event"         // e.g., "When application launches"
  | "file"          // e.g., "When file added to folder"
  | "voice"         // e.g., "When I say 'Good morning'"
  | "manual";       // e.g., "Run now button clicked"

export type ActionType =
  | "system"        // e.g., "Sleep", "Set brightness"
  | "file"          // e.g., "Move file", "Rename"
  | "ai"            // e.g., "Summarize text", "Extract entities"
  | "application"   // e.g., "Launch app", "Close app"
  | "script";       // e.g., "Run PowerShell script"

export interface AutomationTrigger {
  id: string;
  type: TriggerType;
  config: Record<string, unknown>;
  description: string;
}

export interface AutomationAction {
  id: string;
  type: ActionType;
  config: Record<string, unknown>;
  description: string;
}

export interface Automation {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  triggers: AutomationTrigger[];
  actions: AutomationAction[];
  runCount: number;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationExecutionLog {
  id: string;
  automationId: string;
  triggerId: string;
  startedAt: string;
  completedAt?: string;
  status: "running" | "success" | "failed";
  error?: string;
  stepLogs: Array<{
    actionId: string;
    startedAt: string;
    completedAt?: string;
    success: boolean;
    error?: string;
  }>;
}

export interface IAutomationService {
  /** Get all automations */
  getAutomations(): Promise<Automation[]>;

  /** Get a specific automation */
  getAutomation(id: string): Promise<Automation | undefined>;

  /** Create or update an automation */
  saveAutomation(automation: Omit<Automation, "createdAt" | "updatedAt" | "runCount">): Promise<Automation>;

  /** Delete an automation */
  deleteAutomation(id: string): Promise<void>;

  /** Toggle automation on/off */
  toggleAutomation(id: string, enabled: boolean): Promise<void>;

  /** Manually trigger an automation */
  runAutomation(id: string): Promise<string>; // Returns execution log ID

  /** Get recent execution logs */
  getExecutionLogs(limit?: number): Promise<AutomationExecutionLog[]>;
}
