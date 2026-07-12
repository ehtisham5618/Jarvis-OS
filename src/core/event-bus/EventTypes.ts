/**
 * Jarvis Event Bus — Typed Event Definitions
 *
 * Every event in the Jarvis platform is defined here.
 * This provides compile-time safety — you cannot emit or subscribe to
 * an event that doesn't exist in this registry.
 *
 * Naming convention: DOMAIN:ACTION
 * e.g., "system:metrics-updated", "ai:message-received"
 */

import type { SystemMetrics } from "@/services/interfaces/ISystemService";
import type { ModelRecord } from "@/services/interfaces/IModelService";
import type { ChatMessage } from "@/services/interfaces/IAIService";
import type { Notification } from "@/stores/notifications.store";

/**
 * Master event map.
 * Key = event name string literal
 * Value = payload type
 *
 * Add new events here — they are automatically typed everywhere.
 */
export interface JarvisEventMap {
  // ─── System Events ───────────────────────────────────────────
  "system:metrics-updated": SystemMetrics;
  "system:hardware-alert": { metric: string; value: number; threshold: number; level: "warning" | "critical" };
  "system:ollama-connected": { host: string; modelCount: number };
  "system:ollama-disconnected": { host: string; reason: string };

  // ─── AI Events ───────────────────────────────────────────────
  "ai:conversation-started": { threadId: string };
  "ai:message-sent": { threadId: string; message: ChatMessage };
  "ai:message-received": { threadId: string; message: ChatMessage };
  "ai:stream-started": { threadId: string; model: string };
  "ai:stream-token": { threadId: string; token: string };
  "ai:stream-completed": { threadId: string; totalTokens: number; latencyMs: number };
  "ai:stream-error": { threadId: string; error: string };
  "ai:model-switched": { from: string; to: string; reason: string };
  "ai:intent-classified": { threadId: string; intent: string; confidence: number };

  // ─── Model Events ────────────────────────────────────────────
  "models:discovered": { models: ModelRecord[] };
  "models:install-started": { modelId: string };
  "models:install-progress": { modelId: string; progressPercent: number; downloadedBytes: number; totalBytes: number };
  "models:install-completed": { modelId: string };
  "models:install-failed": { modelId: string; error: string };
  "models:benchmark-started": { modelId: string };
  "models:benchmark-completed": { modelId: string; scores: Record<string, number> };

  // ─── Memory Events ───────────────────────────────────────────
  "memory:item-added": { id: string; type: string };
  "memory:indexing-started": void;
  "memory:indexing-progress": { processed: number; total: number };
  "memory:indexing-completed": { totalItems: number };
  "memory:search-completed": { query: string; resultCount: number };

  // ─── User Events ─────────────────────────────────────────────
  "user:profile-updated": { field: string; value: unknown };
  "user:setup-completed": { profileId: string };
  "user:autonomy-changed": { from: string; to: string };

  // ─── Notification Events ─────────────────────────────────────
  "notification:added": Notification;
  "notification:dismissed": { id: string };

  // ─── Capability Events ───────────────────────────────────────
  "capability:executed": { capabilityId: string; success: boolean; durationMs: number };
  "capability:permission-denied": { capabilityId: string; reason: string };

  // ─── Automation Events ───────────────────────────────────────
  "automation:triggered": { automationId: string; trigger: string };
  "automation:step-completed": { automationId: string; step: string };
  "automation:completed": { automationId: string; success: boolean };
  "automation:failed": { automationId: string; error: string };
}

export type JarvisEventName = keyof JarvisEventMap;
export type JarvisEventPayload<T extends JarvisEventName> = JarvisEventMap[T];
