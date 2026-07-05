/**
 * Jarvis Timing Constants
 *
 * Centralized timing values for animations, polling intervals, timeouts.
 * Never use magic numbers for time in component code.
 */

/** Animation duration in milliseconds */
export const AnimationDuration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
  springFast: "0.3s cubic-bezier(0.19,1,0.22,1)",
  spring: "0.5s cubic-bezier(0.19,1,0.22,1)",
  springLong: "0.8s cubic-bezier(0.19,1,0.22,1)",
} as const;

/** Polling intervals in milliseconds */
export const PollInterval = {
  /** System telemetry refresh */
  telemetryFast: 1000,
  telemetryNormal: 2000,
  telemetrySlow: 5000,

  /** Ollama health check */
  ollamaHealthCheck: 10_000,

  /** Memory indexing */
  memoryIndex: 60_000,

  /** Model discovery */
  modelDiscovery: 30_000,

  /** Notification auto-dismiss */
  notificationDismiss: 5000,
} as const;

/** Timeout values in milliseconds */
export const Timeout = {
  /** Ollama connection timeout */
  ollamaConnect: 5_000,

  /** Ollama first token timeout */
  ollamaFirstToken: 30_000,

  /** Capability execution timeout */
  capabilityDefault: 30_000,
  capabilityLong: 120_000,

  /** UI debounce for search inputs */
  searchDebounce: 300,
  inputDebounce: 150,
} as const;

/** Stagger delays for list animations in milliseconds */
export const StaggerDelay = {
  fast: 40,
  normal: 80,
  slow: 120,
} as const;
