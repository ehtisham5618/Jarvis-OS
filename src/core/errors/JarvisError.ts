/**
 * Jarvis Error Hierarchy
 *
 * All errors thrown within the Jarvis platform extend JarvisError.
 * This ensures consistent error handling, logging, and recovery across the system.
 *
 * Error code convention: DOMAIN_SNAKE_CASE
 * e.g., "CAPABILITY_PERMISSION_DENIED", "SERVICE_OLLAMA_UNAVAILABLE"
 */

export type JarvisErrorCode = string;

export interface JarvisErrorContext {
  /** Which module/service threw this error */
  module?: string;
  /** Which operation was being performed */
  operation?: string;
  /** Additional structured context for debugging */
  metadata?: Record<string, unknown>;
  /** The original error that caused this one, if any */
  cause?: Error;
}

/**
 * Base error class for all Jarvis platform errors.
 * Always catch and handle JarvisError specifically before falling back to generic Error.
 */
export class JarvisError extends Error {
  public readonly code: JarvisErrorCode;
  public readonly module: string;
  public readonly operation: string;
  public readonly metadata: Record<string, unknown>;
  public readonly timestamp: string;
  public override readonly cause?: Error;

  constructor(message: string, code: JarvisErrorCode, context: JarvisErrorContext = {}) {
    super(message);
    this.name = "JarvisError";
    this.code = code;
    this.module = context.module ?? "unknown";
    this.operation = context.operation ?? "unknown";
    this.metadata = context.metadata ?? {};
    this.cause = context.cause;
    this.timestamp = new Date().toISOString();

    // Maintains proper prototype chain in transpiled ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      module: this.module,
      operation: this.operation,
      metadata: this.metadata,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  toString(): string {
    return `[${this.code}] ${this.module}::${this.operation} — ${this.message}`;
  }
}
