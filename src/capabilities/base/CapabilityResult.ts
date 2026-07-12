/**
 * Jarvis Capability Engine — Capability Result
 *
 * Every capability must return this strongly-typed result object.
 * This guarantees consistent error handling, logging, and metrics gathering.
 */

export interface CapabilityResult<T> {
  success: boolean;
  /** The data returned on success */
  data?: T;
  /** The error returned on failure */
  error?: string;
  /** Capability identifier for telemetry */
  capabilityId: string;
  /** Execution time in milliseconds */
  durationMs: number;
}
