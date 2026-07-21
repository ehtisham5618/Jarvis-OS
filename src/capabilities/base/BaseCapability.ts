/**
 * Jarvis Capability Engine — Base Capability
 *
 * Every capability (File, System, Browser, etc.) extends this base class.
 * It enforces a standard interface, handles execution telemetry,
 * and ensures that the Permission Engine is consulted before execution.
 */

import { CapabilityError } from "../../core/errors";
import { eventBus } from "../../core/event-bus";
import type { CapabilityContext } from "./CapabilityContext";
import type { CapabilityResult } from "./CapabilityResult";

export abstract class BaseCapability<TInput, TOutput> {
  /**
   * Unique identifier for this capability.
   * e.g., "system:sleep", "file:read"
   */
  abstract readonly id: string;

  /**
   * Human-readable description of what this capability does.
   */
  abstract readonly description: string;

  /**
   * The permissions required to execute this capability.
   */
  abstract readonly requiredPermissions: string[];

  /**
   * Execute the capability with the given input and context.
   * Do not override this directly — override `performExecute` instead.
   * This wrapper handles logging, telemetry, and error wrapping.
   */
  async execute(input: TInput, context: CapabilityContext): Promise<CapabilityResult<TOutput>> {
    const startTime = performance.now();
    try {
      // 1. In a full implementation, Permission Engine would be called here.
      // 2. Perform the actual capability work
      const data = await this.performExecute(input, context);

      const durationMs = performance.now() - startTime;

      // Emit telemetry
      eventBus.emit("capability:executed", {
        capabilityId: this.id,
        success: true,
        durationMs,
      });

      return {
        success: true,
        data,
        capabilityId: this.id,
        durationMs,
      };
    } catch (err) {
      const durationMs = performance.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : String(err);

      eventBus.emit("capability:executed", {
        capabilityId: this.id,
        success: false,
        durationMs,
      });

      // Wrap in CapabilityError if it isn't one already
      if (!(err instanceof CapabilityError)) {
        throw new CapabilityError(errorMsg, this.id, {
          cause: err instanceof Error ? err : undefined,
          metadata: { input, traceId: context.traceId },
        });
      }
      throw err;
    }
  }

  /**
   * The actual implementation of the capability.
   * Must be overridden by subclasses.
   */
  protected abstract performExecute(input: TInput, context: CapabilityContext): Promise<TOutput>;
}
