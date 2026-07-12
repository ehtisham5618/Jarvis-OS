/**
 * Jarvis Capability Engine — Execution Context
 *
 * Provides contextual information to capabilities when they execute.
 * Used for logging, permission checks, and telemetry.
 */

import type { AutonomyLevel } from "@/services/interfaces/IUserService";

export interface CapabilityContext {
  /** The unique ID of the intent or automation that triggered this */
  traceId: string;
  
  /** The current autonomy level of the user */
  autonomyLevel: AutonomyLevel;

  /** 
   * Indicates if this execution is running in a sandbox.
   * Sandboxed executions cannot mutate real OS state.
   */
  isSandboxed: boolean;

  /** Any additional metadata passed from the caller */
  metadata?: Record<string, unknown>;
}
